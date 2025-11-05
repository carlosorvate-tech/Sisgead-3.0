import React, { useState } from 'react';
import { type ResilienceAndCollaborationProfile, ConflictStyle, PressureResponse, FeedbackPreference } from '../types';
import { CONFLICT_STYLES, PRESSURE_RESPONSES, FEEDBACK_PREFERENCES, CORE_VALUES } from '../constants';

interface ResilienceCollaborationScreenProps {
    onComplete: (profile: ResilienceAndCollaborationProfile) => void;
    onSkip: () => void;
}

const SelectionGroup: React.FC<{
    label: string;
    options: string[];
    selectedValue: string;
    onChange: (value: any) => void;
}> = ({ label, options, selectedValue, onChange }) => (
    <section>
        <label className="block text-lg font-semibold text-gray-800 mb-3">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${selectedValue === option ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white hover:bg-indigo-50 text-gray-700'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    </section>
);


export const ResilienceCollaborationScreen: React.FC<ResilienceCollaborationScreenProps> = ({ onComplete, onSkip }) => {
    const [profile, setProfile] = useState<Partial<ResilienceAndCollaborationProfile>>({
        coreValues: []
    });

    const handleCoreValueToggle = (value: string) => {
        setProfile(prev => {
            const currentValues = prev.coreValues || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            
            if (newValues.length > 3) return prev; // Limit to 3
            
            return { ...prev, coreValues: newValues };
        });
    };

    const isComplete = profile.conflictStyle && profile.pressureResponse && profile.feedbackReception && profile.feedbackGiving && profile.coreValues && profile.coreValues.length > 0;

    const handleSubmit = () => {
        if (isComplete) {
            onComplete(profile as ResilienceAndCollaborationProfile);
        }
    };
    
    return (
        <div className="p-8 animate-slideInUp">
            <h2 className="text-2xl font-bold text-brand-dark">Perfil de Resiliência e Colaboração (Opcional)</h2>
            <p className="text-brand-secondary mt-2 mb-6">Estas respostas nos dão insights valiosos sobre como você interage sob diferentes circunstâncias, permitindo criar um ambiente de trabalho mais sinérgico.</p>

            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4">
                <SelectionGroup
                    label="Quando surge um conflito, sua tendência natural é..."
                    options={CONFLICT_STYLES}
                    selectedValue={profile.conflictStyle || ''}
                    onChange={(value) => setProfile(p => ({ ...p, conflictStyle: value }))}
                />

                <SelectionGroup
                    label="Em um prazo crítico ou sob pressão, como você geralmente reage?"
                    options={PRESSURE_RESPONSES}
                    selectedValue={profile.pressureResponse || ''}
                    onChange={(value) => setProfile(p => ({ ...p, pressureResponse: value }))}
                />
                
                <SelectionGroup
                    label="Como você prefere RECEBER feedback?"
                    options={FEEDBACK_PREFERENCES}
                    selectedValue={profile.feedbackReception || ''}
                    onChange={(value) => setProfile(p => ({ ...p, feedbackReception: value }))}
                />

                <SelectionGroup
                    label="Como você costuma DAR feedback?"
                    options={FEEDBACK_PREFERENCES}
                    selectedValue={profile.feedbackGiving || ''}
                    onChange={(value) => setProfile(p => ({ ...p, feedbackGiving: value }))}
                />

                <section>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Quais valores são inegociáveis para você no trabalho? (Escolha até 3)</label>
                    <div className="flex flex-wrap gap-2">
                        {CORE_VALUES.map(value => (
                           <button
                                key={value}
                                onClick={() => handleCoreValueToggle(value)}
                                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${(profile.coreValues || []).includes(value) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white hover:bg-indigo-50 text-gray-700'}`}
                           >
                                {value}
                           </button>
                        ))}
                    </div>
                </section>
            </div>

            <div className="flex gap-4 mt-6 pt-6 border-t">
                <button onClick={handleSubmit} disabled={!isComplete} className="px-6 py-2 bg-brand-primary text-white rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">Concluir e Salvar</button>
                <button onClick={onSkip} className="px-6 py-2 bg-gray-200 text-brand-secondary font-semibold rounded-md hover:bg-gray-300">Pular Etapa</button>
            </div>
        </div>
    );
};