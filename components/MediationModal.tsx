import React, { useState } from 'react';
import { type TeamComposition, type TacticalActionPlan, type AiProvider, MediationRecord } from '../types';
import { Modal } from './Modal';
import { generateTacticalActionPlan } from '../services/geminiService';
import { SparklesIcon, PrintIcon } from './icons';
import { generateProposalId } from '../utils/helpers';
import { usePrint } from '../utils/hooks/usePrint';

interface MediationModalProps {
    team: TeamComposition;
    provider: AiProvider;
    onClose: () => void;
    onPlanGenerated: (teamId: string, record: MediationRecord) => void;
}

export const MediationModal: React.FC<MediationModalProps> = ({ team, provider, onClose, onPlanGenerated }) => {
    const [problem, setProblem] = useState('');
    const [okr, setOkr] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [actionPlan, setActionPlan] = useState<TacticalActionPlan | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { printMediationPlan } = usePrint();

    const handleGeneratePlan = async () => {
        if (!problem.trim() || !okr.trim()) {
            setError("Por favor, preencha ambos os campos para gerar um plano.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setActionPlan(null);
        try {
            const plan = await generateTacticalActionPlan(team, problem, okr, provider);
            setActionPlan(plan);
            const newRecord: MediationRecord = {
                id: generateProposalId(),
                createdAt: new Date().toISOString(),
                problemStatement: problem,
                threatenedOkr: okr,
                actionPlan: plan,
            };
            onPlanGenerated(team.id, newRecord);
        } catch (e) {
            console.error('Mediation Modal error:', e);
            const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
            setError(`⚠️ Erro ao gerar plano de ação: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal title={`Assistente de Otimização de OKR: ${team.name}`} onClose={onClose} size="3xl">
            <div className="space-y-4">
                {!actionPlan ? (
                    <>
                        <div>
                            <label htmlFor="problem" className="block text-sm font-medium text-gray-700">1. Descreva o problema ou sintoma observado</label>
                            <textarea
                                id="problem"
                                rows={3}
                                value={problem}
                                onChange={(e) => setProblem(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="Ex: A equipe está tendo dificuldade em priorizar tarefas, resultando em atrasos na entrega."
                            />
                        </div>
                        <div>
                            <label htmlFor="okr" className="block text-sm font-medium text-gray-700">2. Qual OKR ou métrica principal está em risco?</label>
                            <input
                                type="text"
                                id="okr"
                                value={okr}
                                onChange={(e) => setOkr(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="Ex: Entregar a versão 2.0 do produto até o final do Q3."
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="text-right">
                            <button
                                onClick={handleGeneratePlan}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                <SparklesIcon />
                                {isLoading ? 'Analisando...' : 'Gerar Plano de Ação'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="printable-section animate-fadeIn space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-brand-dark">Plano de Ação Tático Gerado</h3>
                            <button 
                                onClick={() => printMediationPlan(problem, team.name)} 
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 text-sm print-hidden"
                            >
                                <PrintIcon className="w-4 h-4" />
                                Imprimir Plano
                            </button>
                        </div>
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <h4 className="font-semibold text-indigo-800">Estratégia Geral</h4>
                            <p className="text-sm text-indigo-700 italic mt-1">"{actionPlan.overallStrategy}"</p>
                        </div>
                        <div className="space-y-3">
                            {actionPlan.steps.map((step, index) => (
                                <div key={index} className="p-3 border rounded-lg bg-white">
                                    <p className="font-semibold text-gray-800">Passo {index + 1}: {step.action}</p>
                                    <div className="text-xs mt-2 flex justify-between">
                                        <span className="font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Responsável: {step.responsible}</span>
                                        <span className="text-green-700 font-medium">Impacto no OKR: {step.impactOnOkr}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div className="text-right">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-200 text-brand-secondary font-semibold rounded-md hover:bg-gray-300"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};