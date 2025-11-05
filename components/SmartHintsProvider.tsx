import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSmartHints } from './SmartHints';
import { useContextDetection } from '../utils/ContextDetection';
import { getRelevantHints } from '../data/smartHintsDatabase';
import SmartHintComponent from './SmartHints';

interface SmartHintsContextType {
    showHint: (hintId: string) => void;
    dismissHint: (hintId: string) => void;
    clearAllHints: () => void;
    resetUserData: () => void;
}

const SmartHintsContext = createContext<SmartHintsContextType | null>(null);

export const useSmartHintsSystem = () => {
    const context = useContext(SmartHintsContext);
    if (!context) {
        throw new Error('useSmartHintsSystem must be used within SmartHintsProvider');
    }
    return context;
};

export const SmartHintsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeHints, showHint, dismissHint, clearAllHints } = useSmartHints();
    const { context, markHintCompleted, resetUserData } = useContextDetection();
    const evaluationTimeoutRef = useRef<NodeJS.Timeout>();

    // Engine principal que avalia hints baseado no contexto (otimizado)
    useEffect(() => {
        // Cancelar avaliação anterior se houver
        if (evaluationTimeoutRef.current) {
            clearTimeout(evaluationTimeoutRef.current);
        }

        const evaluateHints = () => {
            const relevantHints = getRelevantHints(context);
            
            // Mostrar hints que atendem às condições
            relevantHints.forEach(hint => {
                // Verificar se já está sendo mostrado
                if (!activeHints.find(h => h.id === hint.id)) {
                    showHint(hint);
                }
            });
        };

        // Avaliar hints quando o contexto muda (debounced)
        evaluationTimeoutRef.current = setTimeout(evaluateHints, 500);

        return () => {
            if (evaluationTimeoutRef.current) {
                clearTimeout(evaluationTimeoutRef.current);
            }
        };
    }, [context.currentPage, context.idleTime, context.completedHints.length, activeHints.length]); // Dependencies otimizadas

    // Handler para dismiss de hints
    const handleDismissHint = (hintId: string) => {
        dismissHint(hintId);
        markHintCompleted(hintId);
    };

    // Handler para ações de hints
    const handleHintAction = (hintId: string, action: string) => {
        console.log(`Smart Hint Action: ${hintId} -> ${action}`);
        // Aqui podem ser adicionados analytics ou outras ações
    };

    // Função para mostrar hint específico manualmente
    const manualShowHint = (hintId: string) => {
        const hintData = require('../data/smartHintsDatabase').getHintById(hintId);
        if (hintData) {
            showHint(hintData);
        }
    };

    const contextValue: SmartHintsContextType = {
        showHint: manualShowHint,
        dismissHint: handleDismissHint,
        clearAllHints,
        resetUserData
    };

    return (
        <SmartHintsContext.Provider value={contextValue}>
            {children}
            
            {/* Renderizar hints ativos */}
            {activeHints.map(hint => (
                <SmartHintComponent
                    key={hint.id}
                    hint={hint}
                    onDismiss={handleDismissHint}
                    onAction={handleHintAction}
                />
            ))}
            
            {/* Debug info em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'fixed',
                    bottom: '10px',
                    left: '10px',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    zIndex: 10000,
                    maxWidth: '200px'
                }}>
                    <div>Page: {context.currentPage}</div>
                    <div>Idle: {Math.floor(context.idleTime / 1000)}s</div>
                    <div>Time on page: {Math.floor(context.timeOnPage / 1000)}s</div>
                    <div>Active hints: {activeHints.length}</div>
                    <div>Completed: {context.completedHints.length}</div>
                    {context.lastError && <div>Last error: {context.lastError.substring(0, 30)}...</div>}
                </div>
            )}
        </SmartHintsContext.Provider>
    );
};

export default SmartHintsProvider;