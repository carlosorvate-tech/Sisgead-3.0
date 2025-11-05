import React, { useState } from 'react';
import { type TeamComposition, type AuditRecord, type GeminiModel, type AiAdviceResponse, type TeamProposal, AiProvider, type MediationRecord, CommunicationAnalysis } from '../types';
import { TrashIcon, InfoIcon, SparklesIcon, ExternalLinkIcon, ChatBubbleLeftRightIcon, AdjustmentsHorizontalIcon } from './icons';
import { Modal } from './Modal';
import { getPortfolioAdvice, analyzeTeamCommunication } from '../services/geminiService';
import { generateProposalId } from '../utils/helpers';
import { CommunicationAnalysisModal } from './CommunicationAnalysisModal';
import { MediationModal } from './MediationModal';


interface PortfolioViewProps {
    teams: TeamComposition[];
    updateTeams: (teams: TeamComposition[]) => Promise<void>;
    auditLog: AuditRecord[];
    proposalLog: TeamProposal[];
    updateProposalLog: (log: TeamProposal[]) => Promise<void>;
    provider: AiProvider;
}

// Helper function to format CommunicationAnalysis into Markdown for the knowledge silo
const formatCommunicationAnalysisToMarkdown = (teamName: string, analysis: CommunicationAnalysis): string => {
    return `
# Análise de Comunicação: ${teamName}

## Estilo de Comunicação Dominante
> ${analysis.communicationStyle}

---

### Pontos Fortes
${analysis.strengths.map(s => `* ${s}`).join('\n')}

### Riscos e Pontos de Atenção
${analysis.risks.map(r => `* ${r}`).join('\n')}

### Recomendações de Mediação
${analysis.recommendations.map(rec => `* ${rec}`).join('\n')}
    `.trim();
};

// Helper function to format MediationRecord into Markdown for the knowledge silo
const formatMediationRecordToMarkdown = (teamName: string, record: MediationRecord): string => {
    return `
# Plano de Ação Tático: ${teamName}

## Situação
- **Problema Observado:** ${record.problemStatement}
- **OKR em Risco:** ${record.threatenedOkr}

---

## Estratégia Geral
> ${record.actionPlan.overallStrategy}

## Passos Acionáveis
${record.actionPlan.steps.map((step, index) => `
### Passo ${index + 1}: ${step.action}
- **Responsável:** ${step.responsible}
- **Impacto no OKR:** ${step.impactOnOkr}
`).join('\n\n')}
    `.trim();
};


export const PortfolioView: React.FC<PortfolioViewProps> = ({ teams, updateTeams, auditLog, proposalLog, updateProposalLog, provider }) => {
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState<AiAdviceResponse | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiModel, setAiModel] = useState<GeminiModel>('gemini-2.5-flash');

    const [analyzingTeam, setAnalyzingTeam] = useState<TeamComposition | null>(null);
    const [isCommsLoading, setIsCommsLoading] = useState(false);
    
    const [mediationTeam, setMediationTeam] = useState<TeamComposition | null>(null);

    const memberAllocation = React.useMemo(() => {
        const allocation = new Map<string, { name: string; count: number }>();
        teams.forEach(team => {
            team.members.forEach(member => {
                const current = allocation.get(member.cpf) || { name: member.name, count: 0 };
                allocation.set(member.cpf, { ...current, count: current.count + 1 });
            });
        });
        return Array.from(allocation.values()).sort((a,b) => b.count - a.count);
    }, [teams]);

    const handleDeleteTeam = async (teamId: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita.")) {
            await updateTeams(teams.filter(t => t.id !== teamId));
        }
    };
    
    const handleAiQuery = async () => {
        if (!aiQuery.trim()) return;
        const currentQuery = aiQuery;
        setIsAiLoading(true);
        setAiResponse(null);
        try {
            const res = await getPortfolioAdvice(teams, auditLog, currentQuery, proposalLog, provider, aiModel);
            setAiResponse(res);
            
            const newProposal: TeamProposal = {
                id: generateProposalId(),
                date: new Date().toISOString(),
                query: `(Consulta de Portfólio) ${currentQuery}`,
                response: res.text,
            };
            await updateProposalLog([newProposal, ...proposalLog]);
            setAiQuery('');
        } catch (error) {
            console.error('Portfolio AI error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar solicitação';
            setAiResponse({ text: `⚠️ ${errorMessage}`, sources: [] });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleStartCommunicationAnalysis = async (team: TeamComposition) => {
        setIsCommsLoading(true);
        setAnalyzingTeam(team); // Show modal immediately with current data or loader

        if (team.communicationAnalysis) {
            setIsCommsLoading(false);
            return;
        }

        try {
            const analysis = await analyzeTeamCommunication(team, provider);
            const updatedTeam = { ...team, communicationAnalysis: analysis };

            // 1. Archive the result in the central proposal log (knowledge silo)
            const proposalResponse = formatCommunicationAnalysisToMarkdown(team.name, analysis);
            const newProposal: TeamProposal = {
                id: generateProposalId(),
                date: new Date().toISOString(),
                query: `Análise de Comunicação para a equipe: "${team.name}"`,
                response: proposalResponse,
            };
            await updateProposalLog([newProposal, ...proposalLog]);

            // 2. Update the team with the cached analysis
            const updatedTeams = teams.map(t => t.id === team.id ? updatedTeam : t);
            await updateTeams(updatedTeams);
            
            setAnalyzingTeam(updatedTeam); // Update the modal with the new data
        } catch (error) {
            console.error("Failed to analyze team communication:", error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            alert(`⚠️ Erro ao analisar comunicação: ${errorMessage}`);
            setAnalyzingTeam(null); // Close modal on error
        } finally {
            setIsCommsLoading(false);
        }
    };

    const handlePlanGenerated = async (teamId: string, newRecord: MediationRecord) => {
        const team = teams.find(t => t.id === teamId);
        if (!team) return;

        // 1. Archive the result in the central proposal log (knowledge silo)
        const proposalResponse = formatMediationRecordToMarkdown(team.name, newRecord);
        const newProposal: TeamProposal = {
            id: generateProposalId(),
            date: new Date().toISOString(),
            query: `Plano de Ação Tático para: "${team.name}" (OKR: ${newRecord.threatenedOkr})`,
            response: proposalResponse,
        };
        await updateProposalLog([newProposal, ...proposalLog]);

        // 2. Update the team with the new mediation record in its history
        const updatedTeams = teams.map(t => {
            if (t.id === teamId) {
                const updatedHistory = [...(t.mediationHistory || []), newRecord];
                return { ...t, mediationHistory: updatedHistory };
            }
            return t;
        });
        await updateTeams(updatedTeams);

        setMediationTeam(null);
    };

    if (teams.length === 0) {
        return (
            <div className="text-center text-gray-500 py-16">
                <h3 className="text-xl font-semibold">Nenhuma equipe foi criada ainda.</h3>
                <p className="mt-2">Use o "Construtor de Equipes" para começar.</p>
            </div>
        );
    }

    return (
        <>
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h3 className="text-xl font-semibold">Equipes Ativas</h3>
                {teams.map(team => (
                    <div key={team.id} className="p-4 border rounded-lg shadow-sm bg-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-brand-primary">{team.name}</h4>
                                <p className="text-sm text-gray-600 italic">"{team.objective}"</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setMediationTeam(team)} className="text-green-600 hover:text-green-800" title="Mediar Conflito / Otimizar OKR">
                                    <AdjustmentsHorizontalIcon />
                                </button>
                                <button onClick={() => handleStartCommunicationAnalysis(team)} disabled={isCommsLoading && analyzingTeam?.id === team.id} className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:animate-pulse" title="Analisar Perfil de Comunicação">
                                    <ChatBubbleLeftRightIcon />
                                </button>
                                <button onClick={() => handleDeleteTeam(team.id)} className="text-red-500 hover:text-red-700" title="Excluir Equipe"><TrashIcon /></button>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                            <h5 className="text-sm font-semibold mb-2">Membros ({team.members.length})</h5>
                            <div className="flex flex-wrap gap-2">
                                {team.members.map(member => (
                                    <span key={member.cpf} className="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded-full">{member.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Alocação de Pessoal</h3>
                    <button onClick={() => setShowAiModal(true)} title="Assistente de Portfólio" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 font-semibold">
                        <SparklesIcon className="w-4 h-4" />
                        Assistente
                    </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {memberAllocation.map(member => (
                        <div key={member.name} className={`p-2 rounded flex justify-between items-center ${member.count > 1 ? 'bg-amber-100 border border-amber-200' : 'bg-white'}`}>
                            <span className={`font-medium ${member.count > 1 ? 'text-amber-900' : 'text-gray-900'}`}>{member.name}</span>
                            <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${member.count > 1 ? 'bg-amber-500 text-white' : 'bg-gray-300'}`}>
                                {member.count} {member.count > 1 ? 'equipes' : 'equipe'}
                            </span>
                        </div>
                    ))}
                </div>
                 <div className="mt-4 text-xs text-gray-500 flex items-start gap-2">
                    <InfoIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Pessoas em mais de uma equipe estão destacadas. Verifique a alocação para evitar sobrecarga.</span>
                 </div>
            </div>
        </div>
        {showAiModal && (
            <Modal title="Assistente de Portfólio" onClose={() => setShowAiModal(false)}>
                <div className="bg-slate-50 rounded-lg">
                    <p className="text-sm text-brand-secondary mb-4 p-4">Faça perguntas estratégicas sobre a composição de todas as equipes, alocação de pessoas ou para identificar talentos subutilizados.</p>
                    <div className="flex flex-col sm:flex-row gap-2 p-4 border-t bg-white">
                        <input
                            type="text"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            placeholder="Ex: Como posso realocar pessoas para otimizar os projetos?"
                            className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-brand-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                            disabled={isAiLoading}
                        />
                        <button onClick={handleAiQuery} disabled={isAiLoading || !aiQuery.trim()} className="px-6 py-2 bg-brand-primary text-white rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
                           {isAiLoading ? 'Analisando...' : 'Perguntar'}
                        </button>
                    </div>
                    
                    {isAiLoading && <div className="text-center p-4 text-brand-secondary">Analisando...</div>}

                    {aiResponse && !isAiLoading && (
                        <div className="mt-4 p-4 border-t border-slate-200">
                            <div className="prose prose-sm max-w-none text-brand-dark whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: aiResponse.text.replace(/\n/g, '<br />') }} />
                            {aiResponse.sources.length > 0 && (
                                <div className="mt-4 pt-3 border-t">
                                    <h5 className="text-xs font-bold text-gray-600 mb-2">Fontes Consultadas:</h5>
                                    <ul className="space-y-1">
                                        {aiResponse.sources.map((source, index) => (
                                            <li key={index} className="text-xs">
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                    <span>{source.title || source.uri}</span>
                                                    <ExternalLinkIcon className="w-3 h-3" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        )}
        {analyzingTeam && (
            <CommunicationAnalysisModal 
                team={analyzingTeam} 
                onClose={() => setAnalyzingTeam(null)} 
                isLoading={isCommsLoading && !analyzingTeam.communicationAnalysis}
            />
        )}
        {mediationTeam && (
            <MediationModal
                team={mediationTeam}
                provider={provider}
                onClose={() => setMediationTeam(null)}
                onPlanGenerated={handlePlanGenerated}
            />
        )}
        </>
    );
};
// bycao (ogrorvatigão) 2025