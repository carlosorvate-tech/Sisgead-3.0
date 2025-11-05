import React, { useState, useRef } from 'react';
import { type AuditRecord, type TeamProposal, type TeamComposition, type AiProvider, type AiStatus } from '../types';
import { CsvIcon, TrashIcon, InfoIcon, LightBulbIcon, PdfIcon, UsersIcon, CollectionIcon, ClipboardListIcon, ChartIcon, UploadIcon, CsvIcon as CsvIcon2, ShieldCheckIcon } from './icons';
import { StructuredTooltip } from './Tooltip';
import VersionMigration from './VersionMigration';

// Ícone para configurações
const SettingsIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
import { TeamReportView } from './TeamReportView';
import { TeamBuilder } from './TeamBuilder';
import { PortfolioView } from './PortfolioView';
import { isMockModeEnabled } from '../services/geminiService';
import { isFileSystemApiSupported } from '../utils/fileSystem';
import { APP_VERSION } from '../constants';
import { type StorageMode } from './AdminPortal';

type AdminView = 'logs' | 'report' | 'proposals' | 'teamBuilder' | 'portfolio' | 'settings';

type BackupData = {
    auditLog?: AuditRecord[],
    proposalLog?: TeamProposal[],
    teams?: TeamComposition[]
};

interface AdminDashboardProps {
    auditLog: AuditRecord[];
    proposalLog: TeamProposal[];
    teams: TeamComposition[];
    updateAuditLog: (log: AuditRecord[]) => Promise<void>;
    updateProposalLog: (log: TeamProposal[]) => Promise<void>;
    updateTeams: (teams: TeamComposition[]) => Promise<void>;
    handleFullBackup: () => void;
    mergeAllData: (backupData: BackupData) => Promise<{ type: string, imported: number, skipped: number }[]>;
    onLogout: () => void;
    onAddRecord: () => void;
    onViewProposal: (proposal: TeamProposal) => void;
    onViewPdf: (pdf: {name: string, data: string}) => void;
    aiStatus: AiStatus;
    aiProvider: AiProvider;
    setAiProvider: (provider: AiProvider) => void;
    storageMode: StorageMode;
    handleSwitchToFS: () => Promise<void>;
}

const StorageManager: React.FC<{
  storageMode: StorageMode;
  onSwitchToFS: () => Promise<void>;
}> = ({ storageMode, onSwitchToFS }) => {
  const [isSwitching, setIsSwitching] = useState(false);
  
  const handleSwitch = async () => {
    if (!window.confirm("Isso pedirá que você escolha uma pasta no seu computador para salvar todos os dados da aplicação. Este método é mais seguro e facilita backups. Deseja continuar?")) return;
    setIsSwitching(true);
    try {
      await onSwitchToFS();
    } catch (error) {
      console.error("Failed to switch to FS mode:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`⚠️ Erro ao conectar pasta: ${errorMessage}`);
      setIsSwitching(false);
    }
  };

  const statusText: Record<StorageMode, string> = {
    loading: 'Carregando...',
    indexedDB: 'Dados salvos no navegador (Padrão)',
    fileSystem: 'Dados salvos em pasta local (Recomendado)'
  };

  const statusColor: Record<StorageMode, string> = {
    loading: 'text-slate-600',
    indexedDB: 'text-amber-700',
    fileSystem: 'text-green-700'
  }

  return (
    <div className="p-3 bg-slate-50 rounded-lg border">
      <h4 className="text-sm font-semibold text-brand-dark mb-1">Gerenciamento de Armazenamento</h4>
      <p className="text-xs text-slate-600 mb-2">Status: <strong className={statusColor[storageMode]}>{statusText[storageMode]}</strong></p>
      {storageMode === 'indexedDB' && isFileSystemApiSupported() && (
        <>
          <button onClick={handleSwitch} disabled={isSwitching} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400">
            <ShieldCheckIcon /> {isSwitching ? 'Processando...' : 'Conectar a uma Pasta Local'}
          </button>
        </>
      )}
    </div>
  );
};


export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { auditLog, proposalLog, teams, updateAuditLog, updateProposalLog, updateTeams, handleFullBackup, mergeAllData, onLogout, onAddRecord, onViewProposal, onViewPdf, aiStatus, aiProvider, setAiProvider, storageMode, handleSwitchToFS } = props;
    const [view, setView] = useState<AdminView>('logs');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleDeleteProposal = async (proposalId: string) => {
        if (window.confirm("Tem certeza de que deseja excluir esta proposta?")) {
            const updatedLog = proposalLog.filter(p => p.id !== proposalId);
            await updateProposalLog(updatedLog);
        }
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const backupData = JSON.parse(text);
                
                if (!backupData.auditLog || !backupData.proposalLog || !backupData.teams) {
                    throw new Error("Formato de backup inválido ou arquivo corrompido.");
                }

                const results = await mergeAllData(backupData);
                const summary = results.map(res => `${res.imported} ${res.type} importado(s), ${res.skipped} ignorado(s).`).join('\n');
                alert(`Importação concluída:\n${summary}`);

            } catch (error: any) {
                console.error("Error importing backup:", error);
                alert(`Ocorreu um erro ao importar o backup: ${error.message}`);
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleDeleteRecord = async (recordId: string) => {
        const recordToDelete = auditLog.find(r => r.id === recordId);
        if (!recordToDelete) return;

        if (window.confirm(`Tem certeza que deseja excluir permanentemente o registro de "${recordToDelete.name}"? Esta ação removerá o colaborador de todas as equipes e é irreversível.`)) {
            const updatedTeams = teams.map(team => ({
                ...team,
                members: team.members.filter(member => member.id !== recordId)
            }));
            await updateTeams(updatedTeams);

            const updatedLog = auditLog.filter(r => r.id !== recordId);
            await updateAuditLog(updatedLog);

            alert(`O registro de "${recordToDelete.name}" foi excluído com sucesso do sistema e removido de todas as equipes.`);
        }
    };

    const handleClearData = async () => {
        if (window.confirm("ATENÇÃO: Esta ação é irreversível e apagará TODOS os registros de auditoria, equipes e propostas. Deseja continuar?")) {
            await updateAuditLog([]);
            await updateProposalLog([]);
            await updateTeams([]);
            alert("Todos os dados foram limpos.");
        }
    };
    
    const renderView = () => {
        switch(view) {
            case 'logs': return <LogsView />;
            case 'report': return <TeamReportView auditLog={auditLog} />;
            case 'proposals': return <ProposalsView />;
            case 'teamBuilder': return <TeamBuilder auditLog={auditLog} teams={teams} updateTeams={updateTeams} proposalLog={proposalLog} updateProposalLog={updateProposalLog} provider={aiProvider} />;
            case 'portfolio': return <PortfolioView teams={teams} updateTeams={updateTeams} auditLog={auditLog} proposalLog={proposalLog} updateProposalLog={updateProposalLog} provider={aiProvider} />;
            case 'settings': return <SettingsView />;
            default: return <LogsView />;
        }
    }
    
    const viewTitles: Record<AdminView, string> = {
        logs: 'Painel de análise',
        report: 'Relatório da Equipe',
        proposals: 'Propostas Geradas',
        teamBuilder: 'Construtor de equipes',
        portfolio: 'Portfólio de Equipes',
        settings: 'Configurações de IA',
    };

    const LogsView: React.FC = () => (
        <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
                <div className="flex-grow space-y-3">
                    <h3 className="text-lg font-semibold">Ações Rápidas</h3>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={onAddRecord} data-action="add-record" className="px-4 py-2 text-sm bg-brand-primary text-white rounded-md shadow-sm hover:bg-blue-700">
                            Adicionar Novo Registro
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />
                        <StructuredTooltip 
                            what="Importar Backup de Dados"
                            how="Clique para carregar arquivo JSON"
                            why="Restaure dados de outras instalações"
                            format="arquivo.json"
                        >
                            <button onClick={handleImportClick} data-action="import-data" className="micro-interactive micro-hover micro-click flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 text-white rounded-md shadow-sm hover:bg-teal-700">
                                <UploadIcon /> Importar Backup
                            </button>
                        </StructuredTooltip>
                        <StructuredTooltip 
                            what="Exportar Backup Completo"
                            how="Clique para baixar arquivo JSON"
                            why="Protege dados contra perda ou migração"
                        >
                            <button onClick={handleFullBackup} data-action="export-backup" className="micro-interactive micro-hover micro-click flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700">
                                <CsvIcon /> Exportar Backup
                            </button>
                        </StructuredTooltip>
                        <StructuredTooltip 
                            what="Limpar Todos os Dados"
                            how="Clique para apagar registros (confirmação)"
                            why="Remove dados para recomeçar sistema"
                        >
                            <button onClick={handleClearData} className="micro-interactive micro-hover micro-click flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700">
                                <TrashIcon /> Limpar Dados
                            </button>
                        </StructuredTooltip>
                    </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                    <StorageManager storageMode={storageMode} onSwitchToFS={handleSwitchToFS} />
                </div>
            </div>
            
            <div className="mb-8">
                 <div className="max-h-96 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome</th>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Perfil</th>
                                <th scope="col" className="px-6 py-3">Área de Atuação</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLog.map(r => (
                                <tr key={r.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{r.name}</td>
                                    <td className="px-6 py-4">{new Date(r.date).toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4 font-bold">
                                        <div className="flex items-center gap-2">
                                            {r.retestReason && <InfoIcon className="w-5 h-5 text-blue-500 cursor-help" title={`Reteste de ${r.previousReportId?.slice(0, 12)}... Motivo: ${r.retestReason}`} />}
                                            <span>{r.primaryProfile} {r.secondaryProfile && `(${r.secondaryProfile})`}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{r.professionalProfile?.primaryArea || 'N/A'}</td>
                                    <td className="px-6 py-4 flex items-center gap-4">
                                        {r.reportPdfBase64 && <button onClick={() => onViewPdf({name: r.name, data: r.reportPdfBase64!})} title="Ver PDF anexado" className="text-gray-500 hover:text-blue-600"><PdfIcon /></button>}
                                        <button onClick={() => handleDeleteRecord(r.id)} title="Excluir este registro" className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
                  {auditLog.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum registro de avaliação encontrado.</p>}
            </div>
        </>
    );

    const ProposalsView: React.FC = () => (
         <div className="animate-fadeIn">
             <h3 className="text-xl font-semibold text-brand-dark mb-4">Histórico de Propostas (Silo de Conhecimento)</h3>
             {proposalLog.length === 0 ? (
                <p className="text-gray-500">Nenhuma proposta foi gerada ainda.</p>
             ) : (
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Consulta</th>
                                <th className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposalLog.map(p => (
                                <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(p.date).toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800 italic">"{p.query}"</td>
                                    <td className="px-6 py-4 flex gap-4">
                                        <button onClick={() => onViewProposal(p)} className="text-blue-600 hover:underline">Ver</button>
                                        <button onClick={() => handleDeleteProposal(p.id)} className="text-red-600 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             )}
        </div>
    );

    const SettingsView: React.FC = () => {
        const [apiKey, setApiKey] = useState('');
        const [isTestingConnection, setIsTestingConnection] = useState(false);
        const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

        const testApiConnection = async () => {
            if (!apiKey.trim()) {
                setTestResult({ success: false, message: 'Por favor, insira uma API Key' });
                return;
            }

            setIsTestingConnection(true);
            setTestResult(null);

            try {
                // Teste básico da API Gemini
                const response = await fetch('https://sisgead-gemini-proxy.carlosorvate-tech.workers.dev', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: 'Teste de conectividade. Responda apenas: "OK"',
                        model: 'gemini-1.5-flash',
                        testApiKey: apiKey
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setTestResult({ 
                        success: true, 
                        message: '✅ Conectividade confirmada! A API Key está funcionando corretamente.' 
                    });
                } else {
                    const errorText = await response.text();
                    setTestResult({ 
                        success: false, 
                        message: `❌ Falha na conexão: ${response.status} - ${errorText}` 
                    });
                }
            } catch (error) {
                setTestResult({ 
                    success: false, 
                    message: `❌ Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
                });
            } finally {
                setIsTestingConnection(false);
            }
        };

        return (
            <div className="space-y-6">
                {/* Status Atual da IA */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Atual da IA</h3>
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`w-3 h-3 rounded-full ${aiStatus.isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        <span className="text-sm font-medium text-gray-700">{aiStatus.message}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong>Provedor Ativo:</strong> {aiProvider === 'mock' ? 'Modo Simulação' : 'Google Gemini'}
                        </div>
                        <div>
                            <strong>Status:</strong> {aiStatus.isConnected ? 'Conectado' : 'Desconectado'}
                        </div>
                    </div>
                </div>

                {/* Configuração da API Key */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração da Google Gemini API</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                                API Key do Google Gemini
                            </label>
                            <input
                                type="password"
                                id="api-key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Cole sua API Key aqui..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Esta chave será enviada para o Cloudflare Worker para configuração segura. Ela não fica armazenada no navegador.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={testApiConnection}
                                disabled={isTestingConnection || !apiKey.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isTestingConnection ? 'Testando...' : 'Testar Conectividade'}
                            </button>
                        </div>

                        {testResult && (
                            <div className={`p-3 rounded-md text-sm ${
                                testResult.success 
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                                {testResult.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Informações sobre os Modos */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Modos de Operação</h3>
                    
                    <div className="space-y-4 text-sm">
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h4 className="font-semibold text-blue-700">🔧 Modo Simulação (Atual)</h4>
                            <p className="text-gray-600 mt-1">
                                Sistema totalmente funcional com respostas simuladas baseadas em melhores práticas. 
                                Ideal para treinamento, testes e operação offline.
                            </p>
                            <p className="text-gray-500 mt-1">
                                <strong>Vantagens:</strong> Zero custos, máxima privacidade, funciona offline.
                            </p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4">
                            <h4 className="font-semibold text-green-700">✅ Modo IA Real (Google Gemini)</h4>
                            <p className="text-gray-600 mt-1">
                                Análises personalizadas e contextuais com pesquisa web integrada. 
                                Ideal para uso profissional com análises específicas.
                            </p>
                            <p className="text-gray-500 mt-1">
                                <strong>Vantagens:</strong> Análises personalizadas, pesquisa web, aprendizado contextual.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Migração de Versão */}
                <VersionMigration 
                    currentVersion={(localStorage.getItem('sisgead-version') as 'standard' | 'premium') || 'standard'}
                    onMigrate={() => {}}
                />

                {/* Instruções */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Como Obter uma API Key</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                        <li>Acesse <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Google AI Studio</a></li>
                        <li>Faça login com sua conta Google</li>
                        <li>Clique em "Create API Key"</li>
                        <li>Copie a chave gerada e cole no campo acima</li>
                        <li>Clique em "Testar Conectividade" para verificar</li>
                    </ol>
                    <p className="mt-3 text-xs text-blue-700">
                        <strong>Nota:</strong> A API do Google Gemini oferece uma cota gratuita generosa para testes e uso moderado.
                    </p>
                </div>
            </div>
        );
    };
    
    return (
        <div className="p-8 animate-fadeIn flex flex-col min-h-[calc(100vh-4rem)]">
            <header className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-brand-dark">{viewTitles[view]}</h2>
                </div>
                 <div className="flex flex-col items-end gap-2">
                    <button onClick={onLogout} className="text-sm text-blue-600 hover:underline">Voltar à Tela Inicial</button>
                    {!isMockModeEnabled() && aiStatus.isConnected && (
                         <StructuredTooltip 
                             what="Indicador de Status IA"
                             how="Mostra conectividade em tempo real"
                             why="Confirma que análises e sugestões funcionarão"
                             position="bottom"
                         >
                             <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg border border-green-200 cursor-help">
                                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                 <span className="text-sm font-medium text-green-700">
                                     Conectado ao Google Gemini - IA totalmente funcional
                                 </span>
                             </div>
                         </StructuredTooltip>
                     )}
                     {!isMockModeEnabled() && !aiStatus.isConnected && (
                         <StructuredTooltip 
                             what="Indicador de Status IA"
                             how="Mostra problema de conectividade"
                             why="Configure API na aba 'Configurações IA'"
                             position="bottom"
                         >
                             <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-200 cursor-help">
                                 <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                 <span className="text-sm font-medium text-red-700">
                                     {aiStatus.message || 'Desconectado da IA'}
                                 </span>
                             </div>
                         </StructuredTooltip>
                     )}
                 </div>
            </header>

            <nav className="border-b border-gray-200 mb-6">
                <div className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton id="logs" icon={<ClipboardListIcon />} label="Registros" />
                    <TabButton id="report" icon={<ChartIcon />} label="Relatório" />
                    <TabButton id="teamBuilder" icon={<UsersIcon />} label="Construtor de equipes" />
                    <TabButton id="portfolio" icon={<CollectionIcon />} label="Portfólio" />
                    <TabButton id="proposals" icon={<LightBulbIcon />} label="Propostas" />
                    <TabButton id="settings" icon={<SettingsIcon />} label="Configurações IA" />
                </div>
            </nav>
            
            <main className="flex-grow">
                {renderView()}
            </main>
            
            <footer className="text-center pt-8 mt-auto border-t border-slate-200">
                <div className="text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} INFINITUS Sistemas Inteligentes LTDA. | CNPJ: 09.371.580/0001-06</p>
                    <p>Versão {APP_VERSION}</p>
                </div>
            </footer>
        </div>
    );

    function TabButton({ id, icon, label }: { id: AdminView, icon: React.ReactNode, label: string }) {
        const isActive = view === id;
        
        // Tooltips contextuais para cada aba
        const getTooltipContent = () => {
            switch (id) {
                case 'logs':
                    return {
                        what: "Aba de Registros",
                        how: "Clique para visualizar histórico de avaliações",
                        why: "Acompanhe perfis DISC de toda a equipe"
                    };
                case 'report':
                    return {
                        what: "Relatório de Distribuição",
                        how: "Clique para ver gráficos da equipe",
                        why: "Analise balanceamento comportamental"
                    };
                case 'teamBuilder':
                    return {
                        what: "Construtor de Equipes IA",
                        how: "Clique para formar equipes inteligentes",
                        why: "Crie times com complementaridade ideal"
                    };
                case 'portfolio':
                    return {
                        what: "Portfólio de Equipes",
                        how: "Clique para gerenciar times criados",
                        why: "Visualize e analise equipes existentes"
                    };
                case 'proposals':
                    return {
                        what: "Histórico de Propostas",
                        how: "Clique para consultar silo de conhecimento",
                        why: "Acesse análises e relatórios anteriores"
                    };
                case 'settings':
                    return {
                        what: "Configurações de IA",
                        how: "Clique para configurar integração Gemini",
                        why: "Configure chave API e teste conectividade"
                    };
                default:
                    return {
                        what: label,
                        how: `Clique para acessar ${label.toLowerCase()}`,
                        why: "Gerencie este aspecto do sistema"
                    };
            }
        };
        
        return (
            <StructuredTooltip {...getTooltipContent()} position="bottom">
                <button onClick={() => setView(id)} data-action={`navigate-${id}`} className={`nav-tab micro-interactive micro-hover micro-click flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    {icon} {label}
                </button>
            </StructuredTooltip>
        );
    }
};
// bycao (ogrorvatigão) 2025