import React, { useState, useRef, useEffect } from 'react';

// Tipos para o sistema de tooltips
export interface TooltipContent {
    what: string;    // O quê? (Nome/Função)
    how: string;     // Como? (Ação)  
    why: string;     // Por quê? (Resultado/Benefício)
    format?: string; // Formato esperado (opcional)
}

export interface TooltipProps {
    content: string | TooltipContent;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    delay?: number;
    disabled?: boolean;
    maxWidth?: number;
    children: React.ReactNode;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    position = 'auto',
    delay = 400,
    disabled = false,
    maxWidth = 360,
    children,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [calculatedPosition, setCalculatedPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // Função para calcular melhor posição
    const calculatePosition = (): 'top' | 'bottom' | 'left' | 'right' => {
        if (position !== 'auto') return position as 'top' | 'bottom' | 'left' | 'right';
        
        if (!triggerRef.current) return 'top';
        
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Prioridade: top -> bottom -> right -> left
        if (rect.top > 100) return 'top';
        if (rect.bottom < viewportHeight - 100) return 'bottom';
        if (rect.right < viewportWidth - 300) return 'right';
        return 'left';
    };

    // Handlers de mouse e teclado
    const showTooltip = () => {
        if (disabled) return;
        
        timeoutRef.current = setTimeout(() => {
            setCalculatedPosition(calculatePosition());
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    };

    // Cleanup no unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Renderização do conteúdo do tooltip
    const renderContent = () => {
        if (typeof content === 'string') {
            return <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.0', margin: 0, textAlign: 'center' }}>{content}</p>;
        }

        return (
            <div style={{ lineHeight: '1.0', margin: 0, padding: 0 }}>
                <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#111827', 
                    lineHeight: '1.0',
                    marginBottom: '1px'
                }}>
                    {content.what}
                </div>
                <div style={{ 
                    fontSize: '11px', 
                    color: '#1d4ed8', 
                    lineHeight: '1.0', 
                    marginBottom: '1px' 
                }}>
                    {content.how}
                </div>
                <div style={{ 
                    fontSize: '11px', 
                    color: '#059669', 
                    lineHeight: '1.0' 
                }}>
                    {content.why}
                </div>
                {content.format && (
                    <div style={{ 
                        fontSize: '10px', 
                        color: '#6b7280', 
                        fontStyle: 'italic', 
                        lineHeight: '1.0', 
                        marginTop: '1px' 
                    }}>
                        Ex: {content.format}
                    </div>
                )}
            </div>
        );
    };

    // Classes CSS para posicionamento (formato balão)
    const getPositionClasses = () => {
        const baseClasses = "absolute z-50 text-sm bg-white border border-gray-300 shadow-xl";
        // Formato balão com bordas super arredondadas
        
        switch (calculatedPosition) {
            case 'top':
                return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2 before:content-[''] before:absolute before:top-full before:left-1/2 before:transform before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-white`;
            case 'bottom':
                return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2 before:content-[''] before:absolute before:bottom-full before:left-1/2 before:transform before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-white`;
            case 'left':
                return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2 before:content-[''] before:absolute before:left-full before:top-1/2 before:transform before:-translate-y-1/2 before:border-4 before:border-transparent before:border-l-white`;
            case 'right':
                return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2 before:content-[''] before:absolute before:right-full before:top-1/2 before:transform before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-white`;
            default:
                return baseClasses;
        }
    };

    return (
        <div 
            ref={triggerRef}
            className={`relative inline-block ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            // Suporte a teclado
            tabIndex={0}
        >
            {children}
            
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={getPositionClasses()}
                    style={{ 
                        maxWidth: `${maxWidth}px`,
                        minWidth: '120px',
                        padding: '6px 10px', 
                        lineHeight: '1.0',
                        fontSize: '13px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        backdropFilter: 'blur(8px)'
                    }}
                    role="tooltip"
                    aria-hidden={!isVisible}
                >
                    {renderContent()}
                </div>
            )}
        </div>
    );
};

// Hook para facilitar uso de tooltips estruturados
export const useTooltip = () => {
    const createTooltipContent = (
        what: string,
        how: string,
        why: string,
        format?: string
    ): TooltipContent => ({
        what,
        how,
        why,
        format
    });

    return { createTooltipContent };
};

// Componente de conveniência para tooltips simples
export const SimpleTooltip: React.FC<{
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ text, children, position = 'top' }) => (
    <Tooltip content={text} position={position}>
        {children}
    </Tooltip>
);

// Componente de conveniência para tooltips estruturados  
export const StructuredTooltip: React.FC<{
    what: string;
    how: string;
    why: string;
    format?: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ what, how, why, format, children, position = 'auto' }) => (
    <Tooltip 
        content={{ what, how, why, format }} 
        position={position}
    >
        {children}
    </Tooltip>
);

export default Tooltip;