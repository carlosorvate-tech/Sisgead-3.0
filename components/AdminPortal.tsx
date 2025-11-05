import React, { useState, useEffect } from 'react';
import { type AuditRecord, type TeamProposal, type TeamComposition, type AiProvider, type AiStatus } from '../types';
import { createVerificationHash } from '../utils/crypto';
import { AdminDashboard } from './AdminDashboard';
import { LandingScreen } from './LandingScreen';
import { Modal } from './Modal';
import { PrintIcon } from './icons';
import { isMockModeEnabled } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useProposalPrint } from '../utils/hooks/usePrint';


export type StorageMode = 'loading' | 'indexedDB' | 'fileSystem';

type BackupData = {
    auditLog?: AuditRecord[],
    proposalLog?: TeamProposal[],
    teams?: TeamComposition[]
};

interface AdminPortalProps {
    auditLog: AuditRecord[];
    proposalLog: TeamProposal[];
    teams: TeamComposition[];
    updateAuditLog: (newLog: AuditRecord[]) => Promise<void>;
    updateProposalLog: (newLog: TeamProposal[]) => Promise<void>;
    updateTeams: (newTeams: TeamComposition[]) => Promise<void>;
    handleFullBackup: () => void;
    mergeAllData: (backupData: BackupData) => Promise<{ type: string, imported: number, skipped: number }[]>;
    storageMode: StorageMode;
    handleSwitchToFS: () => Promise<void>;
}

export const AdminPortal: React.FC<AdminPortalProps> = (props) => {
    const { auditLog, proposalLog, teams, updateAuditLog, updateProposalLog, updateTeams, handleFullBackup, mergeAllData, storageMode, handleSwitchToFS } = props;

    const [view, setView] = useState<'landing' | 'dashboard'>('landing');
    const [showImportModal, setShowImportModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [proposalModalContent, setProposalModalContent] = useState<TeamProposal | null>(null);
    const [pdfViewerContent, setPdfViewerContent] = useState<{name: string, data: string} | null>(null);
    const [documentModalContent, setDocumentModalContent] = useState<{title: string, content: string} | null>(null);
    
    const [aiProvider, setAiProvider] = useState<AiProvider>('gemini');
    const [aiStatus, setAiStatus] = useState<AiStatus>({
        provider: 'gemini',
        isConnected: false,
        message: 'Verificando status da IA...'
    });

    const { printProposal } = useProposalPrint();

    useEffect(() => {
        document.title = "Sisgead - Sistema de Gestão de Equipes";
        
        const checkStatus = () => {
            if (isMockModeEnabled()) {
                setAiStatus({ provider: 'mock', isConnected: true, message: '🔧 Modo Simulação Ativo - Funcionalidade completa disponível offline' });
                setAiProvider('mock');
            } else if (process.env.GEMINI_API_KEY || process.env.API_KEY) {
                setAiStatus({ provider: 'gemini', isConnected: true, message: '✅ Conectado ao Google Gemini - IA totalmente funcional' });
            } else {
                // Auto-fallback para modo simulação
                setAiStatus({ provider: 'mock', isConnected: true, message: '⚡ Modo Simulação Automático - Sistema funcional sem necessidade de configuração' });
                setAiProvider('mock');
            }
        };
        checkStatus();
    }, []);

    const handleShowDocument = (title: string, content: string) => {
        setDocumentModalContent({ title, content });
    };

    const ShareLinkModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
        const [linkCopySuccess, setLinkCopySuccess] = useState(false);
        const userPortalUrl = `${window.location.origin}${window.location.pathname}#/user`;

        const copyToClipboard = (text: string) => {
            navigator.clipboard.writeText(text).then(() => {
                setLinkCopySuccess(true);
                setTimeout(() => {
                    setLinkCopySuccess(false);
                }, 2000);
            });
        };

        return (
            <Modal title="Compartilhar Link com Entrevistado" onClose={onClose} size="lg">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-md font-semibold text-gray-800 mb-2">Link para o Questionário</h3>
                        <p className="text-sm text-gray-600 mb-2">Envie este link para que o colaborador possa realizar a avaliação.</p>
                        <div className="flex gap-2">
                            <input type="text" readOnly value={userPortalUrl} className="w-full p-2 border bg-gray-100 border-gray-300 rounded-md font-mono text-sm font-semibold text-brand-primary" />
                            <button onClick={() => copyToClipboard(userPortalUrl)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                                {linkCopySuccess ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    };
    
    const ImportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
        const [dataString, setDataString] = useState('');
        const [pdfFile, setPdfFile] = useState<File | null>(null);
        const [parsedRecord, setParsedRecord] = useState<AuditRecord | null>(null);
        const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error' | 'validating'>('idle');

        const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
            const pastedText = event.clipboardData.getData('text');
            setDataString(pastedText);
            setValidationStatus('validating');
            try {
                const decodedString = atob(pastedText);
                const record = JSON.parse(decodedString) as AuditRecord;
                
                if (!record.name || !record.cpf || !record.scores || !record.verificationHash) throw new Error("Dados inválidos.");
                
                const recalculatedHash = await createVerificationHash(record);
                setParsedRecord(record);
                setValidationStatus(recalculatedHash === record.verificationHash ? 'success' : 'error');
            } catch (e) {
                console.error("Error parsing data string:", e);
                setParsedRecord(null);
                setValidationStatus('error');
            }
        };

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files?.[0]) setPdfFile(event.target.files[0]);
        };

        const handleSave = async () => {
            if (!parsedRecord) return;
            
            const processAndSave = async (pdfDataUrl?: string) => {
                const recordToSave: AuditRecord = { ...parsedRecord, reportPdfBase64: pdfDataUrl };
                const updatedLog = [recordToSave, ...auditLog];
                await updateAuditLog(updatedLog);
                onClose();
            };

            if (pdfFile) {
                const reader = new FileReader();
                reader.onload = (e) => processAndSave(e.target?.result as string);
                reader.readAsDataURL(pdfFile);
            } else {
                await processAndSave();
            }
        };

        return (
            <Modal title="Adicionar Novo Registro" onClose={onClose}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">1. Cole a "String de Dados" do Usuário</label>
                        <textarea rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Cole os dados aqui..." value={dataString} onPaste={handlePaste} onChange={(e) => setDataString(e.target.value)} />
                    </div>

                    {validationStatus === 'validating' && <p className="text-sm text-gray-500">Validando...</p>}
                    {validationStatus === 'success' && <div className="p-3 bg-green-100 border border-green-300 rounded-md text-sm text-green-800">✅ Validação de integridade bem-sucedida!</div>}
                    {validationStatus === 'error' && <div className="p-3 bg-red-100 border border-red-300 rounded-md text-sm text-red-800">⚠️ **Alerta:** A validação de integridade falhou. Verifique os dados.</div>}

                    {parsedRecord && (
                        <div className="p-4 border rounded-lg bg-slate-50 text-sm">
                            <h4 className="font-semibold mb-2">Dados Extraídos:</h4>
                            <p><strong>Nome:</strong> {parsedRecord.name}, <strong>CPF:</strong> {parsedRecord.cpf}, <strong>Perfil:</strong> {parsedRecord.primaryProfile}</p>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">2. (Opcional) Anexe o PDF para Auditoria</label>
                        <input type="file" accept=".pdf" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                </div>
                 <div className="mt-6 pt-4 border-t flex justify-end">
                    <button onClick={handleSave} disabled={!parsedRecord} className="px-6 py-2 bg-brand-primary text-white rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">Confirmar e Salvar</button>
                </div>
            </Modal>
        );
    };

    if (view === 'landing') {
        return (
            <>
                <LandingScreen 
                    onShowAdminLogin={() => setView('dashboard')} 
                    onShowDocumentation={handleShowDocument}
                    onShareLink={() => setShowShareModal(true)}
                />
                
                {showShareModal && <ShareLinkModal onClose={() => setShowShareModal(false)} />}
                
                {documentModalContent && 
                    <Modal title={documentModalContent.title} onClose={() => setDocumentModalContent(null)} footerContent={<button onClick={() => setDocumentModalContent(null)} className="px-6 py-2 bg-brand-primary text-white rounded-md">Fechar</button>}>
                        <MarkdownRenderer content={documentModalContent.content} />
                    </Modal>
                }
            </>
        );
    }

    return (
        <>
            {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} />}
            
            {proposalModalContent &&
                <Modal title="Proposta Formal de Equipe" onClose={() => setProposalModalContent(null)} footerContent={
                    <button onClick={() => printProposal()} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 print-hidden"><PrintIcon/> Imprimir / Salvar PDF</button>
                }>
                    <div className="printable-section">
                        <div className="flex justify-between items-start mb-4 text-sm">
                            <div><span className="font-bold text-slate-600 block">ID da Proposta:</span><p className="font-mono text-brand-dark">{proposalModalContent.id}</p></div>
                            <div className="text-right"><span className="font-bold text-slate-600 block">Data:</span><p className="text-brand-dark">{new Date(proposalModalContent.date).toLocaleString('pt-BR')}</p></div>
                        </div>
                        <div className="mt-6 pt-4 border-t"><h4 className="font-bold text-slate-600">Consulta Realizada:</h4><p className="text-brand-secondary italic mt-1">"{proposalModalContent.query}"</p></div>
                        <div className="mt-6 pt-4 border-t"><h4 className="font-bold text-slate-600">Sugestão da IA:</h4><div className="prose prose-sm max-w-none mt-2 text-brand-dark whitespace-pre-wrap break-words">{proposalModalContent.response}</div></div>
                    </div>
                </Modal>
            }
            {pdfViewerContent && (
                 <Modal title={`Relatório PDF - ${pdfViewerContent.name}`} onClose={() => setPdfViewerContent(null)}>
                    <iframe src={pdfViewerContent.data} className="w-full h-[70vh]" title={`PDF Preview for ${pdfViewerContent.name}`}></iframe>
                 </Modal>
            )}
            
            <AdminDashboard
                auditLog={auditLog} proposalLog={proposalLog} teams={teams}
                updateAuditLog={updateAuditLog} updateProposalLog={updateProposalLog} updateTeams={updateTeams}
                handleFullBackup={handleFullBackup}
                mergeAllData={mergeAllData}
                onLogout={() => setView('landing')} onAddRecord={() => setShowImportModal(true)}
                onViewProposal={setProposalModalContent} onViewPdf={setPdfViewerContent}
                aiStatus={aiStatus}
                aiProvider={aiProvider}
                setAiProvider={setAiProvider}
                storageMode={storageMode}
                handleSwitchToFS={handleSwitchToFS}
            />
        </>
    );
};
// bycao (ogrorvatigão) 2025