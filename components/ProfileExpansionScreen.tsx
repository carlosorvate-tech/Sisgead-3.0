import React, { useState } from 'react';
import { type ProfessionalProfile, type MethodologicalProfile, type ContextualProfile, type ExperienceLevel, type ProfessionalArea, type Methodologies, type AgileRoles } from '../types';
import { PROFESSIONAL_AREAS } from '../constants';
import { sanitizeTags, sanitizeString } from '../utils/sanitize';

interface ProfileExpansionScreenProps {
    onComplete: (
        techProfile: ProfessionalProfile,
        methodProfile: MethodologicalProfile,
        ctxProfile: ContextualProfile
    ) => void;
    onSkip: () => void;
}

export const ProfileExpansionScreen: React.FC<ProfileExpansionScreenProps> = ({ onComplete, onSkip }) => {
    const [profProfile, setProfProfile] = useState<ProfessionalProfile>({ primaryArea: 'Outra', experienceLevel: 3, skills: [] });
    const [methodProfile, setMethodProfile] = useState<MethodologicalProfile>({ methodologies: [], roles: [] });
    const [ctxProfile, setCtxProfile] = useState<ContextualProfile>({ availability: 100, location: 'Remoto', concurrentProjects: 1 });
    const [skillsInput, setSkillsInput] = useState('');

    const handleComplete = () => {
        const finalProfProfile = {
            ...profProfile,
            skills: sanitizeTags(skillsInput.split(',')),
        };
        onComplete(finalProfProfile, methodProfile, ctxProfile);
    };
    
    const handleMethodologyChange = (method: Methodologies) => {
        setMethodProfile(prev => ({ ...prev, methodologies: prev.methodologies.includes(method) ? prev.methodologies.filter(m => m !== method) : [...prev.methodologies, method] }));
    };
    
    const handleRoleChange = (role: AgileRoles) => {
        setMethodProfile(prev => ({ ...prev, roles: prev.roles.includes(role) ? prev.roles.filter(r => r !== role) : [...prev.roles, role] }));
    };

    return (
        <div className="p-8 animate-slideInUp">
            <h2 className="text-2xl font-bold text-brand-dark">Expansão de Perfil (Opcional)</h2>
            <p className="text-brand-secondary mt-2 mb-6">Forneça mais detalhes para receber análises de equipe e sugestões de papéis mais precisas.</p>

            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4">
                {/* Professional Profile */}
                <section>
                    <h3 className="text-lg font-semibold text-brand-dark border-b pb-2 mb-4">Perfil Profissional</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Área de Atuação Principal</label>
                            <select value={profProfile.primaryArea} onChange={e => setProfProfile(p => ({...p, primaryArea: e.target.value as ProfessionalArea}))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                {PROFESSIONAL_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nível de Experiência ({profProfile.experienceLevel}/5)</label>
                            <input type="range" min="1" max="5" value={profProfile.experienceLevel} onChange={e => setProfProfile(p => ({...p, experienceLevel: parseInt(e.target.value) as ExperienceLevel}))} className="mt-1 block w-full" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Habilidades e Competências (separadas por vírgula)</label>
                        <input type="text" value={skillsInput} onChange={e => setSkillsInput(sanitizeString(e.target.value))} placeholder="Ex: Gestão de Projetos, Análise de Dados, Liderança" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                </section>

                {/* Methodological Profile */}
                <section>
                    <h3 className="text-lg font-semibold text-brand-dark border-b pb-2 mb-4">Perfil Metodológico</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Metodologias com Experiência</label>
                        <div className="flex flex-wrap gap-2">
                            {(['Scrum', 'Kanban', 'Holocracia', 'SAFe', 'Lean'] as Methodologies[]).map(m => (
                                <button key={m} onClick={() => handleMethodologyChange(m)} className={`px-3 py-1 text-sm rounded-full border ${methodProfile.methodologies.includes(m) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white hover:bg-blue-50'}`}>{m}</button>
                            ))}
                        </div>
                    </div>
                     <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Papéis Desempenhados</label>
                        <div className="flex flex-wrap gap-2">
                            {(['Product Owner', 'Scrum Master', 'Team Member', 'Agile Coach'] as AgileRoles[]).map(r => (
                                <button key={r} onClick={() => handleRoleChange(r)} className={`px-3 py-1 text-sm rounded-full border ${methodProfile.roles.includes(r) ? 'bg-green-500 text-white border-green-500' : 'bg-white hover:bg-green-50'}`}>{r}</button>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Contextual Profile */}
                <section>
                    <h3 className="text-lg font-semibold text-brand-dark border-b pb-2 mb-4">Contexto de Trabalho</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Disponibilidade ({ctxProfile.availability}%)</label>
                            <input type="range" min="0" max="100" step="10" value={ctxProfile.availability} onChange={e => setCtxProfile(p => ({...p, availability: parseInt(e.target.value)}))} className="mt-1 block w-full" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Local de Trabalho</label>
                             <select value={ctxProfile.location} onChange={e => setCtxProfile(p => ({...p, location: e.target.value as any}))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                <option>Remoto</option>
                                <option>Híbrido</option>
                                <option>Presencial</option>
                             </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Projetos Simultâneos</label>
                            <input type="number" min="0" value={ctxProfile.concurrentProjects} onChange={e => setCtxProfile(p => ({...p, concurrentProjects: parseInt(e.target.value) || 0}))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                </section>
            </div>

            <div className="flex gap-4 mt-6 pt-6 border-t">
                <button onClick={handleComplete} className="px-6 py-2 bg-brand-primary text-white rounded-md shadow-sm hover:bg-blue-700">Concluir e Salvar</button>
                <button onClick={onSkip} className="px-6 py-2 bg-gray-200 text-brand-secondary font-semibold rounded-md hover:bg-gray-300">Pular Etapa</button>
            </div>
        </div>
    );
};
// bycao (ogrorvatigão) 2025