import React, { useState } from 'react';
import { wikiService } from '../services/wikiService';
import { getContextualTeamAdvice } from '../services/geminiService';
import { type AuditRecord, type GeminiModel, type TeamProposal, type AiAdviceResponse, type AiProvider } from '../types';
import { AiChipIcon, ExternalLinkIcon, PrintIcon } from './icons';
import { generateProposalId } from '../utils/helpers';
import { usePrint } from '../utils/hooks/usePrint';

interface GlobalAIAssistantProps {
    currentMembers: AuditRecord[];
    allCandidates: AuditRecord[];
    proposalLog: TeamProposal[];
    updateProposalLog: (log: TeamProposal[]) => Promise<void>;
    provider: AiProvider;
    projectObjective?: string;
    userRole?: 'master' | 'orgAdmin' | 'member';  // 3.0: Multi-tenant
    organizationName?: string;  // 3.0: Contexto organizacional
}

export const GlobalAIAssistant: React.FC<GlobalAIAssistantProps> = ({ 
    currentMembers, 
    allCandidates, 
    proposalLog, 
    updateProposalLog, 
    provider,
    projectObjective = "Otimizar formação de equipes de alto rendimento",
    userRole = 'member',
    organizationName = 'Organização'
}) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<AiAdviceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState<GeminiModel>('gemini-2.0-flash');
    const [isExpanded, setIsExpanded] = useState(false);
    const { printAIConsultation } = usePrint();

    const quickActions = [
        { label: '🎓 Como usar DISC?', prompt: 'Como funciona a metodologia DISC e como interpretar os perfis?', category: 'knowledge' },
        { label: '🆘 Ajuda Técnica', prompt: 'Estou com problema no sistema, como resolver?', category: 'support' },
        { label: '📊 Montar Equipe', prompt: 'Como montar uma equipe de alto rendimento?', category: 'team' },
        { label: '🤝 Complementaridade', prompt: 'Como analisar complementaridade entre membros?', category: 'team' },
        { label: '⚡ Migrar Premium', prompt: 'Quando devo migrar para SISGEAD 3.0 Premium?', category: 'premium' },
        { label: '🎯 Holocracia', prompt: 'Como usar Holocracia para definir papéis na equipe?', category: 'knowledge' }
    ];

    const handleQuery = async () => {
        if (!query.trim()) return;
        
        const currentQuery = query;
        setIsLoading(true);
        setResponse(null);
        try {
            const wikiContext = await wikiService.getContextForAI(currentQuery);
            const isGeneralHelp = /documentação|suporte|acesso|tem acesso|como|ajuda|problema|erro|não funciona|tutorial|guia|premium|migrar|holocracia|papéis|3\.0|sistema|consulta|DISC|ágil|metodologia/i.test(currentQuery);
            
            let res: AiAdviceResponse;

            if (isGeneralHelp && wikiContext && !wikiContext.includes('Nenhuma documentação')) {
                res = {
                    text: `📚 **Sim! Tenho acesso à documentação completa do SISGEAD:**\n\n${wikiContext}\n\n💡 **Posso ajudar com:**\n- Como usar o sistema\n- Resolver problemas técnicos\n- Explicar metodologia DISC\n- Migração para Premium 3.0\n- Gestão por Papéis (Holocracia)\n- Metodologias Ágeis\n${currentMembers.length > 0 ? '\n- Análise específica da sua equipe atual' : '\n\n⚠️ Para análise de equipe, selecione membros na aba Construtor.'}`,
                    sources: []
                };
            } else if (currentMembers.length === 0 && /equipe|time|montar|formar|complementar/i.test(currentQuery)) {
                res = {
                    text: `⚠️ **Nenhum membro selecionado**\n\nPara análises de equipe, adicione membros na aba **Construtor**.\n\n💡 **Ou pergunte sobre:**\n- "Como usar DISC?"\n- "Tem acesso à documentação deste sistema?"\n- "Como resolver problemas?"\n- "Quando migrar para Premium 3.0?"\n- "Como usar Holocracia?"\n- "Metodologias ágeis para equipes"`,
                    sources: []
                };
            } else if (currentMembers.length > 0) {
                res = await getContextualTeamAdvice(projectObjective, currentMembers, allCandidates, currentQuery, proposalLog, provider, model);
                if (wikiContext && !wikiContext.includes('Nenhuma')) {
                    res.text += `\n\n---\n\n📖 **Documentação Relacionada:**\n${wikiContext.substring(0, 300)}...`;
                }
            } else {
                res = {
                    text: `📚 **Base de Conhecimento Disponível:**\n\n${wikiContext || 'Consultando documentação...'}\n\n💡 Faça perguntas sobre DISC, Holocracia, gestão ágil ou suporte técnico!`,
                    sources: []
                };
            }

            setResponse(res);

            const newProposal: TeamProposal = {
                id: generateProposalId(),
                date: new Date().toISOString(),
                query: currentQuery,
                response: res.text,
            };
            await updateProposalLog([newProposal, ...proposalLog]);
            setQuery('');
        } catch (error) {
            console.error('AI Assistant error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar solicitação';
            setResponse({ text: `❌ ${errorMessage}`, sources: [] });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Botão Flutuante */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transform transition-all duration-300 font-semibold"
                    title="Assistente IA - Disponível em todas as abas"
                >
                    <AiChipIcon />
                    <span>Assistente IA</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">24/7</span>
                </button>
            )}

            {/* Modal Expandido */}
            {isExpanded && (
                <div className="bg-white rounded-2xl shadow-2xl border border-purple-200 w-[500px] max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AiChipIcon />
                            <h4 className="font-bold">Assistente IA Global</h4>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="hover:bg-white/20 rounded-full p-2 transition"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <p className="text-sm text-slate-600">
                            💡 Pergunte sobre DISC, Holocracia, gestão ágil, suporte técnico ou análise de equipes!
                        </p>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setQuery(action.prompt)}
                                    className="px-3 py-1.5 text-xs bg-purple-50 border border-purple-200 rounded-full hover:bg-purple-100 transition"
                                    disabled={isLoading}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                                placeholder="Digite sua pergunta..."
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleQuery}
                                disabled={isLoading || !query.trim()}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-300 transition font-semibold"
                            >
                                {isLoading ? '...' : 'Enviar'}
                            </button>
                        </div>

                        {/* Response */}
                        {response && (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                                    {response.text}
                                </div>
                                {response.text && (
                                    <button
                                        onClick={() => printAIConsultation(query, response.text)}
                                        className="mt-3 flex items-center gap-2 text-xs text-purple-600 hover:text-purple-800"
                                    >
                                        <PrintIcon /> Imprimir
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-slate-50 rounded-b-2xl border-t text-xs text-center text-slate-500">
                        <div className="flex justify-between items-center">
                            <span>{organizationName} • {userRole === 'master' ? '👑 Master' : userRole === 'orgAdmin' ? '⚙️ Admin' : '👤 Membro'}</span>
                            <span>{currentMembers.length} membros selecionados • {allCandidates.length} candidatos</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
