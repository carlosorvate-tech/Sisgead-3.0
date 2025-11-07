/**
 * Unified AI Modal - Modal Inteligente Multi-Nível
 * 
 * Adapta automaticamente:
 * - Interface baseada no papel do usuário (Master/OrgAdmin/User)
 * - Contexto de dados disponível
 * - Prompts e sugestões contextuais
 * 
 * Integra geminiService.ts (v2.0) com arquitetura Premium (v3.0)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAI, useAIAccess } from '../../src/contexts/AIContext';
import { UserRole } from '../../types/premium/user';
import { wikiService } from '../../services/wikiService';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  prompt: string;
  requiresRole?: UserRole[];
}

export const UnifiedAIModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    conversationHistory,
    addMessage,
    clearHistory,
    currentUser,
    currentInstitution,
    currentOrganizations,
    aiProvider,
    aiModel
  } = useAI();

  const { accessLevel, dataScope } = useAIAccess();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  // Mensagem de boas-vindas contextual
  useEffect(() => {
    if (isModalOpen && conversationHistory.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      addMessage({
        role: 'assistant',
        content: welcomeMessage
      });
    }
  }, [isModalOpen]);

  const getWelcomeMessage = (): string => {
    switch (accessLevel) {
      case 'master':
        return `👑 **Assistente Master IA - Visão Institucional**

Olá! Tenho acesso completo aos dados de **${currentInstitution?.name || 'sua instituição'}**.

**Posso te ajudar com:**
📊 Análise consolidada de todas as organizações (${currentOrganizations.length} organizações)
🎯 Benchmarking entre departamentos
📈 Insights estratégicos de gestão de pessoas
🔍 Identificação de talentos cross-organizacional
💡 Recomendações para otimização institucional

Como posso auxiliar você hoje?`;

      case 'org_admin':
        const myOrgs = dataScope.availableOrganizations;
        return `👔 **Assistente Organizacional IA**

Olá! Posso te ajudar com dados das organizações que você administra.

**Suas organizações:**
${myOrgs.map(org => `• ${org.name}`).join('\n')}

**Posso te ajudar com:**
📊 Análise de efetivo das suas organizações
🎯 Gestão de equipes e talentos
📈 Relatórios de desempenho
🔍 Insights sobre perfis DISC
💡 Sugestões de desenvolvimento

Como posso auxiliar você hoje?`;

      case 'user':
        return `👤 **Assistente Pessoal IA**

Olá! Estou aqui para te ajudar com seu desenvolvimento profissional.

**Posso te ajudar com:**
📊 Análise do seu perfil DISC
🎯 Sugestões de desenvolvimento pessoal
📈 Entender seus pontos fortes
🔍 Compatibilidade com equipes
💡 Orientação de carreira

Como posso te ajudar hoje?`;

      default:
        return `🤖 **Assistente IA - SISGEAD**

Olá! Como posso te ajudar?`;
    }
  };

  // Ações rápidas contextuais
  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];

    if (accessLevel === 'master') {
      actions.push(
        {
          id: 'institutional-overview',
          icon: '🏛️',
          label: 'Visão Institucional',
          prompt: `Faça uma análise consolidada da instituição ${currentInstitution?.name}, incluindo:
- Total de organizações e usuários
- Distribuição de perfis por organização
- Principais insights e recomendações estratégicas`
        },
        {
          id: 'org-comparison',
          icon: '📊',
          label: 'Comparar Organizações',
          prompt: 'Compare o desempenho e composição de perfis entre as diferentes organizações. Identifique melhores práticas e oportunidades de melhoria.'
        },
        {
          id: 'talent-mapping',
          icon: '🎯',
          label: 'Mapeamento de Talentos',
          prompt: 'Identifique os principais talentos da instituição, seus perfis DISC e como eles estão distribuídos pelas organizações.'
        },
        {
          id: 'strategic-insights',
          icon: '💡',
          label: 'Insights Estratégicos',
          prompt: 'Gere insights estratégicos sobre gestão de pessoas na instituição, incluindo gaps de competências e oportunidades de desenvolvimento.'
        }
      );
    }

    // Ações de suporte/documentação (disponível para todos)
    actions.push(
      {
        id: 'help-passwords',
        icon: '🔑',
        label: 'Ajuda: Senhas',
        prompt: 'Como funciona o sistema de senhas? Como redefinir senha de um usuário?'
      },
      {
        id: 'help-users',
        icon: '👥',
        label: 'Ajuda: Usuários',
        prompt: 'Como criar, editar e excluir usuários? Quais são as diferenças entre Master, OrgAdmin e Member?'
      },
      {
        id: 'help-orgs',
        icon: '🏢',
        label: 'Ajuda: Organizações',
        prompt: 'Como gerenciar organizações? Como configurar features e limites de usuários?'
      },
      {
        id: 'troubleshooting',
        icon: '🔧',
        label: 'Solução de Problemas',
        prompt: 'Estou tendo um problema no sistema. Me ajude a diagnosticar e resolver.'
      }
    );

    if (accessLevel === 'org_admin') {
      actions.push(
        {
          id: 'org-analysis',
          icon: '🏢',
          label: 'Análise Organizacional',
          prompt: 'Faça uma análise detalhada das minhas organizações, incluindo composição de equipes, perfis DISC dominantes e recomendações.'
        },
        {
          id: 'team-formation',
          icon: '👥',
          label: 'Formação de Equipes',
          prompt: 'Sugira composições ideais de equipes baseadas nos perfis DISC disponíveis nas minhas organizações.'
        },
        {
          id: 'performance-report',
          icon: '📈',
          label: 'Relatório de Desempenho',
          prompt: 'Gere um relatório de desempenho das equipes, identificando pontos fortes e áreas de melhoria.'
        },
        {
          id: 'development-plan',
          icon: '🎓',
          label: 'Plano de Desenvolvimento',
          prompt: 'Crie um plano de desenvolvimento de pessoas para as minhas organizações, considerando os perfis atuais e gaps identificados.'
        }
      );
    }

    if (accessLevel === 'user') {
      actions.push(
        {
          id: 'my-profile',
          icon: '👤',
          label: 'Meu Perfil DISC',
          prompt: 'Analise meu perfil DISC e explique meus pontos fortes, desafios e como posso me desenvolver.'
        },
        {
          id: 'career-guidance',
          icon: '🎯',
          label: 'Orientação de Carreira',
          prompt: 'Baseado no meu perfil DISC, que papéis e funções são mais adequados para mim? Como posso crescer profissionalmente?'
        },
        {
          id: 'team-fit',
          icon: '🤝',
          label: 'Compatibilidade',
          prompt: 'Como meu perfil DISC se encaixa em equipes? Quais perfis complementam o meu?'
        },
        {
          id: 'personal-development',
          icon: '📚',
          label: 'Desenvolvimento Pessoal',
          prompt: 'Quais habilidades devo desenvolver considerando meu perfil DISC? Dê sugestões práticas de melhoria.'
        }
      );
    }

    return actions;
  };

  const quickActions = getQuickActions();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Adicionar mensagem do usuário
    addMessage({
      role: 'user',
      content: userMessage
    });

    setIsLoading(true);

    try {
      // Preparar contexto baseado no nível de acesso
      const context = prepareContext();
      
      // Simular resposta da IA (integração real com geminiService virá no próximo passo)
      const response = await simulateAIResponse(userMessage, context);
      
      addMessage({
        role: 'assistant',
        content: response
      });
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: `❌ Desculpe, ocorreu um erro ao processar sua mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const prepareContext = () => {
    const context: any = {
      user: {
        id: currentUser?.id,
        name: currentUser?.profile.name,
        role: currentUser?.role,
        email: currentUser?.profile.email
      },
      accessLevel,
      dataScope
    };

    if (dataScope.canAccessInstitution) {
      context.institution = {
        id: currentInstitution?.id,
        name: currentInstitution?.name,
        organizationsCount: currentOrganizations.length
      };
    }

    if (dataScope.canAccessAllOrganizations || dataScope.canAccessOwnOrganizations) {
      context.organizations = dataScope.availableOrganizations.map(org => ({
        id: org.id,
        name: org.name,
        description: org.description,
        status: org.status
      }));
    }

    return context;
  };

  const simulateAIResponse = async (question: string, context: any): Promise<string> => {
    // Buscar documentação relevante
    const wikiContext = await wikiService.getContextForAI(question);
    
    // Simula tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Verificar se é pergunta sobre ajuda/documentação
    const isHelpQuestion = /como|ajuda|suporte|problema|erro|não funciona|tutorial|guia/i.test(question);
    
    if (isHelpQuestion && wikiContext && !wikiContext.includes('Nenhuma documentação')) {
      return `📚 **Encontrei isso na documentação:**

${wikiContext}

---

💡 **Minha sugestão**: ${generateSuggestion(question)}

Precisa de mais detalhes sobre algum ponto específico?`;
    }

    // Resposta simulada contextual
    if (accessLevel === 'master') {
      return `📊 **Análise Institucional**

Baseado nos dados de **${context.institution?.name}**, aqui está minha análise:

**Organizações:** ${context.organizations?.length || 0} unidades organizacionais
**Usuários:** Análise em processamento...

${wikiContext && !wikiContext.includes('Nenhuma') ? `\n📚 **Documentação Relacionada:**\n${wikiContext.substring(0, 300)}...\n` : ''}

*Esta é uma resposta simulada. A integração completa com Gemini será ativada no próximo deploy.*

**Próximos passos recomendados:**
1. Configurar chave API do Gemini
2. Executar análise completa de perfis DISC
3. Gerar relatório consolidado

Como posso detalhar melhor essa análise?`;
    }

    if (accessLevel === 'org_admin') {
      return `🏢 **Análise Organizacional**

**Suas organizações:**
${context.organizations?.map((org: any) => `• ${org.name} (${org.status})`).join('\n') || 'Nenhuma organização'}

${wikiContext && !wikiContext.includes('Nenhuma') ? `\n📚 **Documentação Relacionada:**\n${wikiContext.substring(0, 300)}...\n` : ''}

*Esta é uma resposta simulada. A integração completa com Gemini será ativada no próximo deploy.*

Gostaria de analisar alguma organização específica?`;
    }

    return `👤 **Resposta Pessoal**

Olá ${context.user.name}!

${wikiContext && !wikiContext.includes('Nenhuma') ? `\n📚 **Documentação Relacionada:**\n${wikiContext.substring(0, 300)}...\n` : ''}

*Esta é uma resposta simulada. A integração completa com Gemini será ativada no próximo deploy.*

Como posso te ajudar melhor?`;
  };

  const generateSuggestion = (question: string): string => {
    if (/senha|reset|redefinir/i.test(question)) {
      return 'Acesse "Editar Usuário" e clique no botão "Redefinir Senha" (amarelo). Isso volta a senha para Sisgead@2024 e força o usuário a criar uma nova.';
    }
    if (/excluir|deletar|remover/i.test(question)) {
      return 'Use o botão "Editar" na lista, depois clique em "Excluir" no rodapé do modal. Confirme a ação no modal de confirmação. ATENÇÃO: Ação irreversível!';
    }
    if (/criar|novo|adicionar/i.test(question)) {
      return 'Use o botão "+ Nova Organização" ou "+ Novo Usuário" no topo da aba correspondente. Preencha os dados obrigatórios e salve.';
    }
    if (/organização|org/i.test(question)) {
      return 'Organizações são unidades dentro da instituição. Cada uma pode ter configurações próprias de usuários, features e aprovações.';
    }
    if (/usuário|user|membro/i.test(question)) {
      return 'Usuários podem ter 3 roles: Master (institucional), OrgAdmin (gerencia org), Member (usuário final). Cada um tem permissões diferentes.';
    }
    return 'Consulte a documentação completa no Wiki ou faça uma pergunta mais específica.';
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {accessLevel === 'master' ? '👑' : accessLevel === 'org_admin' ? '👔' : '👤'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {accessLevel === 'master' ? 'Assistente Master IA' : 
                 accessLevel === 'org_admin' ? 'Assistente Organizacional IA' : 
                 'Assistente Pessoal IA'}
              </h2>
              <p className="text-purple-100 text-sm">
                Powered by {aiProvider === 'gemini' ? 'Google Gemini' : aiProvider.toUpperCase()} • {aiModel}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearHistory}
              className="px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg text-sm hover:bg-opacity-30 transition-colors"
              title="Limpar conversa"
            >
              🗑️ Limpar
            </button>
            <button
              onClick={closeModal}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {conversationHistory.length <= 1 && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3">Ações Rápidas:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
                >
                  <div className="text-2xl mb-1">{action.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{action.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {conversationHistory.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce">🤖</div>
                  <div className="text-sm text-gray-600">Processando...</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-end space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta... (Enter para enviar, Shift+Enter para nova linha)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <span>Enviar</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAIModal;
