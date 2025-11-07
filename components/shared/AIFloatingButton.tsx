/**
 * AI Floating Button - Botão Flutuante Universal do Assistente IA
 * 
 * Aparece em todos os dashboards (Master, OrgAdmin, User)
 * Adapta-se ao contexto do usuário logado
 */

import React from 'react';
import { useAI, useAIAccess } from '../../src/contexts/AIContext';

interface AIFloatingButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offset?: number;
}

export const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({ 
  position = 'bottom-right',
  offset = 32 
}) => {
  const { openModal, conversationHistory } = useAI();
  const { hasAccess, accessLevel } = useAIAccess();

  if (!hasAccess) {
    return null;
  }

  // Definir ícones e cores baseado no nível de acesso
  const getButtonStyle = () => {
    switch (accessLevel) {
      case 'master':
        return {
          gradient: 'from-purple-600 to-indigo-700',
          hoverShadow: 'hover:shadow-purple-500/50',
          icon: '👑',
          label: 'Assistente Master IA'
        };
      case 'org_admin':
        return {
          gradient: 'from-blue-600 to-cyan-700',
          hoverShadow: 'hover:shadow-blue-500/50',
          icon: '👔',
          label: 'Assistente Organizacional IA'
        };
      case 'user':
        return {
          gradient: 'from-green-600 to-emerald-700',
          hoverShadow: 'hover:shadow-green-500/50',
          icon: '👤',
          label: 'Assistente Pessoal IA'
        };
      default:
        return {
          gradient: 'from-gray-600 to-gray-700',
          hoverShadow: 'hover:shadow-gray-500/50',
          icon: '🤖',
          label: 'Assistente IA'
        };
    }
  };

  const style = getButtonStyle();

  // Definir posicionamento
  const positionClasses = {
    'bottom-right': `bottom-${offset / 4} right-${offset / 4}`,
    'bottom-left': `bottom-${offset / 4} left-${offset / 4}`,
    'top-right': `top-${offset / 4} right-${offset / 4}`,
    'top-left': `top-${offset / 4} left-${offset / 4}`
  };

  // Badge de mensagens não lidas (futuro)
  const hasUnreadMessages = false;
  const unreadCount = 0;

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={openModal}
        className={`fixed ${positionClasses[position]} w-16 h-16 bg-gradient-to-r ${style.gradient} text-white rounded-full shadow-2xl ${style.hoverShadow} hover:scale-110 transition-all duration-300 flex items-center justify-center group z-50`}
        title={style.label}
        aria-label={style.label}
      >
        {/* Ícone */}
        <span className="text-3xl relative">
          {style.icon}
          
          {/* Badge de notificação */}
          {hasUnreadMessages && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>

        {/* Tooltip */}
        <div className="absolute -top-14 right-0 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          {style.label}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>

        {/* Pulso de indicador (quando há histórico) */}
        {conversationHistory.length > 0 && (
          <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></span>
        )}
      </button>

      {/* Indicador de status da IA (canto oposto) */}
      <div className={`fixed ${position === 'bottom-right' ? 'bottom-2 left-4' : 'bottom-2 right-4'} text-xs text-gray-500 font-medium flex items-center space-x-2 z-40 opacity-75 hover:opacity-100 transition-opacity`}>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>IA Disponível</span>
      </div>
    </>
  );
};

export default AIFloatingButton;
