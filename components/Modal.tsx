import React from 'react';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    footerContent?: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, footerContent, size = '4xl' }) => {
    const sizeClasses: Record<typeof size, string> = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className={`bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`} 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 id="modal-title" className="text-xl font-bold text-brand-dark">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold" aria-label="Close modal">&times;</button>
                </header>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
                {footerContent && (
                    <footer className="p-4 border-t bg-slate-50 text-right sticky bottom-0 z-10">
                        {footerContent}
                    </footer>
                )}
            </div>
        </div>
    );
};
// bycao (ogrorvatigão) 2025