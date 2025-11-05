import React, { useState } from 'react';
import { getContextualTeamAdvice } from '../services/geminiService';
import { type AuditRecord, type GeminiModel, type TeamProposal, type AiAdviceResponse, type AiProvider } from '../types';
import { SparklesIcon, ExternalLinkIcon, PrintIcon } from './icons';
import { generateProposalId } from '../utils/helpers';
import { usePrint } from '../utils/hooks/usePrint';

interface TeamBuilderAiHelperProps {
    projectObjective: string;
    currentMembers: AuditRecord[];
    allCandidates: AuditRecord[];
    proposalLog: TeamProposal[];
    updateProposalLog: (log: TeamProposal[]) => Promise<void>;
    provider: AiProvider;
}

export const TeamBuilderAiHelper: React.FC<TeamBuilderAiHelperProps> = ({ projectObjective, currentMembers, allCandidates, proposalLog, updateProposalLog, provider }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<AiAdviceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState<GeminiModel>('gemini-2.5-flash');
    const { printAIConsultation } = usePrint();

    const handleQuery = async () => {
        if (!query.trim() || currentMembers.length === 0) return;
        const currentQuery = query;
        setIsLoading(true);
        setResponse(null);
        try {
            const res = await getContextualTeamAdvice(projectObjective, currentMembers, allCandidates, currentQuery, proposalLog, provider, model);
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
            setResponse({ text: `⚠️ ${errorMessage}`, sources: [] });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="mt-8">
            <h4 className="font-semibold text-brand-dark mb-2 flex items-center gap-2">
                <SparklesIcon /> Interagir com a IA (com pesquisa web)
            </h4>
            <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-brand-secondary mb-4">Faça perguntas sobre a equipe que você está montando para refinar sua composição.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ex: Qual o maior risco desta formação?"
                        className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-brand-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                        disabled={isLoading || currentMembers.length === 0}
                    />
                    <button onClick={handleQuery} disabled={isLoading || !query.trim()} className="px-6 py-2 bg-brand-primary text-white rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
                       {isLoading ? 'Analisando...' : 'Perguntar'}
                    </button>
                </div>
                {currentMembers.length === 0 && <p className="text-xs text-amber-600 mt-2">Selecione ao menos um membro para habilitar a IA.</p>}
                
                {isLoading && <div className="text-center p-4 text-brand-secondary">Analisando...</div>}

                {response && !isLoading && (
                    <div className="printable-section mt-4 p-4 border rounded-md bg-white">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Consulta IA</h4>
                            <button 
                                onClick={() => printAIConsultation(query)} 
                                className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 print-hidden"
                            >
                                <PrintIcon className="w-3 h-3" />
                                Imprimir
                            </button>
                        </div>
                        <div className="prose prose-sm max-w-none text-brand-dark whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: response.text.replace(/\n/g, '<br />') }} />
                        {response.sources.length > 0 && (
                            <div className="mt-4 pt-3 border-t">
                                <h5 className="text-xs font-bold text-gray-600 mb-2">Fontes Consultadas:</h5>
                                <ul className="space-y-1">
                                    {response.sources.map((source, index) => (
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
        </div>
    );
};
// bycao (ogrorvatigão) 2025