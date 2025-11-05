import React, { useState } from 'react';
import { type IdentityProfile, type Motivator, type LearningStyle, type WorkEnvironment } from '../types';
import { MOTIVATORS, LEARNING_STYLES, WORK_ENVIRONMENTS } from '../constants';
import { sanitizeString } from '../utils/sanitize';

interface IdentityContextScreenProps {
    onComplete: (identityProfile: IdentityProfile) => void;
    onSkip: () => void;
}

const CheckboxButton: React.FC<{
    label: string;
    isSelected: boolean;
    onToggle: () => void;
}> = ({ label, isSelected, onToggle }) => (
    <button
        onClick={onToggle}
        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${isSelected ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white hover:bg-indigo-50 text-gray-700'}`}
    >
        {label}
    </button>
);


export const IdentityContextScreen: React.FC<IdentityContextScreenProps> = ({ onComplete, onSkip }) => {
    const [profile, setProfile] = useState<IdentityProfile>({
        motivators: [],
        learningStyles: [],
        idealEnvironment: [],
        humanisticExperiences: '',
        personalPurpose: ''
    });

    const handleToggle = <T extends string>(field: keyof IdentityProfile, value: T) => {
        setProfile(prev => {
            const currentValues = (prev[field] as T[]) || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    };
    
    const handleComplete = () => {
        const sanitizedProfile: IdentityProfile = {
            ...profile,
            humanisticExperiences: sanitizeString(profile.humanisticExperiences),
            personalPurpose: sanitizeString(profile.personalPurpose),
        };
        onComplete(sanitizedProfile);
    };

    return (
        <div className="p-8 animate-slideInUp">
            <h2 className="text-2xl font-bold text-brand-dark">Contexto e Identidade (Opcional)</h2>
            <p className="text-brand-secondary mt-2 mb-6">Suas respostas aqui nos ajudam a entender não apenas *o que* você faz bem, mas *por que* e *em que contexto* você prospera.</p>

            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4">
                <section>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">O que mais te motiva no trabalho?</label>
                    <div className="flex flex-wrap gap-2">
                        {MOTIVATORS.map(m => (
                           <CheckboxButton key={m} label={m} isSelected={profile.motivators.includes(m)} onToggle={() => handleToggle('motivators', m)} />
                        ))}
                    </div>
                </section>

                <section>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Qual seu ambiente de trabalho ideal?</label>
                    <div className="flex flex-wrap gap-2">
                        {WORK_ENVIRONMENTS.map(we => (
                           <CheckboxButton key={we} label={we} isSelected={profile.idealEnvironment.includes(we)} onToggle={() => handleToggle('idealEnvironment', we)} />
                        ))}
                    </div>
                </section>
                
                <section>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Como você aprende melhor?</label>
                    <div className="flex flex-wrap gap-2">
                        {LEARNING_STYLES.map(ls => (
                            <CheckboxButton key={ls} label={ls} isSelected={profile.learningStyles.includes(ls)} onToggle={() => handleToggle('learningStyles', ls)} />
                        ))}
                    </div>
                </section>

                <section>
                    <label htmlFor="humanistic" className="block text-lg font-semibold text-gray-800 mb-3">Descreva brevemente experiências (profissionais ou não) que você considera importantes para sua formação humana (ex: voluntariado, liderança de grupos, artes, etc).</label>
                    <textarea
                        id="humanistic"
                        rows={3}
                        value={profile.humanisticExperiences}
                        onChange={e => setProfile(p => ({...p, humanisticExperiences: e.target.value}))}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="Ex: Fui líder de um grupo de estudos por 2 anos, onde aprendi a mediar conflitos e motivar pessoas."
                    />
                </section>

                 <section>
                    <label htmlFor="purpose" className="block text-lg font-semibold text-gray-800 mb-3">Qual é o seu propósito ou o que você busca realizar através do seu trabalho?</label>
                    <textarea
                        id="purpose"
                        rows={3}
                        value={profile.personalPurpose}
                        onChange={e => setProfile(p => ({...p, personalPurpose: e.target.value}))}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="Ex: Busco usar minhas habilidades para criar soluções que simplifiquem a vida das pessoas e gerem um impacto positivo."
                    />
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