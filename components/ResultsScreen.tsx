import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type AuditRecord, type RoleSuggestion } from '../types';
import { PROFILE_DESCRIPTIONS, PROFILE_COLORS, APP_VERSION } from '../constants';
import { PrintIcon, SparklesIcon } from './icons';
import { useResultsPrint } from '../utils/hooks/usePrint';
import { StructuredTooltip } from './Tooltip';

interface ResultsScreenProps {
    record: AuditRecord;
    onContinue: () => void;
    onFinish: () => void;
    isFinal: boolean;
}

const RoleSuggestionCard: React.FC<RoleSuggestion> = ({ role, confidence, justification }) => (
    <div className="p-4 bg-white border border-slate-200 rounded-lg print-avoid-break">
        <div className="flex justify-between items-center">
            <h4 className="font-bold text-indigo-800">{role}</h4>
            <span className={`text-xs font-bold px-2 py-1 rounded-full text-white print:text-black print:border ${confidence > 0.8 ? 'bg-green-500 print:bg-white' : 'bg-amber-500 print:bg-gray-100'}`}>
                Confiança: {(confidence * 100).toFixed(0)}%
            </span>
        </div>
        <p className="text-sm text-brand-secondary mt-2">{justification}</p>
    </div>
);

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ record, onContinue, onFinish, isFinal }) => {
    const { scores, primaryProfile, secondaryProfile, id, date, verificationHash, roleSuggestions, professionalProfile, identityProfile, resilienceAndCollaborationProfile, name } = record;
    const [copySuccess, setCopySuccess] = useState('');
    const { printReport } = useResultsPrint(name);

    const data = useMemo(() => [
        { name: 'D', value: scores.D, color: PROFILE_COLORS.D },
        { name: 'I', value: scores.I, color: PROFILE_COLORS.I },
        { name: 'S', value: scores.S, color: PROFILE_COLORS.S },
        { name: 'C', value: scores.C, color: PROFILE_COLORS.C },
    ], [scores]);
    
    const primaryInfo = PROFILE_DESCRIPTIONS[primaryProfile];
    const secondaryInfo = secondaryProfile ? PROFILE_DESCRIPTIONS[secondaryProfile] : null;

    const handleCopyToClipboard = () => {
        const dataString = JSON.stringify(record);
        const base64String = btoa(dataString);
        navigator.clipboard.writeText(base64String).then(() => {
            setCopySuccess('Copiado com sucesso!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Falha ao copiar.');
        });
    };
    
    const nextStepButtonText = () => {
        if (!professionalProfile) return "Expandir Perfil Profissional (Opcional)";
        if (!identityProfile) return "Expandir Perfil de Identidade (Opcional)";
        if (!resilienceAndCollaborationProfile) return "Expandir Perfil de Resiliência (Opcional)";
        return "";
    };

    return (
        <div className="p-8 animate-fadeIn printable-section">
            {/* Header Section - Print Optimized */}
            <div className="flex justify-between items-start mb-6 print-avoid-break">
                <div>
                    <h2 className="text-3xl font-extrabold text-brand-dark mb-1">Seu Perfil Primário: {primaryInfo.title}</h2>
                    <p className="text-lg text-brand-secondary">{primaryInfo.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                    <span className="text-xs font-semibold text-slate-500">ID do Relatório</span>
                    <StructuredTooltip 
                        what="Código Único de Identificação"
                        how="Use para referenciar este relatório"
                        why="Facilita localização e validação futura"
                    >
                        <p className="font-mono text-sm text-brand-dark bg-slate-100 p-2 rounded-md mt-1 cursor-help">{id}</p>
                    </StructuredTooltip>
                </div>
            </div>
             
             {/* Main Content Section - Chart and Details */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print-avoid-break">
                 <div className="h-80 print-avoid-break"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value">{data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Bar></BarChart></ResponsiveContainer></div>
                 <div className="space-y-4 text-sm">
                     <div className="p-4 bg-blue-50 rounded-lg print-avoid-break"><h3 className="font-bold text-blue-800">Estilo de Comunicação</h3><p className="mt-1 text-blue-700">{primaryInfo.communication}</p></div>
                      <div className="p-4 bg-green-50 rounded-lg print-avoid-break"><h3 className="font-bold text-green-800">Pontos Fortes</h3><ul className="list-disc list-inside mt-1 text-green-700">{primaryInfo.strengths.map(s => <li key={s}>{s}</li>)}</ul></div>
                     <div className="p-4 bg-amber-50 rounded-lg print-avoid-break"><h3 className="font-bold text-amber-800">Pontos a Desenvolver</h3><ul className="list-disc list-inside mt-1 text-amber-700">{primaryInfo.weaknesses.map(w => <li key={w}>{w}</li>)}</ul></div>
                 </div>
             </div>

             {/* Secondary Profile Section */}
             {secondaryInfo && <div className="mt-8 p-6 bg-slate-100 rounded-lg border print-avoid-break"><h3 className="text-xl font-bold text-brand-dark mb-2">Seu Perfil Secundário: {secondaryInfo.title}</h3><p className="text-brand-secondary text-sm">Seu perfil primário é complementado por características do perfil de <strong>{secondaryInfo.title.split(' ')[0]}</strong>. Isso significa que você também pode apresentar traços como: <em>"{secondaryInfo.description}"</em></p></div>}
             
             {/* Team Integration Section */}
             <div className="mt-8 p-6 bg-indigo-50 rounded-lg print-avoid-break"><h3 className="text-xl font-bold text-indigo-800 mb-3">Sugestão para Integração em Equipes</h3><p className="text-indigo-700">{primaryInfo.teamIntegration}</p></div>
            
            {/* Identity Profile Section */}
            {identityProfile && (
                 <div className="mt-8 print-page-break">
                    <h3 className="text-2xl font-bold text-brand-dark mb-4">Seu Contexto e Identidade</h3>
                     <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-brand-secondary space-y-2 print-avoid-break">
                        <p><strong>Motivadores Principais:</strong> {identityProfile.motivators.join(', ')}</p>
                        <p><strong>Ambiente Ideal:</strong> {identityProfile.idealEnvironment.join(', ')}</p>
                        {identityProfile.personalPurpose && <p><strong>Propósito Pessoal:</strong> <em className="italic">"{identityProfile.personalPurpose}"</em></p>}
                     </div>
                </div>
            )}

            {/* Resilience and Collaboration Profile Section */}
            {resilienceAndCollaborationProfile && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold text-brand-dark mb-4">Perfil de Resiliência e Colaboração</h3>
                        <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-brand-secondary space-y-2 print-avoid-break">
                        <p><strong>Estilo de Conflito:</strong> {resilienceAndCollaborationProfile.conflictStyle}</p>
                        <p><strong>Reação sob Pressão:</strong> {resilienceAndCollaborationProfile.pressureResponse}</p>
                        <p><strong>Preferência para Receber Feedback:</strong> {resilienceAndCollaborationProfile.feedbackReception}</p>
                        <p><strong>Preferência para Dar Feedback:</strong> {resilienceAndCollaborationProfile.feedbackGiving}</p>
                        <p><strong>Valores Fundamentais:</strong> {resilienceAndCollaborationProfile.coreValues.join(', ')}</p>
                        </div>
                </div>
            )}

            {/* AI Role Suggestions Section */}
            {roleSuggestions && roleSuggestions.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-2"><SparklesIcon /> Papéis Sugeridos pela IA</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {roleSuggestions.map(suggestion => <RoleSuggestionCard key={suggestion.role} {...suggestion} />)}
                    </div>
                </div>
            )}
             
             {/* Verification Hash Section */}
             <div className="mt-8 p-4 bg-gray-800 text-white rounded-lg font-mono text-xs print:bg-white print:text-black print:border print-avoid-break"><p className="font-sans font-bold text-sm mb-2">Código de Verificação:</p><p className="break-all">{verificationHash}</p></div>

             <div className="mt-8 pt-6 border-t print-hidden">
                <div className="flex flex-wrap items-center gap-4">
                    {!isFinal ? (
                        <button onClick={onContinue} className="px-6 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700">{nextStepButtonText()}</button>
                    ) : (
                        <button className="px-6 py-2 bg-gray-200 text-brand-secondary font-semibold rounded-md hover:bg-gray-300" onClick={onFinish}>Finalizar e Voltar ao Início</button>
                    )}
                    <StructuredTooltip 
                        what="Gerar Relatório em PDF"
                        how="Clique para criar documento imprimível"
                        why="Compartilhe ou arquive resultados profissionalmente"
                    >
                        <button className="btn-primary micro-interactive micro-hover micro-click flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700" onClick={() => printReport()}><PrintIcon/> Imprimir / Salvar PDF</button>
                    </StructuredTooltip>
                    <StructuredTooltip 
                        what="Copiar Dados em Base64"
                        how="Clique para copiar código administrativo"
                        why="Permite importação no painel admin"
                    >
                        <button onClick={handleCopyToClipboard} className="micro-interactive micro-hover micro-click px-6 py-2 bg-gray-700 text-white rounded-md shadow-sm hover:bg-gray-800">Copiar Dados para o Admin</button>
                    </StructuredTooltip>
                    {copySuccess && <span className="text-sm font-semibold text-green-600">{copySuccess}</span>}
                </div>
                <div className="text-center mt-8">
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} INFINITUS Sistemas Inteligentes LTDA. | CNPJ: 09.371.580/0001-06 | Versão {APP_VERSION}
                    </p>
                </div>
             </div>
        </div>
    );
};
// bycao (ogrorvatigão) 2025