import React, { useState, useMemo } from 'react';
import { type Answer } from '../types';
import { QUESTIONS } from '../constants';

interface QuestionnaireProps {
    onComplete: (answers: Record<number, Answer>) => void;
    onCancel: () => void;
}
export const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete, onCancel }) => {
    const [answers, setAnswers] = useState<Record<number, Answer>>({});
    const progress = useMemo(() => Object.keys(answers).filter(key => {
        const answer = answers[Number(key)];
        return answer && answer.more && answer.less;
    }).length, [answers]);

    const handleSelect = (qid: number, type: 'more' | 'less', word: string) => {
        setAnswers(prev => {
            const currentAnswer = prev[qid] || { more: null, less: null };
            if (type === 'more' && currentAnswer.less === word) return prev;
            if (type === 'less' && currentAnswer.more === word) return prev;
            return { ...prev, [qid]: { ...currentAnswer, [type]: word } };
        });
    };

    const isComplete = progress === QUESTIONS.length;

    return (
        <div className="p-8 animate-slideInUp">
            <h2 className="text-xl font-semibold mb-2">Questionário</h2>
            <p className="text-brand-secondary mb-4">Para cada grupo, selecione a palavra que <strong>MAIS</strong> e a que <strong>MENOS</strong> se parece com você.</p>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${(progress / QUESTIONS.length) * 100}%` }}></div>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                {QUESTIONS.map((q) => (
                    <div key={q.id} className="p-4 border rounded-lg shadow-sm">
                        <p className="font-semibold text-brand-dark mb-3">Grupo {q.id}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-green-600 mb-2 text-center">MAIS</h3>
                                <div className="space-y-2">
                                    {q.items.map(item => (
                                        <button key={item} onClick={() => handleSelect(q.id, 'more', item)} disabled={answers[q.id]?.less === item} className={`w-full text-left p-2 border rounded-md transition-colors text-brand-dark ${answers[q.id]?.more === item ? 'bg-green-100 border-green-400 ring-2 ring-green-300 font-semibold' : 'hover:bg-green-50'} disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500`}>{item}</button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-sm font-bold text-red-600 mb-2 text-center">MENOS</h3>
                                <div className="space-y-2">
                                    {q.items.map(item => (
                                        <button key={item} onClick={() => handleSelect(q.id, 'less', item)} disabled={answers[q.id]?.more === item} className={`w-full text-left p-2 border rounded-md transition-colors text-brand-dark ${answers[q.id]?.less === item ? 'bg-red-100 border-red-400 ring-2 ring-red-300 font-semibold' : 'hover:bg-red-50'} disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500`}>{item}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <div className="flex gap-4 mt-6 pt-4 border-t">
                <button className="px-6 py-2 bg-brand-primary text-white rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400" onClick={() => onComplete(answers)} disabled={!isComplete}>
                    Ver Resultado
                </button>
                <button className="px-6 py-2 bg-gray-200 text-brand-secondary font-semibold rounded-md hover:bg-gray-300" onClick={onCancel}>
                    Cancelar
                </button>
            </div>
        </div>
    );
};
// bycao (ogrorvatigão) 2025