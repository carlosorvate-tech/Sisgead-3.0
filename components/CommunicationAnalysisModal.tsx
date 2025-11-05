import React from 'react';
import { type TeamComposition } from '../types';
import { Modal } from './Modal';
import { LightBulbIcon, ShieldCheckIcon, TrashIcon, PrintIcon } from './icons';
import { usePrint } from '../utils/hooks/usePrint';

interface CommunicationAnalysisModalProps {
    team: TeamComposition;
    onClose: () => void;
    isLoading: boolean;
}

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; color: string; children: React.ReactNode }> = ({ title, icon, color, children }) => {
    const colorClasses = {
        green: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
        red: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    }[color] || { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses.bg} ${colorClasses.border}`}>
            <h4 className={`font-bold ${colorClasses.text} mb-2 flex items-center gap-2`}>
                {icon}
                {title}
            </h4>
            <div className={`text-sm ${colorClasses.text} space-y-1`}>
                {children}
            </div>
        </div>
    );
}


export const CommunicationAnalysisModal: React.FC<CommunicationAnalysisModalProps> = ({ team, onClose, isLoading }) => {
    const { communicationAnalysis } = team;
    const { printCommunicationAnalysis } = usePrint();

    if (isLoading) {
        return (
            <Modal title={`Analisando Comunicação: ${team.name}`} onClose={onClose} size="lg">
                <div className="p-8 text-center">
                    <p className="text-lg text-brand-secondary animate-pulse">A IA está analisando a dinâmica da equipe. Isso pode levar alguns segundos...</p>
                </div>
            </Modal>
        );
    }
    
    if (!communicationAnalysis) {
        return (
            <Modal title={`Análise de Comunicação`} onClose={onClose} size="lg">
                <div className="p-4 text-center">
                    <p>Nenhuma análise de comunicação disponível para esta equipe.</p>
                </div>
            </Modal>
        );
    }
    
    return (
        <Modal title={`Análise de Comunicação: ${team.name}`} onClose={onClose} size="2xl">
            <div className="printable-section space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-brand-dark">Estilo de Comunicação Dominante</h3>
                        <p className="text-brand-secondary italic mt-1">
                            "{communicationAnalysis.communicationStyle}"
                        </p>
                    </div>
                    <button 
                        onClick={() => printCommunicationAnalysis(team.name)} 
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 text-sm print-hidden"
                    >
                        <PrintIcon className="w-4 h-4" />
                        Imprimir Análise
                    </button>
                </div>

                <div className="space-y-4">
                    <InfoCard title="Pontos Fortes" icon={<ShieldCheckIcon />} color="green">
                        <ul className="list-disc list-inside">
                            {communicationAnalysis.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                            ))}
                        </ul>
                    </InfoCard>

                    <InfoCard title="Riscos e Pontos de Atenção" icon={<TrashIcon />} color="red">
                        <ul className="list-disc list-inside">
                            {communicationAnalysis.risks.map((risk, index) => (
                                <li key={index}>{risk}</li>
                            ))}
                        </ul>
                    </InfoCard>

                    <InfoCard title="Recomendações de Mediação" icon={<LightBulbIcon />} color="blue">
                         <ul className="list-disc list-inside">
                            {communicationAnalysis.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </InfoCard>
                </div>
            </div>
        </Modal>
    );
};