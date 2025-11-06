/**
 * AIAssistantModal - Assistente de IA para Gestão Institucional
 * 
 * Auxilia usuário Master em:
 * - Análise de banco de talentos
 * - Insights de gestão de pessoas
 * - Sugestões de alocação
 * - Identificação de gaps
 */

import React, { useState, useRef, useEffect } from 'react';
import type { InstitutionConsolidation } from '../../../types/premium/consolidation';
import type { Organization } from '../../../types/premium/organization';
import type { User } from '../../../types/premium/user';

interface AIAssistantModalProps {
  onClose: () => void;
  consolidation?: InstitutionConsolidation;
  organizations: Organization[];
  users: User[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  onClose,
  consolidation,
  organizations,
  users
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá! Sou seu assistente de IA para Gestão de Pessoas e Banco de Talentos. 

Posso te ajudar com:
📊 **Análise de Dados**: Insights sobre seu efetivo institucional
🎯 **Gestão de Talentos**: Identificação de high performers e gaps
📈 **Recomendações**: Sugestões de alocação e desenvolvimento
🔍 **Diagnósticos**: Análise de desempenho por organização

Como posso auxiliar você hoje?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Análises pré-programadas
  const getContextData = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const masterUsers = users.filter(u => u.role === 'master').length;
    const orgAdmins = users.filter(u => u.role === 'org_admin').length;
    const totalOrgs = organizations.length;
    const activeOrgs = organizations.filter(o => o.status === 'active').length;

    return {
      totalUsers,
      activeUsers,
      masterUsers,
      orgAdmins,
      totalOrgs,
      activeOrgs,
      consolidation
    };
  };

  // Sugestões rápidas
  const quickSuggestions = [
    '📊 Análise geral do banco de talentos',
    '🎯 Identificar high performers',
    '📈 Sugestões de desenvolvimento',
    '⚠️ Identificar riscos e gaps',
    '🔄 Otimização de alocação'
  ];

  const analyzeWithAI = async (userQuestion: string): Promise<string> => {
    const context = getContextData();
    
    // Prompt estruturado para análise de gestão de pessoas
    const systemPrompt = `Você é um especialista em Gestão de Pessoas e Análise de Talentos.

CONTEXTO INSTITUCIONAL:
- Total de usuários: ${context.totalUsers}
- Usuários ativos: ${context.activeUsers}
- Usuários Master: ${context.masterUsers}
- Administradores de Org: ${context.orgAdmins}
- Total de organizações: ${context.totalOrgs}
- Organizações ativas: ${context.activeOrgs}

${consolidation ? `
DADOS CONSOLIDADOS:
- Total de documentos: ${consolidation.totals.documents}
- Total de avaliações: ${consolidation.totals.assessments}
- Média geral: ${consolidation.totals.averageScore.toFixed(2)}
- Organizações no ranking: ${consolidation.ranking.topPerformingOrgs.length}
` : ''}

Sua missão é fornecer insights práticos e acionáveis sobre:
1. Gestão de pessoas e banco de talentos
2. Identificação de high performers
3. Detecção de gaps de competência
4. Sugestões de alocação estratégica
5. Planos de desenvolvimento

Seja objetivo, use emojis para destacar pontos importantes, e forneça recomendações práticas.`;

    try {
      // Tentar usar Gemini API
      const apiKey = localStorage.getItem('gemini-api-key');
      
      if (!apiKey) {
        return `⚠️ **API Key não configurada**

Para usar a assistência de IA, configure sua chave da API Gemini:

1. Acesse https://makersuite.google.com/app/apikey
2. Gere uma API Key gratuita
3. Clique em "⚙️ Configurar API" no canto superior direito
4. Cole sua chave e salve

Enquanto isso, posso fornecer análises baseadas em regras pré-programadas.`;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\nPERGUNTA DO USUÁRIO:\n${userQuestion}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro na API Gemini');
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      return aiResponse;

    } catch (error) {
      console.error('Erro ao chamar IA:', error);
      
      // Fallback para análise baseada em regras
      return getPreProgrammedAnalysis(userQuestion, context);
    }
  };

  const getPreProgrammedAnalysis = (question: string, context: any): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('análise') || lowerQuestion.includes('geral')) {
      return `📊 **Análise Geral do Banco de Talentos**

**Visão Institucional:**
✅ ${context.activeUsers} usuários ativos de ${context.totalUsers} cadastrados
✅ ${context.activeOrgs} organizações ativas de ${context.totalOrgs} no sistema
✅ ${context.orgAdmins} administradores gerenciando as operações

**Indicadores-Chave:**
${context.consolidation ? `
📈 Total de avaliações: ${context.consolidation.totals.assessments}
📊 Média institucional: ${context.consolidation.totals.averageScore.toFixed(2)}
📄 Documentos gerados: ${context.consolidation.totals.documents}
` : '📋 Dados de consolidação não disponíveis no momento'}

**Recomendações:**
1. ${context.activeUsers < context.totalUsers * 0.8 ? '⚠️ Taxa de ativação baixa - considere reengajamento' : '✅ Boa taxa de ativação'}
2. ${context.orgAdmins < context.totalOrgs ? '⚠️ Algumas organizações podem estar sem administrador' : '✅ Cobertura administrativa adequada'}
3. Continue monitorando as métricas de desempenho regularmente`;
    }

    if (lowerQuestion.includes('high performer') || lowerQuestion.includes('talentos')) {
      return `🎯 **Identificação de High Performers**

**Critérios de Análise:**
Para identificar talentos de destaque, considere:

1. **Desempenho Quantitativo**
   - Média de avaliações acima de 8.5
   - Consistência ao longo do tempo
   - Volume de entregas

2. **Impacto Organizacional**
   - Contribuição para resultados da equipe
   - Inovação e melhoria contínua
   - Capacidade de liderança

3. **Potencial de Crescimento**
   - Versatilidade de competências
   - Capacidade de aprendizado
   - Adaptabilidade

${consolidation?.ranking?.topPerformingOrgs?.length > 0 ? `
**Top Organizações por Desempenho:**
${consolidation.ranking.topPerformingOrgs.slice(0, 3).map((org, i) => 
  `${i + 1}. ${org.organizationName} - Média: ${org.averageScore.toFixed(2)}`
).join('\n')}

💡 Verifique os membros dessas organizações para identificar potenciais talentos.
` : ''}

**Próximos Passos:**
1. Revisar avaliações individuais
2. Identificar padrões de excelência
3. Criar plano de retenção e desenvolvimento`;
    }

    if (lowerQuestion.includes('gap') || lowerQuestion.includes('risco')) {
      return `⚠️ **Análise de Gaps e Riscos**

**Áreas de Atenção:**

1. **Gaps de Competência**
   ${context.consolidation?.totals.averageScore < 7.0 ? '🔴 Média institucional abaixo do esperado' : '🟢 Média institucional dentro do esperado'}
   ${context.totalOrgs > context.orgAdmins ? '⚠️ Organizações sem administrador dedicado' : '✅ Cobertura administrativa adequada'}

2. **Riscos de Gestão**
   - ${context.masterUsers < 2 ? '⚠️ Ponto único de falha - apenas 1 usuário Master' : '✅ Múltiplos usuários Master para redundância'}
   - ${context.activeUsers / context.totalUsers < 0.7 ? '⚠️ Taxa de engajamento baixa' : '✅ Boa taxa de engajamento'}

3. **Distribuição de Talentos**
   ${context.totalOrgs > 0 ? `
   - Média de ${Math.round(context.totalUsers / context.totalOrgs)} usuários por organização
   - ${context.totalUsers < context.totalOrgs * 3 ? '⚠️ Possível subdimensionamento' : '✅ Distribuição adequada'}
   ` : ''}

**Recomendações Imediatas:**
1. Revisar organizações com baixo desempenho
2. Implementar plano de capacitação
3. Redistribuir talentos conforme necessário
4. Estabelecer metas claras de melhoria`;
    }

    if (lowerQuestion.includes('alocação') || lowerQuestion.includes('otimização')) {
      return `🔄 **Otimização de Alocação de Talentos**

**Estratégia de Alocação:**

1. **Análise de Capacidade**
   - Total de ${context.totalUsers} profissionais disponíveis
   - Distribuídos em ${context.totalOrgs} organizações
   - Rácio atual: ${(context.totalUsers / Math.max(context.totalOrgs, 1)).toFixed(1)} pessoas/org

2. **Princípios de Alocação Eficiente**
   ✅ Alinhar competências com necessidades
   ✅ Balancear carga de trabalho
   ✅ Considerar curva de aprendizado
   ✅ Manter mix de senioridade

3. **Oportunidades de Redistribuição**
   ${consolidation?.ranking?.topPerformingOrgs?.length > 0 ? `
   - Organizações de alto desempenho podem mentorear outras
   - Considere rotação de talentos para compartilhar conhecimento
   - Balance equipes com diferentes níveis de maturidade
   ` : ''}

4. **Plano de Ação**
   📋 Mapear competências críticas
   📊 Identificar sobrecargas e ociosidade
   🎯 Estabelecer critérios de movimentação
   📈 Monitorar impacto das mudanças

**Métricas de Sucesso:**
- Aumento da média geral de desempenho
- Redução de disparidades entre organizações
- Melhoria no engajamento
- Retenção de talentos-chave`;
    }

    if (lowerQuestion.includes('desenvolvimento') || lowerQuestion.includes('capacitação')) {
      return `📈 **Plano de Desenvolvimento de Talentos**

**Estratégia de Capacitação:**

1. **Diagnóstico de Necessidades**
   ${context.consolidation ? `
   - Média institucional atual: ${context.consolidation.totals.averageScore.toFixed(2)}
   - Meta sugerida: ${(context.consolidation.totals.averageScore + 1).toFixed(2)}
   - Gap a ser trabalhado: ${(1 - (context.consolidation.totals.averageScore % 1)).toFixed(2)} pontos
   ` : ''}

2. **Trilhas de Desenvolvimento**
   
   **Nível 1 - Fundamentos** (Média < 6.0)
   - Competências básicas
   - Processos e procedimentos
   - Ferramentas essenciais
   
   **Nível 2 - Intermediário** (Média 6.0-7.5)
   - Especialização técnica
   - Gestão de projetos
   - Soft skills
   
   **Nível 3 - Avançado** (Média 7.5-9.0)
   - Liderança
   - Inovação
   - Visão estratégica
   
   **Nível 4 - Expert** (Média > 9.0)
   - Mentoria
   - Transformação
   - Excelência técnica

3. **Ações Recomendadas**
   📚 Criar programa de capacitação estruturado
   👥 Implementar programa de mentoria
   🎯 Definir PDIs (Planos de Desenvolvimento Individual)
   📊 Estabelecer KPIs de evolução

4. **Monitoramento**
   - Avaliações trimestrais
   - Feedback 360°
   - Acompanhamento de metas
   - Revisão de planos`;
    }

    // Resposta genérica
    return `💡 **Assistência em Gestão de Pessoas**

Desculpe, não entendi completamente sua pergunta. Posso ajudar com:

📊 **"Faça uma análise geral"** - Visão completa do banco de talentos
🎯 **"Identifique high performers"** - Talentos de destaque
⚠️ **"Identifique gaps e riscos"** - Pontos de atenção
🔄 **"Sugestões de alocação"** - Otimização de equipes
📈 **"Plano de desenvolvimento"** - Capacitação e crescimento

Você também pode fazer perguntas específicas sobre sua instituição!`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await analyzeWithAI(inputMessage);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Assistente de IA - Gestão de Pessoas</h2>
              <p className="text-sm text-purple-100">Inteligência aplicada ao banco de talentos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce w-2 h-2 bg-purple-600 rounded-full"></div>
                  <div className="animate-bounce w-2 h-2 bg-purple-600 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                  <div className="animate-bounce w-2 h-2 bg-purple-600 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickSuggestion(suggestion)}
                className="px-3 py-1 bg-white hover:bg-purple-50 border border-gray-300 rounded-full text-xs text-gray-700 hover:text-purple-700 hover:border-purple-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="flex items-end space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Faça uma pergunta sobre gestão de pessoas, banco de talentos, alocação..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '...' : '📤 Enviar'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Pressione Enter para enviar, Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
};
