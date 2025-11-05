import React from 'react';
import { 
    USER_MANUAL_ADMIN_CONTENT, 
    USER_MANUAL_INTERVIEWEE_CONTENT, 
    getExecutiveProjectContent, 
    getEngineeringProjectContent 
} from '../documents';
import { AdminIcon, BookOpenIcon, ClipboardListIcon, ShareIcon, InfinityIcon, UserIcon } from './icons';
import { APP_VERSION } from '../constants';

interface LandingScreenProps {
    onShowAdminLogin: () => void;
    onShowDocumentation: (title: string, content: string) => void;
    onShareLink: () => void;
}

const PrimaryActionButton: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
}> = ({ icon, title, description, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-6 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center gap-5">
            <div className="flex-shrink-0 text-white bg-brand-primary p-4 rounded-full">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
                <p className="text-md text-brand-secondary mt-1">{description}</p>
            </div>
        </div>
    </button>
);


const SecondaryActionButton: React.FC<{
    icon: React.ReactNode;
    title: string;
    onClick?: () => void;
}> = ({ icon, title, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-4 bg-slate-100 rounded-lg hover:bg-slate-200 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-brand-primary">
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-brand-dark text-sm">{title}</h4>
            </div>
        </div>
    </button>
);


export const LandingScreen: React.FC<LandingScreenProps> = ({ onShowAdminLogin, onShowDocumentation, onShareLink }) => {
    return (
        <div className="flex flex-col p-6 md:p-10 bg-slate-50 animate-fadeIn min-h-[calc(100vh-4rem)]">
            <header className="flex flex-col items-center gap-2 text-center pb-8 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark">Sisgead</h1>
                    <p className="text-md text-brand-secondary mt-2">Sistema de Apoio a Gestão de Equipes de Alto Desempenho</p>
                </div>
            </header>

            <main className="flex-grow w-full max-w-4xl mx-auto py-10">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-brand-dark leading-tight">Bem-vindo(a)</h2>
                    <p className="text-lg text-brand-secondary mt-4 max-w-2xl mx-auto">
                        Selecione uma das opções abaixo para iniciar a sua jornada.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-1 gap-6">
                     <PrimaryActionButton
                        icon={<AdminIcon className="w-8 h-8" />}
                        title="Acesso Administrativo"
                        description="Entrar no painel para gerenciar equipes e relatórios."
                        onClick={onShowAdminLogin}
                    />
                    <PrimaryActionButton
                        icon={<ShareIcon className="w-8 h-8" />}
                        title="Envio do questionário ao entrevistado"
                        description="Gerar link e instruções para enviar ao colaborador."
                        onClick={onShareLink}
                    />
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200">
                    <h3 className="text-xl font-bold text-center text-brand-dark mb-6">Documentação e Manuais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SecondaryActionButton
                            icon={<BookOpenIcon className="w-6 h-6" />}
                            title="Manual do Administrador"
                            onClick={() => onShowDocumentation("Manual do Usuário (Admin)", USER_MANUAL_ADMIN_CONTENT)}
                        />
                        <SecondaryActionButton
                            icon={<UserIcon className="w-6 h-6" />}
                            title="Manual do Entrevistado"
                            onClick={() => onShowDocumentation("Manual do Usuário (Entrevistado)", USER_MANUAL_INTERVIEWEE_CONTENT)}
                        />
                        <SecondaryActionButton
                            icon={<ClipboardListIcon className="w-6 h-6" />}
                            title="Projeto Executivo"
                            onClick={() => onShowDocumentation("Projeto Executivo", getExecutiveProjectContent())}
                        />
                        <SecondaryActionButton
                            icon={<InfinityIcon className="w-6 h-6" />}
                            title="Projeto de Engenharia"
                            onClick={() => onShowDocumentation("Projeto de Engenharia", getEngineeringProjectContent())}
                        />
                    </div>
                </div>
            </main>

            <footer className="text-center pt-8 mt-auto border-t border-slate-200">
                 <div className="text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} INFINITUS Sistemas Inteligentes LTDA. | CNPJ: 09.371.580/0001-06</p>
                    <p>Todos os direitos reservados. Versão: {APP_VERSION}</p>
                </div>
            </footer>
        </div>
    );
};
// bycao (ogrorvatigão) 2025