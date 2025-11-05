/**
 * @license
 * Copyright 2024 INFINITUS Sistemas Inteligentes LTDA.
 * CNPJ: 09.371.580/0001-06
 *
 * Este código é propriedade da INFINITus Sistemas Inteligentes LTDA.
 * A cópia, distribuição, modificação ou uso não autorizado deste código,
 * no todo ou em parte, é estritamente proibido.
 * Todos os direitos reservados.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
// FIX: Import the AllData type to resolve the name not found error.
import { type AuditRecord, type TeamProposal, type TeamComposition, type AllData } from './types';
import { APP_VERSION } from './constants';
import { getAllData as loadFromDB, saveAllData as saveToDB } from './utils/db';
import * as fileSystem from './utils/fileSystem';
import { MainLayout } from './layouts/MainLayout';
import { UserPortal } from './components/UserPortal';
import { AdminPortal, type StorageMode } from './components/AdminPortal';
import { AUDIT_LOG_KEY, PROPOSAL_LOG_KEY, TEAMS_KEY } from './constants';
import { loadFromStorage, isValidAuditLog, isValidProposalLog, isValidTeamsLog, removeFromStorage } from './utils/storage';
import { SmartHintsProvider } from './components/SmartHintsProvider';
// INCREMENT 3: Super Admin Panel Components
import SuperAdminDashboard from './components/SuperAdminDashboard';
import TenantManager from './components/TenantManager';
import InstitutionalReports from './components/InstitutionalReports';
// Version Selector
import VersionSelector from './components/VersionSelector';

export default function App() {
  const [selectedVersion, setSelectedVersion] = useState<'standard' | 'premium' | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode>('loading');
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [auditLog, setAuditLog] = useState<AuditRecord[]>([]);
  const [proposalLog, setProposalLog] = useState<TeamProposal[]>([]);
  const [teams, setTeams] = useState<TeamComposition[]>([]);

  // Check for saved version selection on mount
  useEffect(() => {
    const savedVersion = localStorage.getItem('sisgead-version') as 'standard' | 'premium' | null;
    setSelectedVersion(savedVersion);
  }, []);

  const saveAllData = useCallback(async (data: AllData) => {
    // This function now handles both storage modes and the fallback logic.
    if (storageMode === 'fileSystem') {
      const freshHandle = await fileSystem.getStoredDirectoryHandle();
      if (freshHandle) {
        // Re-verify permission before every write operation to handle stale permissions.
        // Allow requesting permission since this is triggered by user action (saving data)
        const hasPermission = await fileSystem.verifyPermission(freshHandle, true);
        if (hasPermission) {
          const backupData = {
            ...data,
            backupVersion: APP_VERSION,
            timestamp: new Date().toISOString(),
          };
          // Attempt to write to the file system.
          const success = await fileSystem.writeFile(freshHandle, backupData);
          if (success) {
            return; // Success! We are done.
          }
        }
        
        // If permission was lost, or writing failed for any reason, fall back to IndexedDB.
        alert("A conexão com a pasta local foi perdida ou falhou. Para garantir que seus dados não sejam perdidos, eles foram salvos no armazenamento interno do navegador. Você pode reconectar a pasta no painel de controle.");
        setStorageMode('indexedDB'); // Switch mode in UI
        await fileSystem.clearStoredDirectoryHandle(); // Clean up invalid handle
        await saveToDB(data); // Save the current data to IndexedDB
        
      } else {
        // Handle was not found, should not happen in fileSystem mode but as a safeguard, save to IndexedDB.
        console.warn("Tentativa de salvar no modo de sistema de arquivos, mas nenhum 'handle' foi encontrado. Salvando no IndexedDB.");
        setStorageMode('indexedDB');
        await saveToDB(data);
      }
    } else {
      // Default mode is IndexedDB.
      await saveToDB(data);
    }
  }, [storageMode]);


  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // One-time migration from legacy localStorage to IndexedDB
        const legacyAuditLog = loadFromStorage(AUDIT_LOG_KEY, isValidAuditLog, []);
        if (legacyAuditLog.length > 0) {
          console.log("Migrating legacy data from localStorage to IndexedDB...");
          const legacyProposalLog = loadFromStorage(PROPOSAL_LOG_KEY, isValidProposalLog, []);
          const legacyTeams = loadFromStorage(TEAMS_KEY, isValidTeamsLog, []);
          await saveToDB({ auditLog: legacyAuditLog, proposalLog: legacyProposalLog, teams: legacyTeams });
          removeFromStorage(AUDIT_LOG_KEY);
          removeFromStorage(PROPOSAL_LOG_KEY);
          removeFromStorage(TEAMS_KEY);
          alert("Seus dados foram migrados para um novo formato mais robusto para evitar perdas.");
        }

        // Check for File System API support and stored handle
        if (fileSystem.isFileSystemApiSupported()) {
          const handle = await fileSystem.getStoredDirectoryHandle();
          if (handle) {
            let permissionGranted = false;
            try {
              // Race the permission check against a timeout to prevent freezing on stale handles
              // Use checkPermission (not verifyPermission) to avoid requesting permission during app load
              const permissionPromise = fileSystem.checkPermission(handle);
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Permission check timed out')), 3000)
              );
              permissionGranted = await Promise.race([permissionPromise, timeoutPromise]) as boolean;
            } catch (error) {
              console.warn("Permission check failed or timed out:", error);
              permissionGranted = false;
              alert('A conexão com a pasta local foi perdida (provavelmente o navegador foi reiniciado). A aplicação usará o armazenamento interno. Você pode reconectar à pasta no painel de controle.');
              await fileSystem.clearStoredDirectoryHandle();
            }
            
            if (permissionGranted) {
              setDirHandle(handle);
              setStorageMode('fileSystem');
              const fileData = await fileSystem.readFile<any>(handle);
              if (fileData && fileData.auditLog) {
                setAuditLog(fileData.auditLog);
                setProposalLog(fileData.proposalLog || []);
                setTeams(fileData.teams || []);
              } else {
                // File not found in directory, use DB data as a base to start
                const dbData = await loadFromDB();
                setAuditLog(dbData.auditLog);
                setProposalLog(dbData.proposalLog);
                setTeams(dbData.teams);
              }
              return;
            }
          }
        }

        // Default to IndexedDB
        setStorageMode('indexedDB');
        const dbData = await loadFromDB();
        setAuditLog(dbData.auditLog);
        setProposalLog(dbData.proposalLog);
        setTeams(dbData.teams);
      } catch (error) {
        console.error("FATAL: Failed to initialize storage. Starting with empty state.", error);
        alert(`ERRO CRÍTICO: Falha ao inicializar armazenamento de dados. 

Detalhes técnicos: ${error instanceof Error ? error.message : 'Erro desconhecido'}

A aplicação iniciará com um estado limpo para evitar problemas. Verifique o console do navegador (F12) para mais detalhes técnicos.`);
        setStorageMode('indexedDB'); // Fallback to a safe mode
        setAuditLog([]);
        setProposalLog([]);
        setTeams([]);
      }
    };

    initializeStorage();
  }, []);

  const updateAuditLog = useCallback(async (newLog: AuditRecord[]) => {
    setAuditLog(newLog);
    await saveAllData({ auditLog: newLog, proposalLog, teams });
  }, [proposalLog, teams, saveAllData]);

  const updateProposalLog = useCallback(async (newLog: TeamProposal[]) => {
    setProposalLog(newLog);
    await saveAllData({ auditLog, proposalLog: newLog, teams });
  }, [auditLog, teams, saveAllData]);

  const updateTeams = useCallback(async (newTeams: TeamComposition[]) => {
    setTeams(newTeams);
    await saveAllData({ auditLog, proposalLog, teams: newTeams });
  }, [auditLog, proposalLog, saveAllData]);

  const handleUserRecordSubmit = useCallback(async (recordToSubmit: AuditRecord) => {
    const existingRecordIndex = auditLog.findIndex(r => r.id === recordToSubmit.id);
    let newLog;

    if (existingRecordIndex > -1) {
        newLog = [...auditLog];
        newLog[existingRecordIndex] = recordToSubmit;
    } else {
        newLog = [recordToSubmit, ...auditLog];
    }
    await updateAuditLog(newLog);
  }, [auditLog, updateAuditLog]);

  const handleFullBackup = useCallback(() => {
    const backupData = {
      auditLog,
      proposalLog,
      teams,
      backupVersion: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_sisgead_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [auditLog, proposalLog, teams]);

  const mergeAllData = useCallback(async (backupData: { auditLog?: AuditRecord[], proposalLog?: TeamProposal[], teams?: TeamComposition[] }): Promise<{ type: string; imported: number; skipped: number }[]> => {
      const results = [];
      let anythingChanged = false;

      const existingCpfs = new Set(auditLog.map(r => r.cpf));
      const newAuditRecords = backupData.auditLog?.filter(r => r.cpf && !existingCpfs.has(r.cpf)) || [];
      const finalAuditLog = newAuditRecords.length > 0 ? [...newAuditRecords, ...auditLog] : auditLog;
      if (newAuditRecords.length > 0) anythingChanged = true;
      results.push({ type: 'Registros', imported: newAuditRecords.length, skipped: (backupData.auditLog?.length || 0) - newAuditRecords.length });

      const existingProposalIds = new Set(proposalLog.map(p => p.id));
      const newProposals = backupData.proposalLog?.filter(p => p.id && !existingProposalIds.has(p.id)) || [];
      const finalProposalLog = newProposals.length > 0 ? [...newProposals, ...proposalLog] : proposalLog;
      if (newProposals.length > 0) anythingChanged = true;
      results.push({ type: 'Propostas', imported: newProposals.length, skipped: (backupData.proposalLog?.length || 0) - newProposals.length });

      const existingTeamIds = new Set(teams.map(t => t.id));
      const newTeams = backupData.teams?.filter(t => t.id && !existingTeamIds.has(t.id)) || [];
      const finalTeams = newTeams.length > 0 ? [...newTeams, ...teams] : teams;
      if (newTeams.length > 0) anythingChanged = true;
      results.push({ type: 'Equipes', imported: newTeams.length, skipped: (backupData.teams?.length || 0) - newTeams.length });
      
      if (anythingChanged) {
        setAuditLog(finalAuditLog);
        setProposalLog(finalProposalLog);
        setTeams(finalTeams);
        await saveAllData({ auditLog: finalAuditLog, proposalLog: finalProposalLog, teams: finalTeams });
      }
      
      return results;
  }, [auditLog, proposalLog, teams, saveAllData]);

  const handleSwitchToFS = useCallback(async () => {
    const handle = await fileSystem.requestDirectoryHandle();
    if (!handle) return;

    const existingFileData = await fileSystem.readFile<any>(handle);
    const currentData = { auditLog, proposalLog, teams };

    const applyFSMode = (data: AllData) => {
      setAuditLog(data.auditLog);
      setProposalLog(data.proposalLog);
      setTeams(data.teams);
      setDirHandle(handle);
      setStorageMode('fileSystem');
    };

    const saveCurrentDataToFS = async () => {
      const backupData = {
        ...currentData,
        backupVersion: APP_VERSION,
        timestamp: new Date().toISOString(),
      };
      const success = await fileSystem.writeFile(handle, backupData);
      if (success) {
        applyFSMode(currentData);
        return true;
      }
      return false;
    };

    if (existingFileData && existingFileData.auditLog) {
      const loadExisting = window.confirm(
        "Encontramos um arquivo de dados ('sisgead-database.json') nesta pasta.\n\n" +
        "Clique em 'OK' para carregar os dados deste arquivo (isso substituirá os dados da sessão atual).\n" +
        "Clique em 'Cancelar' para ter a opção de sobrescrever o arquivo com os dados da sessão atual."
      );

      if (loadExisting) {
        applyFSMode({
          auditLog: existingFileData.auditLog,
          proposalLog: existingFileData.proposalLog || [],
          teams: existingFileData.teams || [],
        });
        alert('Repositório local conectado e dados carregados com sucesso!');
      } else {
        const overwrite = window.confirm(
          "AVISO: Tem certeza de que deseja sobrescrever o arquivo na pasta selecionada com os dados da sua sessão atual? Esta ação não pode ser desfeita."
        );
        if (overwrite) {
          const success = await saveCurrentDataToFS();
          if (success) {
            alert('Repositório local conectado e dados da sessão atual foram salvos na pasta, sobrescrevendo os dados anteriores.');
          } else {
            alert('Falha ao sobrescrever os dados no diretório selecionado.');
            await fileSystem.clearStoredDirectoryHandle();
          }
        } else {
          alert('Operação cancelada. A aplicação continuará usando o armazenamento anterior.');
          // Do not clear the handle, just abort the connection process
        }
      }
    } else {
      // Folder is new or file is empty, just save current data
      const success = await saveCurrentDataToFS();
      if (success) {
        alert('Repositório local conectado com sucesso! Os dados da sessão atual foram salvos na pasta.');
      } else {
        alert('Falha ao salvar os dados no diretório selecionado.');
        await fileSystem.clearStoredDirectoryHandle();
      }
    }
  }, [auditLog, proposalLog, teams]);

  const checkIfCpfExists = (cpf: string): AuditRecord | undefined => {
    return auditLog.find(record => record.cpf === cpf);
  };

  const handleVersionSelection = (version: 'standard' | 'premium') => {
    setSelectedVersion(version);
  };
  
  // Show version selector if no version has been chosen
  if (selectedVersion === null) {
    return (
      <SmartHintsProvider>
        <MainLayout>
          <VersionSelector onVersionSelected={handleVersionSelection} />
        </MainLayout>
      </SmartHintsProvider>
    );
  }
  
  return (
    <SmartHintsProvider>
      <MainLayout>
        {storageMode === 'loading' ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <p className="text-lg text-brand-secondary">Carregando base de dados...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={
              <AdminPortal
                auditLog={auditLog}
                proposalLog={proposalLog}
                teams={teams}
                updateAuditLog={updateAuditLog}
                updateProposalLog={updateProposalLog}
                updateTeams={updateTeams}
                handleFullBackup={handleFullBackup}
                mergeAllData={mergeAllData}
                storageMode={storageMode}
                handleSwitchToFS={handleSwitchToFS}
              />
            }/>
            <Route path="/user" element={
              <UserPortal 
                checkIfCpfExists={checkIfCpfExists}
                onRecordSubmit={handleUserRecordSubmit}
              />
            } />
            {/* INCREMENT 3: Super Admin Panel Routes - Only available in Premium version */}
            {selectedVersion === 'premium' && (
              <>
                <Route path="/institutional" element={<SuperAdminDashboard />} />
                <Route path="/institutional/tenants" element={<TenantManager />} />
                <Route path="/institutional/reports" element={<InstitutionalReports />} />
              </>
            )}
          </Routes>
        )}
      </MainLayout>
    </SmartHintsProvider>
  );
}
// bycao (ogrorvatigão) 2025