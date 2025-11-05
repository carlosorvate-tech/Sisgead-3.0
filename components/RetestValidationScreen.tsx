import React from 'react';
import { type AuditRecord, type RetestReason } from '../types';

interface RetestValidationScreenProps {
    targetRecord: AuditRecord;
    onConfirm: (reason: RetestReason) => void;
    onCancel: () => void;
}

export const RetestValidationScreen: React.FC<RetestValidationScreenProps> = ({ targetRecord, onConfirm, onCancel }) => {
    // Estados principais
    const [providedId, setProvidedId] = React.useState('');
    const [reason, setReason] = React.useState('');

    // Função para normalizar strings
    const normalizeString = (str: string): string => {
        try {
            return String(str || '').trim().toUpperCase();
        } catch (e) {
            console.error('Erro ao normalizar string:', e);
            return '';
        }
    };

    // Validações computadas
    const isIdValid = React.useMemo(() => {
        const provided = normalizeString(providedId);
        const expected = normalizeString(targetRecord?.id || '');
        const valid = provided.length > 0 && provided === expected;
        

        
        return valid;
    }, [providedId, targetRecord?.id]);

    const isReasonValid = React.useMemo(() => {
        const valid = Boolean(reason && reason.trim().length > 0);
        

        
        return valid;
    }, [reason]);

    const canProceed = React.useMemo(() => {
        const proceed = isIdValid && isReasonValid;
        

        
        return proceed;
    }, [isIdValid, isReasonValid]);



    return (
        <div className="p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-brand-dark">Validação de Reavaliação</h2>
            <p className="text-brand-secondary mt-2">Detectamos que já existe uma avaliação para o CPF informado, realizada em <strong className="text-brand-dark">{new Date(targetRecord.date).toLocaleDateString()}</strong>.</p>
            <p className="text-brand-secondary mt-1 mb-6">Para prosseguir com uma nova avaliação, por favor, confirme os dados abaixo.</p>

            <div className="space-y-4">
                <div>
                    <label htmlFor="reportId" className="block text-sm font-medium text-gray-700">ID do Relatório Anterior</label>
                    <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-md">
                        <div className="text-xs text-slate-600 mb-2">ID esperado (encontre este código no seu relatório anterior):</div>
                        <div className="flex items-center gap-2">
                            <div className="font-mono text-sm text-slate-800 bg-white p-2 rounded border select-all flex-1">
                                {targetRecord.id}
                            </div>
                            <button
                                type="button"
                                onClick={() => setProvidedId(targetRecord.id)}
                                className="px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Preencher automaticamente"
                            >
                                Usar este ID
                            </button>
                        </div>
                    </div>
                    <input
                        type="text"
                        id="reportId"
                        value={providedId}
                        onChange={(e) => setProvidedId(e.target.value)}
                        className={`mt-2 block w-full px-3 py-2 bg-white border rounded-md shadow-sm text-brand-dark placeholder-gray-600 focus:outline-none focus:ring-2 ${
                            providedId && !isIdValid 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : isIdValid
                                ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                                : 'border-gray-300 focus:ring-brand-primary focus:border-brand-primary'
                        }`}
                        placeholder="Cole ou digite o ID do relatório anterior aqui"
                    />
                    {providedId && !isIdValid && (
                        <p className="mt-1 text-sm text-red-600">
                            ⚠️ ID não confere. Esperado: {targetRecord.id} | Digitado: {providedId}
                        </p>
                    )}
                    {isIdValid && (
                        <p className="mt-1 text-sm text-green-600">
                            ✓ ID correto confirmado!
                        </p>
                    )}
                </div>
                <div>
                    <label htmlFor="retestReason" className="block text-sm font-medium text-gray-700">
                        Motivo da Reavaliação
                        {isReasonValid && <span className="ml-2 text-green-600">✓</span>}
                    </label>
                    <select
                        id="retestReason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm text-brand-dark focus:outline-none focus:ring-2 ${
                            isReasonValid 
                                ? 'border-green-300 focus:ring-green-500 focus:border-green-500' 
                                : 'border-gray-300 focus:ring-brand-primary focus:border-brand-primary'
                        }`}
                    >
                        <option value="" disabled>Selecione um motivo...</option>
                        <option value="Adaptação">Adaptação - Mudança de função ou contexto</option>
                        <option value="Treinamento">Treinamento - Desenvolvimento de habilidades</option>
                        <option value="Revisão Técnica">Revisão Técnica - Validação ou atualização</option>
                    </select>
                </div>
            </div>

            {/* Status indicator */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Status da Validação:</h3>
                <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                        {isIdValid ? (
                            <span className="text-green-600 text-lg">✓</span>
                        ) : (
                            <span className="text-gray-400 text-lg">○</span>
                        )}
                        <span className={isIdValid ? 'text-green-700 font-medium' : 'text-gray-600'}>
                            ID do relatório confirmado {isIdValid ? '(✓ Válido)' : '(Pendente)'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isReasonValid ? (
                            <span className="text-green-600 text-lg">✓</span>
                        ) : (
                            <span className="text-gray-400 text-lg">○</span>
                        )}
                        <span className={isReasonValid ? 'text-green-700 font-medium' : 'text-gray-600'}>
                            Motivo da reavaliação selecionado {isReasonValid ? `(${reason})` : '(Pendente)'}
                        </span>
                    </div>
                </div>
                {canProceed && (
                    <div className="mt-2 text-sm text-green-700 font-medium">
                        ✓ Tudo pronto! Você pode prosseguir com a nova avaliação.
                    </div>
                )}
            </div>

            <div className="flex gap-4 mt-6 pt-4 border-t">
                <button
                    onClick={() => {
                        if (canProceed && isReasonValid && isIdValid) {
                            onConfirm(reason as RetestReason);
                        }
                    }}
                    disabled={!canProceed}
                    className={`px-6 py-2 rounded-md shadow-sm font-medium transition-all duration-200 ${
                        canProceed 
                            ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105' 
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                    }`}
                    title={!canProceed ? `Status: ID ${isIdValid ? 'válido' : 'inválido'}, Motivo ${isReasonValid ? 'selecionado' : 'pendente'}` : 'Tudo pronto! Clique para iniciar nova avaliação'}
                >
                    {canProceed ? '✓ Confirmar e Iniciar' : 'Confirmar e Iniciar (Pendente)'}
                </button>
                <button onClick={onCancel} className="px-6 py-2 bg-gray-200 text-brand-secondary font-semibold rounded-md hover:bg-gray-300">
                    Cancelar
                </button>
            </div>
        </div>
    );
};
// bycao (ogrorvatigão) 2025