import React, { useState, useEffect, useRef } from 'react';

export interface SmartHint {
    id: string;
    trigger: 'idle' | 'error' | 'hover' | 'pattern' | 'first_time' | 'manual';
    condition: (context: UserContext) => boolean;
    title: string;
    message: string;
    icon?: string;
    priority: 'low' | 'medium' | 'high';
    showOnce?: boolean;
    dismissible?: boolean;
    actionButton?: {
        text: string;
        action: () => void;
    };
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
    duration?: number; // ms, 0 = manual dismiss only
}

export interface UserContext {
    currentPage: string;
    idleTime: number;
    lastError?: string;
    hoverTarget?: string;
    sessionActions: string[];
    isFirstVisit: boolean;
    completedHints: string[];
    timeOnPage: number;
}

interface SmartHintComponentProps {
    hint: SmartHint;
    onDismiss: (hintId: string) => void;
    onAction?: (hintId: string, action: string) => void;
}

export const SmartHintComponent: React.FC<SmartHintComponentProps> = ({
    hint,
    onDismiss,
    onAction
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Animação de entrada
        setIsVisible(true);
        setIsAnimating(true);
        
        const animationTimer = setTimeout(() => {
            setIsAnimating(false);
        }, 300);

        // Auto dismiss se tiver duração
        if (hint.duration && hint.duration > 0) {
            timeoutRef.current = setTimeout(() => {
                handleDismiss();
            }, hint.duration);
        }

        return () => {
            clearTimeout(animationTimer);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [hint.duration]);

    const handleDismiss = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsVisible(false);
            onDismiss(hint.id);
        }, 200);
    };

    const handleAction = () => {
        if (hint.actionButton) {
            hint.actionButton.action();
            onAction?.(hint.id, 'action_clicked');
            handleDismiss();
        }
    };

    if (!isVisible) return null;

    const getPositionClasses = () => {
        const base = "fixed z-[9999] max-w-sm";
        switch (hint.position) {
            case 'top-left':
                return `${base} top-4 left-4`;
            case 'top-right':
                return `${base} top-4 right-4`;
            case 'bottom-left':
                return `${base} bottom-4 left-4`;
            case 'bottom-right':
                return `${base} bottom-4 right-4`;
            case 'center':
                return `${base} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
            default:
                return `${base} top-4 right-4`;
        }
    };

    const getPriorityStyles = () => {
        switch (hint.priority) {
            case 'high':
                return {
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
                    borderColor: '#f59e0b',
                    shadow: '0 8px 25px rgba(251, 191, 36, 0.3)'
                };
            case 'medium':
                return {
                    background: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)',
                    borderColor: '#2563eb',
                    shadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                };
            case 'low':
                return {
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderColor: '#0ea5e9',
                    shadow: '0 6px 20px rgba(14, 165, 233, 0.2)'
                };
        }
    };

    const priorityStyles = getPriorityStyles();

    return (
        <div 
            className={`${getPositionClasses()} transition-all duration-300 ${
                isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
            }`}
            style={{
                background: priorityStyles.background,
                border: `2px solid ${priorityStyles.borderColor}`,
                borderRadius: '16px',
                boxShadow: priorityStyles.shadow,
                backdropFilter: 'blur(12px)',
                padding: '16px',
                minWidth: '280px'
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {hint.icon && (
                        <span className="text-lg">{hint.icon}</span>
                    )}
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                        {hint.title}
                    </h4>
                </div>
                
                {hint.dismissible !== false && (
                    <button
                        onClick={handleDismiss}
                        className="text-gray-500 hover:text-gray-700 transition-colors ml-2"
                        style={{ fontSize: '18px', lineHeight: '1' }}
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Message */}
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {hint.message}
            </p>

            {/* Action Button */}
            {hint.actionButton && (
                <div className="flex justify-end">
                    <button
                        onClick={handleAction}
                        className="px-4 py-2 bg-white bg-opacity-90 text-gray-800 text-xs font-medium rounded-lg hover:bg-opacity-100 transition-all duration-200 shadow-sm border border-gray-200"
                    >
                        {hint.actionButton.text}
                    </button>
                </div>
            )}

            {/* Progress indicator for timed hints */}
            {hint.duration && hint.duration > 0 && (
                <div className="mt-3 h-1 bg-black bg-opacity-10 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-current opacity-30 transition-all ease-linear"
                        style={{
                            width: '100%',
                            animation: `shrink ${hint.duration}ms linear`
                        }}
                    />
                </div>
            )}

            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

// Hook para gerenciar Smart Hints
export const useSmartHints = () => {
    const [activeHints, setActiveHints] = useState<SmartHint[]>([]);
    const [userContext, setUserContext] = useState<UserContext>({
        currentPage: '',
        idleTime: 0,
        sessionActions: [],
        isFirstVisit: true,
        completedHints: [],
        timeOnPage: 0
    });

    const showHint = (hint: SmartHint) => {
        // Verificar se já foi mostrado (se showOnce = true)
        if (hint.showOnce && userContext.completedHints.includes(hint.id)) {
            return;
        }

        // Verificar condição
        if (!hint.condition(userContext)) {
            return;
        }

        // Adicionar à lista de hints ativos se não estiver já
        setActiveHints(prev => {
            if (prev.find(h => h.id === hint.id)) return prev;
            return [...prev, hint].sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
        });
    };

    const dismissHint = (hintId: string) => {
        setActiveHints(prev => prev.filter(h => h.id !== hintId));
        
        // Marcar como completado
        setUserContext(prev => ({
            ...prev,
            completedHints: [...prev.completedHints, hintId]
        }));
    };

    const updateContext = (updates: Partial<UserContext>) => {
        setUserContext(prev => ({ ...prev, ...updates }));
    };

    const clearAllHints = () => {
        setActiveHints([]);
    };

    return {
        activeHints,
        userContext,
        showHint,
        dismissHint,
        updateContext,
        clearAllHints
    };
};

export default SmartHintComponent;