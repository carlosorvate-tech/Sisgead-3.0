/**
 * AI Context - Contexto Global para Assistente de IA
 * 
 * Gerencia estado do modal de IA, histórico de conversas e configurações
 * em toda a aplicação, disponível para todos os níveis de usuário.
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { AiProvider } from '../../types';
import type { User } from '../../types/premium/user';
import { UserRole } from '../../types/premium/user';
import type { Organization } from '../../types/premium/organization';
import type { Institution } from '../../types/premium/institution';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  userId?: string;
}

interface ConversationHistory {
  userId: string;
  messages: Message[];
  lastUpdated: Date;
}

interface AIContextData {
  currentUser: User | null;
  currentInstitution: Institution | null;
  currentOrganizations: Organization[];
  aiProvider: AiProvider;
  aiModel: string;
  isModalOpen: boolean;
  conversationHistory: Message[];
  allConversations: ConversationHistory[];
}

interface AIContextActions {
  openModal: () => void;
  closeModal: () => void;
  setAIProvider: (provider: AiProvider) => void;
  setAIModel: (model: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentInstitution: (institution: Institution | null) => void;
  setCurrentOrganizations: (orgs: Organization[]) => void;
  loadConversationHistory: (userId: string) => void;
}

type AIContextType = AIContextData & AIContextActions;

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  // Estado dos dados
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);
  const [currentOrganizations, setCurrentOrganizations] = useState<Organization[]>([]);
  
  // Configurações da IA
  const [aiProvider, setAIProvider] = useState<AiProvider>('gemini');
  const [aiModel, setAIModel] = useState('gemini-1.5-flash');
  
  // Estado do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Histórico de conversas
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [allConversations, setAllConversations] = useState<ConversationHistory[]>([]);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedProvider = localStorage.getItem('ai-provider') as AiProvider;
    const savedModel = localStorage.getItem('ai-model');
    
    if (savedProvider) setAIProvider(savedProvider);
    if (savedModel) setAIModel(savedModel);

    // Carregar histórico de todas as conversas
    const savedConversations = localStorage.getItem('ai-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setAllConversations(parsed.map((conv: any) => ({
          ...conv,
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          lastUpdated: new Date(conv.lastUpdated)
        })));
      } catch (error) {
        console.error('Erro ao carregar histórico de conversas:', error);
      }
    }
  }, []);

  // Salvar configurações quando mudarem
  useEffect(() => {
    localStorage.setItem('ai-provider', aiProvider);
  }, [aiProvider]);

  useEffect(() => {
    localStorage.setItem('ai-model', aiModel);
  }, [aiModel]);

  // Salvar histórico quando mudar
  useEffect(() => {
    if (allConversations.length > 0) {
      localStorage.setItem('ai-conversations', JSON.stringify(allConversations));
    }
  }, [allConversations]);

  // Carregar conversa do usuário atual
  useEffect(() => {
    if (currentUser) {
      loadConversationHistory(currentUser.id);
    }
  }, [currentUser]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: currentUser?.id
    };

    setConversationHistory(prev => [...prev, newMessage]);

    // Atualizar histórico global
    if (currentUser) {
      setAllConversations(prev => {
        const userConvIndex = prev.findIndex(c => c.userId === currentUser.id);
        const updatedMessages = [...conversationHistory, newMessage];
        
        if (userConvIndex >= 0) {
          const updated = [...prev];
          updated[userConvIndex] = {
            userId: currentUser.id,
            messages: updatedMessages,
            lastUpdated: new Date()
          };
          return updated;
        } else {
          return [...prev, {
            userId: currentUser.id,
            messages: updatedMessages,
            lastUpdated: new Date()
          }];
        }
      });
    }
  };

  const clearHistory = () => {
    setConversationHistory([]);
    
    if (currentUser) {
      setAllConversations(prev => 
        prev.filter(c => c.userId !== currentUser.id)
      );
    }
  };

  const loadConversationHistory = (userId: string) => {
    const userConversation = allConversations.find(c => c.userId === userId);
    if (userConversation) {
      setConversationHistory(userConversation.messages);
    } else {
      setConversationHistory([]);
    }
  };

  const contextValue: AIContextType = {
    // Dados
    currentUser,
    currentInstitution,
    currentOrganizations,
    aiProvider,
    aiModel,
    isModalOpen,
    conversationHistory,
    allConversations,
    
    // Ações
    openModal,
    closeModal,
    setAIProvider,
    setAIModel,
    addMessage,
    clearHistory,
    setCurrentUser,
    setCurrentInstitution,
    setCurrentOrganizations,
    loadConversationHistory
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};

/**
 * Hook para usar o contexto da IA
 * @throws Error se usado fora do AIProvider
 */
export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  
  if (!context) {
    throw new Error('useAI deve ser usado dentro de um AIProvider');
  }
  
  return context;
};

/**
 * Hook para verificar se o usuário tem acesso à IA
 * Todos os usuários autenticados têm acesso, mas com contextos diferentes
 */
export const useAIAccess = () => {
  const { currentUser, currentInstitution, currentOrganizations } = useAI();
  
  const hasAccess = !!currentUser;
  const accessLevel = currentUser?.role || 'guest';
  
  // Definir quais dados o usuário pode acessar na IA
  const dataScope = {
    canAccessInstitution: currentUser?.role === UserRole.MASTER,
    canAccessAllOrganizations: currentUser?.role === UserRole.MASTER,
    canAccessOwnOrganizations: currentUser?.role === UserRole.ORG_ADMIN || currentUser?.role === UserRole.USER,
    canAccessOwnProfile: !!currentUser,
    availableOrganizations: currentUser?.role === UserRole.MASTER 
      ? currentOrganizations 
      : currentOrganizations.filter(org => currentUser?.organizationIds.includes(org.id))
  };
  
  return {
    hasAccess,
    accessLevel,
    dataScope
  };
};
