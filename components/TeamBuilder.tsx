import React, { useState, useMemo } from 'react';
import { type AuditRecord, type TeamComposition, type ComplementarityAnalysis, type TeamSuggestionResponse, type TeamProposal, AiProvider } from '../types';
import { analyzeTeamComplementarity, suggestInitialTeam, generateTeamProposal } from '../services/geminiService';
import { generateTeamId, generateProposalId } from '../utils/helpers';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { PROFILE_COLORS } from '../constants';
import { TeamBuilderAiHelper } from './AiAssistant';

interface TeamBuilderProps {
    auditLog: AuditRecord[];
    teams: TeamComposition[];
    updateTeams: (teams: TeamComposition[]) => Promise<void>;
    proposalLog: TeamProposal[];
    updateProposalLog: (log: TeamProposal[]) => Promise<void>;
    provider: AiProvider;
}

type BuilderStep = 1 | 2 | 3 | 4 | 5;


// Step Components defined outside the main component to prevent state loss on re-render.

const StepItem: React.FC<{ num: BuilderStep; title: string; active: boolean; last?: boolean }> = ({ num, title, active, last }) => {
    const textClass = active ? 'text-white' : 'text-gray-500';
    const bgClass = active ? 'bg-blue-600' : 'bg-gray-200';
    const borderClass = active ? 'after:border-blue-600' : 'after:border-gray-200';
    const titleTextClass = active ? 'text-blue-600 font-semibold' : 'text-gray-500';

    return (
        <li className={`relative flex w-full items-center ${!last ? `after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block ${borderClass}` : ''}`}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${bgClass} transition-colors`}>
                <span className={`text-lg font-bold ${textClass}`}>{num}</span>
            </div>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs text-center w-24 ${titleTextClass} transition-colors`}>{title}</div>
        </li>
    );
};


interface ProjectDefinitionProps {
    initialName: string;
    initialObjective: string;
    onNext: (name: string, objective: string) => void;
}
const ProjectDefinition: React.FC<ProjectDefinitionProps> = ({ initialName, initialObjective, onNext }) => {
    const [name, setName] = useState(initialName);
    const [objective, setObjective] = useState(initialObjective);
    return (
        <div className="max-w-lg mx-auto space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold text-brand-dark">1. Defina o Projeto</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Projeto/Equipe</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Objetivo Principal</label>
                <textarea value={objective} onChange={(e) => setObjective(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" rows={3}></textarea>
            </div>
            <div className="text-right">
                <button onClick={() => onNext(name, objective)} disabled={!name.trim() || !objective.trim()} className="px-6 py-2 bg-brand-primary text-white rounded disabled:bg-gray-400">Próximo: Gerar Sugestão da IA</button>
            </div>
        </div>
    );
};


interface AISuggestionViewProps {
    isSuggesting: boolean;
    aiSuggestion: TeamSuggestionResponse | null;
    auditLog: AuditRecord[];
    onGoBack: () => void;
    onGoToNext: () => void;
}
const AISuggestionView: React.FC<AISuggestionViewProps> = ({ isSuggesting, aiSuggestion, auditLog, onGoBack, onGoToNext }) => {
    if (isSuggesting) return <div className="text-center text-brand-secondary">Analisando perfis e gerando sugestão inicial...</div>;
    if (!aiSuggestion) return <div className="text-center text-red-600">Erro ao gerar sugestão. Tente novamente.</div>;

    const suggestedMembersDetails = aiSuggestion.suggestedMemberIds
        .map(id => auditLog.find(m => m.id === id))
        .filter((m): m is AuditRecord => !!m);

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            <h3 className="text-xl font-semibold text-brand-dark mb-4">2. Sugestão da IA</h3>
            <div className="p-4 border rounded-lg bg-indigo-50">
                <h4 className="font-bold text-indigo-800 mb-2">Equipe Sugerida:</h4>
                 <div className="flex flex-wrap gap-2 mb-3">
                    {suggestedMembersDetails.map(member => (
                        <span key={member.id} className="px-3 py-1 bg-white border border-slate-300 text-sm font-semibold rounded-full shadow-sm text-brand-dark">{member.name}</span>
                    ))}
                </div>
                <h4 className="font-bold text-indigo-800 mb-2 mt-4">Justificativa da IA:</h4>
                <p className="text-sm text-indigo-700 whitespace-pre-wrap">{aiSuggestion.justification}</p>
            </div>
            <div className="flex justify-between mt-4">
                <button onClick={onGoBack} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 transition-colors">Voltar</button>
                <button onClick={onGoToNext} className="px-6 py-2 bg-brand-primary text-white rounded">Próximo: Ajustar Equipe</button>
            </div>
        </div>
    );
};

interface FineTuningViewProps {
    selectedMemberIds: string[];
    auditLog: AuditRecord[];
    onToggleMember: (id: string) => void;
    projectObjective: string;
    selectedMembers: AuditRecord[];
    proposalLog: TeamProposal[];
    updateProposalLog: (log: TeamProposal[]) => Promise<void>;
    provider: AiProvider;
    onGoToAnalysis: () => void;
    onGoBack: () => void;
}
const FineTuningView: React.FC<FineTuningViewProps> = ({
    selectedMemberIds, auditLog, onToggleMember, projectObjective, selectedMembers,
    proposalLog, updateProposalLog, provider, onGoToAnalysis, onGoBack
}) => {
    return (
         <div className="max-w-3xl mx-auto animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4 text-brand-dark">3. Ajuste Fino e Interação ({selectedMemberIds.length})</h3>
            <div className="max-h-80 overflow-y-auto border rounded-lg">
                {auditLog.length > 0 ? auditLog.map(record => (
                    <div key={record.id} onClick={() => onToggleMember(record.id)} className={`flex items-center justify-between p-3 border-b cursor-pointer transition-colors ${selectedMemberIds.includes(record.id) ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
                        <div>
                            <p className="font-semibold text-brand-dark">{record.name}</p>
                            <p className="text-sm text-gray-500">{record.professionalProfile?.primaryArea || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-xs font-bold text-white rounded-full" style={{ backgroundColor: PROFILE_COLORS[record.primaryProfile] }}>{record.primaryProfile}</span>
                            {record.secondaryProfile && <span className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">{record.secondaryProfile}</span>}
                        </div>
                    </div>
                )) : <p className="p-8 text-center text-gray-500">Nenhum registro encontrado.</p>}
            </div>

            <TeamBuilderAiHelper 
                projectObjective={projectObjective} 
                currentMembers={selectedMembers} 
                allCandidates={auditLog} 
                proposalLog={proposalLog} 
                updateProposalLog={updateProposalLog}
                provider={provider}
            />

            <div className="flex justify-between mt-6 pt-4 border-t">
                <button onClick={onGoBack} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 transition-colors">Voltar</button>
                <button onClick={onGoToAnalysis} disabled={selectedMemberIds.length === 0} className="px-6 py-2 bg-brand-primary text-white rounded disabled:bg-gray-400">Analisar Equipe Final</button>
            </div>
        </div>
    );
};


interface AIAnalysisProps {
    isAnalyzing: boolean;
    analysis: ComplementarityAnalysis | null;
    teamDISCProfile: { subject: string; value: number; fullMark: number; }[];
    selectedMembers: AuditRecord[];
    onGoBack: () => void;
    onGoToNext: () => void;
}
const AIAnalysis: React.FC<AIAnalysisProps> = ({ isAnalyzing, analysis, teamDISCProfile, selectedMembers, onGoBack, onGoToNext }) => {
    if (isAnalyzing) return <div className="text-center text-brand-secondary">Analisando complementaridade da equipe final...</div>;
    if (!analysis) return <div className="text-center text-red-600">Erro ao gerar análise. Tente novamente.</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4 text-center text-brand-dark">4. Análise da Equipe Final</h3>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-2 text-brand-secondary">Composição DISC</h4><ResponsiveContainer width="100%" height={300}><RadarChart cx="50%" cy="50%" outerRadius="80%" data={teamDISCProfile}><PolarGrid /><PolarAngleAxis dataKey="subject" /><PolarRadiusAxis angle={30} domain={[0, selectedMembers.length]} /><Radar name="Equipe" dataKey="value" stroke="#0052CC" fill="#0052CC" fillOpacity={0.6} /><Legend /></RadarChart></ResponsiveContainer></div>
                <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-2 text-brand-secondary">Avaliação Geral</h4><p className="text-sm italic text-gray-700">{analysis.overallAssessment}</p><h4 className="font-semibold mb-2 mt-4 text-brand-secondary">Maturidade Metodológica</h4><div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-green-500 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ width: `${analysis.methodologicalMaturity}%` }}>{analysis.methodologicalMaturity}%</div></div></div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                 <div className="p-4 bg-green-50 rounded-lg"><h4 className="font-bold text-green-800 mb-2">Sinergias Potenciais</h4><ul className="list-disc list-inside text-sm text-green-700 space-y-1">{analysis.synergies.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                 <div className="p-4 bg-red-50 rounded-lg"><h4 className="font-bold text-red-800 mb-2">Pontos de Atenção</h4><ul className="list-disc list-inside text-sm text-red-700 space-y-1">{analysis.potentialConflicts.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
            </div>
             <div className="flex justify-between mt-4">
                <button onClick={onGoBack} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 transition-colors">Voltar</button>
                <button onClick={onGoToNext} className="px-6 py-2 bg-brand-primary text-white rounded">Próximo</button>
            </div>
        </div>
    );
};


interface FinalizeProps {
    projectName: string;
    projectObjective: string;
    selectedMembers: AuditRecord[];
    isSaving: boolean;
    onGoBack: () => void;
    onSave: () => void;
}
const Finalize: React.FC<FinalizeProps> = ({ projectName, projectObjective, selectedMembers, isSaving, onGoBack, onSave }) => {
    return (
         <div className="max-w-2xl mx-auto text-center animate-fadeIn">
             <h3 className="text-xl font-semibold mb-4 text-brand-dark">5. Finalizar e Salvar Equipe</h3>
             <div className="p-4 border rounded-lg text-left bg-slate-50 text-gray-800 space-y-1">
                <p><strong>Nome:</strong> {projectName}</p>
                <p><strong>Objetivo:</strong> {projectObjective}</p>
                <p><strong>Membros ({selectedMembers.length}):</strong> {selectedMembers.map(m => m.name).join(', ')}</p>
             </div>
             <p className="my-4 text-gray-700">Deseja salvar esta composição de equipe no seu portfólio e gerar a proposta de escala?</p>
             <div className="flex justify-center gap-4 mt-4">
                <button onClick={onGoBack} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 transition-colors" disabled={isSaving}>Voltar para Análise</button>
                <button onClick={onSave} className="px-6 py-2 bg-green-600 text-white rounded disabled:bg-green-800 disabled:cursor-wait" disabled={isSaving}>
                    {isSaving ? 'Salvando e Gerando Proposta...' : 'Salvar Equipe e Gerar Proposta'}
                </button>
            </div>
        </div>
    );
};


export const TeamBuilder: React.FC<TeamBuilderProps> = ({ auditLog, teams, updateTeams, proposalLog, updateProposalLog, provider }) => {
    const [step, setStep] = useState<BuilderStep>(1);
    const [projectName, setProjectName] = useState('');
    const [projectObjective, setProjectObjective] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    
    const [aiSuggestion, setAiSuggestion] = useState<TeamSuggestionResponse | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    
    const [analysis, setAnalysis] = useState<ComplementarityAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [isSaving, setIsSaving] = useState(false);

    const selectedMembers = useMemo(() => {
        const memberMap = new Map(auditLog.map(m => [m.id, m]));
        return selectedMemberIds.map(id => memberMap.get(id)).filter((m): m is AuditRecord => !!m);
    }, [auditLog, selectedMemberIds]);

    const handleDefineProject = async (name: string, objective: string) => {
        setProjectName(name);
        setProjectObjective(objective);
        setStep(2);
        setIsSuggesting(true);
        setAiSuggestion(null);
        setSelectedMemberIds([]);

        const suggestion = await suggestInitialTeam(objective, auditLog, provider);
        setAiSuggestion(suggestion);
        setSelectedMemberIds(suggestion.suggestedMemberIds);
        setIsSuggesting(false);
    };

    const handleGoToAnalysis = async () => {
        if (selectedMembers.length > 0) {
            setIsAnalyzing(true);
            setStep(4);
            const tempTeam: TeamComposition = { id: '', name: projectName, objective: projectObjective, createdAt: '', members: selectedMembers };
            const result = await analyzeTeamComplementarity(tempTeam, provider);
            setAnalysis(result);
            setIsAnalyzing(false);
        }
    };
    
    const handleSaveTeam = async () => {
        setIsSaving(true);
        const newTeam: TeamComposition = {
            id: generateTeamId(),
            name: projectName,
            objective: projectObjective,
            createdAt: new Date().toISOString(),
            members: selectedMembers,
            complementarityAnalysis: analysis ?? undefined,
        };

        try {
            const proposalText = await generateTeamProposal(newTeam, provider);
            const newProposal: TeamProposal = {
                id: generateProposalId(),
                date: new Date().toISOString(),
                query: `Proposta de Escala para a equipe: "${newTeam.name}"`,
                response: proposalText,
            };
            await updateProposalLog([newProposal, ...proposalLog]);
            await updateTeams([...teams, newTeam]);
            alert(`Equipe "${newTeam.name}" salva e proposta de escala gerada com sucesso!`);
        } catch (error) {
            console.error("Failed to generate team proposal:", error);
            await updateTeams([...teams, newTeam]); // Still save team even if proposal fails
            alert(`Equipe "${newTeam.name}" salva com sucesso, mas ocorreu um erro ao gerar a proposta de escala.`);
        } finally {
            // Reset state
            setStep(1);
            setProjectName('');
            setProjectObjective('');
            setSelectedMemberIds([]);
            setAnalysis(null);
            setAiSuggestion(null);
            setIsSaving(false);
        }
    };

    const handleToggleMember = (id: string) => {
        setSelectedMemberIds(prev => prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]);
    };
    
    const teamDISCProfile = useMemo(() => {
        if (selectedMembers.length === 0) return [];
        const counts = selectedMembers.reduce((acc, member) => {
            acc[member.primaryProfile] = (acc[member.primaryProfile] || 0) + 1;
            return acc;
        }, { D: 0, I: 0, S: 0, C: 0 });

        return [
            { subject: 'Dominância (D)', value: counts.D, fullMark: selectedMembers.length },
            { subject: 'Influência (I)', value: counts.I, fullMark: selectedMembers.length },
            { subject: 'Estabilidade (S)', value: counts.S, fullMark: selectedMembers.length },
            { subject: 'Conformidade (C)', value: counts.C, fullMark: selectedMembers.length },
        ];
    }, [selectedMembers]);

    return (
        <div className="p-4 animate-fadeIn">
            <div className="mb-16 w-full max-w-4xl mx-auto">
                <ol className="flex items-center">
                    <StepItem num={1} title="Projeto" active={step >= 1} />
                    <StepItem num={2} title="Sugestão IA" active={step >= 2} />
                    <StepItem num={3} title="Ajuste Fino" active={step >= 3} />
                    <StepItem num={4} title="Análise Final" active={step >= 4} />
                    <StepItem num={5} title="Finalizar" active={step >= 5} last />
                </ol>
            </div>

            {step === 1 && <ProjectDefinition initialName={projectName} initialObjective={projectObjective} onNext={handleDefineProject} />}
            {step === 2 && <AISuggestionView isSuggesting={isSuggesting} aiSuggestion={aiSuggestion} auditLog={auditLog} onGoBack={() => setStep(1)} onGoToNext={() => setStep(3)} />}
            {step === 3 && <FineTuningView 
                selectedMemberIds={selectedMemberIds}
                auditLog={auditLog}
                onToggleMember={handleToggleMember}
                projectObjective={projectObjective}
                selectedMembers={selectedMembers}
                proposalLog={proposalLog}
                updateProposalLog={updateProposalLog}
                provider={provider}
                onGoToAnalysis={handleGoToAnalysis}
                onGoBack={() => setStep(2)}
            />}
            {step === 4 && <AIAnalysis 
                isAnalyzing={isAnalyzing}
                analysis={analysis}
                teamDISCProfile={teamDISCProfile}
                selectedMembers={selectedMembers}
                onGoBack={() => setStep(3)}
                onGoToNext={() => setStep(5)}
            />}
            {step === 5 && <Finalize 
                projectName={projectName}
                projectObjective={projectObjective}
                selectedMembers={selectedMembers}
                isSaving={isSaving}
                onGoBack={() => setStep(4)}
                onSave={handleSaveTeam}
            />}
        </div>
    );
};
// bycao (ogrorvatigão) 2025