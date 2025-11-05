import React from 'react';
import { UserIcon, BookOpenIcon } from './icons';
import { maskCPF, validateCPF } from '../utils/helpers';
import { sanitizeName } from '../utils/sanitize';
import { APP_VERSION } from '../constants';

interface WelcomeScreenProps {
    name: string;
    setName: (name: string) => void;
    cpf: string;
    setCpf: (cpf: string) => void;
    onStart: () => void;
    onShowManual: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ name, setName, cpf, setCpf, onStart, onShowManual }) => {
    const isFormValid = name.trim().length > 2 && validateCPF(cpf);

    return (
        <div className="animate-fadeIn flex flex-col">
            <header className="p-8 text-center border-b">
                <h1 className="text-3xl font-bold text-brand-dark leading-tight">SISTEMA DE APOIO A GESTÃO DE EQUIPES DE ALTO DESEMPENHO</h1>
                <p className="text-lg text-brand-secondary mt-2">Diagnóstico de Comunicação e Comportamento (DISC)</p>
                <p className="text-sm text-slate-500 max-w-3xl mx-auto mt-6">
                    Análise comportamental baseada na teoria de William Moulton Marston, indicando tendências e preferências de estilo de trabalho.
                </p>
            </header>
            <main className="p-8 flex-grow">
                <div className="flex items-center gap-3">
                    <UserIcon className="w-8 h-8 text-brand-primary" />
                    <h2 className="text-2xl font-bold text-brand-dark">Acesso do Usuário</h2>
                </div>
                <p className="text-brand-secondary mt-2">Preencha seus dados para iniciar o diagnóstico de perfil.</p>
                <div className="space-y-4 mt-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome completo</label>
                        <input type="text" id="name" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-brand-dark placeholder-gray-600 focus:outline-none focus:ring-brand-primary focus:border-brand-primary" value={name} onChange={e => setName(sanitizeName(e.target.value))} placeholder="Seu nome completo" />
                    </div>
                    <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                        <input type="text" id="cpf" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-brand-dark placeholder-gray-600 focus:outline-none focus:ring-brand-primary focus:border-brand-primary" value={cpf} onChange={e => setCpf(maskCPF(e.target.value))} placeholder="000.000.000-00" />
                    </div>
                </div>
                <button
                    className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={onStart}
                    disabled={!isFormValid}
                >
                    Iniciar Avaliação
                </button>
                 <div className="text-center mt-4">
                    <button
                        onClick={onShowManual}
                        className="inline-flex items-center gap-2 text-sm text-brand-secondary hover:text-brand-primary hover:underline"
                    >
                        <BookOpenIcon className="w-4 h-4" />
                        Precisa de ajuda? Consulte o guia do usuário
                    </button>
                </div>
            </main>
            <footer className="text-center p-4 mt-auto border-t border-slate-200">
                <div className="text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} INFINITUS Sistemas Inteligentes LTDA. | CNPJ: 09.371.580/0001-06</p>
                    <p>Versão {APP_VERSION}</p>
                </div>
            </footer>
        </div>
    );
};
// bycao (ogrorvatigão) 2025