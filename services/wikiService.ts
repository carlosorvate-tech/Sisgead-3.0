/**
 * WikiService - Sistema de Base de Conhecimento para IA
 * 
 * Responsável por:
 * - Carregar documentação do Wiki
 * - Indexar conteúdo para busca semântica
 * - Fornecer contexto para IA Assistant
 * - Buscar respostas em documentação
 */

export interface WikiDocument {
  id: string;
  title: string;
  category: string;
  tags: string[];
  version: string;
  lastUpdate: string;
  author: string;
  aiContext: boolean;
  difficulty: 'básico' | 'intermediário' | 'avançado';
  content: string;
  path: string;
  wordCount: number;
}

export interface WikiSearchResult {
  document: WikiDocument;
  relevance: number;
  matchedSections: string[];
}

class WikiService {
  private documents: Map<string, WikiDocument> = new Map();
  private index: Map<string, Set<string>> = new Map(); // keyword -> document IDs
  private initialized = false;

  /**
   * Base de documentação estática (será carregada dinamicamente em produção)
   */
  private readonly WIKI_DOCS = {
    'guia-administrador': {
      id: 'guia-administrador',
      title: 'Guia do Administrador SISGEAD 3.0',
      category: 'guias-admin',
      tags: ['administrador', 'gestão', 'master', 'organizações'],
      version: '3.0.0',
      lastUpdate: '2025-11-06',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'intermediário' as const,
      path: '/wiki/02-guias-administrador/guia-administrador.md',
      content: `
# Guia do Administrador SISGEAD 3.0

## Níveis de Acesso

### Master (Institucional)
Permissões completas: gerenciar todas organizações, todos usuários, redefinir senhas, acesso a dados consolidados, IA institucional.

### OrgAdmin (Organizacional)
Permissões limitadas: gerenciar apenas sua organização, criar/editar usuários da org, IA organizacional.

### Member (Membro)
Permissões básicas: fazer avaliações, visualizar próprio perfil, IA pessoal.

## Gestão de Organizações

### Criar Nova Organização
Dashboard Master → Organizações → "+ Nova Organização"

Campos: Nome, Status (Ativa/Inativa/Suspensa), Máx Usuários (padrão: 50), Features (Avaliações, Relatórios, Analytics, Team Builder, IA), Aprovação de Avaliações.

### Editar Organização
Lista → Editar → Alterar dados, configurações, ou EXCLUIR (irreversível).

## Gestão de Usuários

### Criar Novo Usuário
Dashboard → Usuários → "+ Novo Usuário"

Dados: Nome, Email (login único), Telefone (opcional), Departamento, Role (Member/OrgAdmin/Master), Organizações, Status.

Senha inicial: Sisgead@2024 (usuário DEVE trocar no primeiro login).

### Editar Usuário

1. Alterar Dados: Nome, email, telefone, departamento, organizações, role.

2. Redefinir Senha:
   - Quando: Usuário esqueceu senha, conta bloqueada, reset de segurança
   - Como: Botão "Redefinir Senha" → Senha volta para Sisgead@2024
   - Efeito: Força criação de nova senha, remove bloqueio

3. Excluir Usuário:
   - Irreversível: Remove TODOS os dados
   - Uso: Funcionário desligado, conta duplicada

## Sistema de Senhas

Senha Padrão: Sisgead@2024
Usado em: Novos usuários, reset de senha

Política:
- Mínimo 8 caracteres
- 1 maiúscula, 1 minúscula, 1 número, 1 especial
- Bloqueio após 5 tentativas falhadas
- Admin desbloqueia via "Redefinir Senha"

### Fluxos Comuns

Novo Usuário:
1. Admin cria → Senha padrão
2. Usuário recebe email
3. Primeiro login → Pede nova senha
4. Cria senha forte → Acesso liberado

Esqueceu Senha:
1. Usuário falha login
2. Contacta admin
3. Admin "Redefinir Senha"
4. Volta para padrão
5. Usuário cria nova

Conta Bloqueada:
1. Errou 5x → Bloqueio
2. Admin "Redefinir Senha"
3. Bloqueio removido
4. Senha padrão
5. Usuário cria nova

## IA Assistant

Botão Flutuante: Canto inferior direito
- Master: Roxo com 👑
- OrgAdmin: Azul com 👔
- Member: Verde com 👤

Quick Actions (Master):
- Visão Institucional
- Comparar Organizações
- Mapeamento de Talentos
- Insights Estratégicos

Exemplos de Perguntas:
- "Quantos usuários ativos?"
- "Quais organizações inativas?"
- "Como redefinir senha?"
- "Distribuição de perfis DISC?"

## Troubleshooting

Usuário não loga:
→ Editar Usuário → Redefinir Senha

Organização não aparece:
→ Editar Usuário → Organizações → Marcar → Salvar

IA não aparece:
→ Verificar feature "ai-assistant" na org
      `,
      wordCount: 450
    },

    'sistema-senhas': {
      id: 'sistema-senhas',
      title: 'Sistema de Gerenciamento de Senhas',
      category: 'guias-admin',
      tags: ['senha', 'segurança', 'reset', 'bloqueio'],
      version: '3.0.0',
      lastUpdate: '2025-11-06',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'básico' as const,
      path: '/wiki/02-guias-administrador/sistema-senhas.md',
      content: `
# Sistema de Senhas SISGEAD 3.0

## Senha Padrão

Senha: Sisgead@2024

Quando é usada:
- Criação de novos usuários
- Reset de senha por administrador
- Recuperação de conta bloqueada

Segurança:
- Usuário NÃO pode manter senha padrão
- Sistema FORÇA troca no primeiro login
- Campo requirePasswordChange: true

## Política de Senhas

Requisitos obrigatórios:
✓ Mínimo 8 caracteres
✓ Pelo menos 1 letra maiúscula
✓ Pelo menos 1 letra minúscula
✓ Pelo menos 1 número
✓ Pelo menos 1 caractere especial (@, #, $, %, etc.)

Bloqueio automático:
- Após 5 tentativas falhadas de login
- Admin pode desbloquear via "Redefinir Senha"

## Redefinir Senha (Admin)

Acesso: Editar Usuário → Botão "Redefinir Senha" (amarelo)

O que acontece:
1. Senha volta para Sisgead@2024
2. requirePasswordChange = true (força nova senha)
3. failedLoginAttempts = 0 (limpa tentativas)
4. isLocked = false (desbloqueia conta)

Quando usar:
- Usuário esqueceu a senha
- Conta bloqueada por tentativas falhadas
- Reset de segurança (suspeita de comprometimento)

## Fluxos Completos

### Novo Usuário
1. Admin cria usuário
2. Sistema define senha = Sisgead@2024
3. requirePasswordChange = true
4. Usuário recebe credenciais
5. Primeiro login detecta requirePasswordChange
6. Formulário de nova senha aparece
7. Usuário cria senha forte
8. requirePasswordChange = false
9. Login normal liberado

### Usuário Esqueceu Senha
1. Usuário tenta logar e falha
2. Usuário contacta administrador
3. Admin acessa: Dashboard → Usuários → Editar Usuário
4. Admin clica "Redefinir Senha"
5. Modal de confirmação aparece
6. Admin confirma
7. Sistema reseta senha para Sisgead@2024
8. Admin informa usuário da senha temporária
9. Usuário faz login com Sisgead@2024
10. Sistema força criação de nova senha
11. Acesso liberado

### Conta Bloqueada
1. Usuário erra senha 5 vezes
2. Sistema bloqueia: isLocked = true
3. Mensagem: "Conta bloqueada. Contacte administrador"
4. Usuário contacta admin
5. Admin: Editar Usuário → Redefinir Senha
6. Sistema automaticamente:
   - isLocked = false
   - failedLoginAttempts = 0
   - senha = Sisgead@2024
   - requirePasswordChange = true
7. Admin informa usuário
8. Usuário loga e cria nova senha

## Boas Práticas

Para Administradores:
✓ Sempre informe o usuário após redefinir senha
✓ Peça confirmação de identidade antes de resetar
✓ Documente resets frequentes (pode indicar problema)
✓ Oriente sobre política de senhas fortes

Para Usuários:
✓ Use gerenciador de senhas (LastPass, 1Password)
✓ Nunca compartilhe senha
✓ Troque regularmente (sugestão: 90 dias)
✓ Use senhas diferentes por sistema

## Segurança Técnica

Hash de Senha:
- Algoritmo: bcrypt (cost factor 10)
- Salt automático
- Nunca armazenada em plain text

Validação:
- Frontend: Regex para requisitos
- Backend: bcrypt.compare() para verificação
- Timeout: 3 segundos para prevenir timing attacks

Auditoria:
- lastPasswordChange registrado
- failedLoginAttempts incrementado
- isLocked quando ≥ 5 tentativas
      `,
      wordCount: 380
    },

    'arquitetura-ia-dual': {
      id: 'arquitetura-ia-dual',
      title: 'Arquitetura IA Dual-Level',
      category: 'arquitetura',
      tags: ['ia', 'arquitetura', 'gemini', 'contexto'],
      version: '3.0.0',
      lastUpdate: '2025-11-06',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'avançado' as const,
      path: '/wiki/03-arquitetura/arquitetura-ia-dual-level.md',
      content: `
# Arquitetura IA Dual-Level

## Conceito

Sistema de IA com dois níveis de contexto:

1. Institucional (Master/OrgAdmin)
   - Acesso a TODOS os dados da instituição
   - Análise cross-org
   - Insights estratégicos

2. Organizacional (OrgAdmin/Member)
   - Acesso a dados de UMA organização
   - Análise isolada
   - Workspace v2.0 dedicado

## Componentes

AIContext:
- Provedor global de estado
- useAI() hook
- useAIAccess() hook
- Gerencia conversação e contexto

AIFloatingButton:
- Adaptativo por role
- Master: Roxo 👑
- OrgAdmin: Azul 👔
- Member: Verde 👤

UnifiedAIModal:
- Interface contextual
- Quick actions por role
- Histórico de conversação

## Contexto Data

Master vê:
- currentInstitution
- allOrganizations[]
- allUsers[]
- consolidatedAssessments[]

OrgAdmin vê:
- currentOrganization
- orgUsers[]
- orgAssessments[]

Member vê:
- currentUser
- ownAssessments[]

## Integração Gemini

geminiService.ts (v2.0):
- Cloudflare Worker proxy
- Mock mode fallback
- GoogleGenAI SDK

PremiumAIService (futuro):
- queryInstitutional()
- queryOrganizational()
- queryPersonal()
      `,
      wordCount: 180
    },

    'como-fazer-avaliacao': {
      id: 'como-fazer-avaliacao',
      title: 'Como Fazer Avaliação DISC',
      category: 'guias-usuario',
      tags: ['disc', 'avaliação', 'questionário', 'tutorial'],
      version: '3.0.0',
      lastUpdate: '2025-11-07',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'básico' as const,
      path: '/wiki/01-guias-usuario/como-fazer-avaliacao.md',
      content: `
# Como Fazer Avaliação DISC

Passo 1: Acesse o link enviado pelo administrador (funciona em celular, tablet, computador).

Passo 2: Preencha Nome completo e CPF (apenas números).

Passo 3: Responda questionário (15-20 min):
- 24 perguntas com 4 palavras
- Escolha 1 MAIS parecida e 1 MENOS parecida
- Primeira impressão é melhor
- Pense no comportamento NO TRABALHO

Passo 4: Veja resultado:
- Perfil principal: D, I, S ou C
- Gráfico de pontos
- Características
- Funcionamento em equipe

Passo 5: Salve PDF (Imprimir → Salvar como PDF)

Problemas comuns:
- Questionário não salva: Limpe cache, use navegador atualizado
- Link não funciona: Copie link completo, tente modo anônimo
- Refazer avaliação: Entre com CPF → sistema pergunta se quer substituir

Dicas:
1. Reserve 20-30 min sem interrupções
2. Seja honesto (não há certo/errado)
3. Pense no trabalho, não lazer
4. Não pense muito
5. Ambiente calmo
      `,
      wordCount: 180
    },

    'primeiro-acesso': {
      id: 'primeiro-acesso',
      title: 'Primeiro Acesso ao SISGEAD 3.0',
      category: 'guias-usuario',
      tags: ['primeiro-acesso', 'login', 'cadastro', 'senha'],
      version: '3.0.0',
      lastUpdate: '2025-11-07',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'básico' as const,
      path: '/wiki/01-guias-usuario/primeiro-acesso.md',
      content: `
# Primeiro Acesso

Para Membros:
1. Receba link, CPF, senha temporária Sisgead@2024
2. Faça login
3. Sistema FORÇA criar nova senha (mín 8 chars, 1 maiúscula, 1 minúscula, 1 número, 1 especial)
4. Pronto!

Para OrgAdmin:
- Mesmo fluxo de membro
- Acesso a: Dashboard org, gerenciar usuários, criar membros, relatórios
- NÃO vê outras organizações

Para Master:
- Login com senha do setup
- Acesso total: todas orgs, todos usuários, criar orgs, configurações, relatórios consolidados

Segurança:
- Troque senha temporária imediatamente
- Use senha forte e única
- Não compartilhe
- Faça logout ao sair

Se esquecer senha: Admin pode redefinir para Sisgead@2024

Conta bloqueada (5 tentativas): Admin redefine senha (desbloqueia)

Navegadores suportados: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
NÃO suportado: Internet Explorer

Dispositivos: Desktop (recomendado), notebook, tablet, celular (funcional mas otimizado para desktop)

Problemas:
- Senha temporária não funciona: Verifique maiúsculas/minúsculas, contacte admin
- CPF não reconhecido: Digite apenas números, verifique cadastro com admin
- Erro criar senha: Verifique requisitos, tente senha diferente, limpe cache
      `,
      wordCount: 220
    },

    'problemas-login': {
      id: 'problemas-login',
      title: 'Problemas de Login e Acesso',
      category: 'troubleshooting',
      tags: ['login', 'senha', 'cpf', 'acesso', 'erro'],
      version: '3.0.0',
      lastUpdate: '2025-11-07',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'básico' as const,
      path: '/wiki/05-troubleshooting/problemas-login.md',
      content: `
# Problemas de Login

Erro "CPF não encontrado":
- Digite apenas números (não 123.456.789-00, sim 12345678900)
- Verifique cadastro com admin
- Pode estar em outra organização (peça link correto)

Erro "Senha incorreta":
- Primeiro acesso? Senha: Sisgead@2024 (S maiúsculo)
- Verifique Caps Lock desativado
- Admin pode redefinir senha

Conta bloqueada (5 tentativas falhadas):
- Apenas admin desbloqueia
- Admin redefine senha → volta Sisgead@2024 + desbloqueia
- Faça login e crie nova senha

Deve alterar senha:
- Você está com senha temporária
- Crie nova senha: mín 8 chars, 1 maiúscula, 1 minúscula, 1 número, 1 especial
- Exemplos válidos: Minhasenha@2025, Admin#2024Forte

Página branca após login:
1. Limpe cache (Ctrl+Shift+Del)
2. Pressione F12 → Console → veja erros
3. Teste modo anônimo
4. Atualize navegador

Sistema lento:
- Teste internet (mín 5 Mbps)
- Feche outras abas
- Reinicie navegador/computador

Quando contactar suporte:
- Nenhuma solução funcionou
- Erro persiste após limpar cache
- Mensagem não documentada
- Sistema não carrega há 10+ min

Informações para fornecer:
1. CPF
2. Mensagem de erro exata (print)
3. Navegador usado
4. O que estava tentando fazer
5. Print do console (F12)

Checklist antes de reportar:
- CPF apenas números
- Senha correta
- Caps Lock desativado
- Cache limpo
- Navegador atualizado
- Testado modo anônimo
- Internet 5+ Mbps
- Console sem erros
      `,
      wordCount: 250
    },

    'pagina-branca': {
      id: 'pagina-branca',
      title: 'Solução: Página em Branco',
      category: 'troubleshooting',
      tags: ['página-branca', 'erro', 'cache', 'deploy'],
      version: '3.0.0',
      lastUpdate: '2025-11-07',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'intermediário' as const,
      path: '/wiki/05-troubleshooting/pagina-branca.md',
      content: `
# Página em Branco - Solução

Causas: 80% cache, 15% erro JavaScript, 5% deploy.

Solução 1 - Limpar Cache (TENTE PRIMEIRO):
Chrome/Edge: Ctrl+Shift+Del → Todo período → Marque cookies e cache → Limpar → Feche TUDO → Reabra
Firefox: Ctrl+Shift+Del → Tudo → Cookies e cache → Limpar → Feche → Reabra
Safari: Preferências → Privacidade → Gerenciar Dados → Remover github.io

Solução 2 - Hard Refresh:
Windows: Ctrl+F5 ou Ctrl+Shift+R
Mac: Cmd+Shift+R

Solução 3 - Modo Anônimo:
Chrome/Edge: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
Se funciona em anônimo → problema é cache/extensões

Solução 4 - Console F12:
1. F12 → Console → Recarregue
2. "Failed to load resource" → Assets não carregaram → Aguarde 10 min
3. "Uncaught SyntaxError" → JS corrompido → Limpe cache
4. "Cannot read property" → React não iniciou → Verifique se index.js carregou

Solução 5 - Network F12:
1. F12 → Network → Recarregue
2. Procure: index.html (200 OK), index.css (200 OK), index.js (200 OK)
3. Se 404 → Deploy incompleto → Aguarde 10 min

Solução 6 - URLs Alternativas:
Teste: /sisgead-3.0/, /Sisgead-3.0/, /SISGEAD-3.0/

Solução 7 - Navegador:
✅ Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
❌ Internet Explorer
Atualize: chrome://settings/help

Taxa sucesso:
- Limpar cache: 80%
- Hard refresh: +10%
- Aguardar deploy: +5%
- Outros: 5%

Quando escalar:
- Todas soluções falharam
- Erro não documentado
- Problema persiste 1+ hora
- Outros usuários reportam

Informações fornecer:
- URL completa
- Navegador + versão
- Print console F12
- Print network F12
- Timestamp
- Limpou cache? Sim/Não
- Funciona modo anônimo? Sim/Não
      `,
      wordCount: 280
    },

    'multi-tenant': {
      id: 'multi-tenant',
      title: 'Arquitetura Multi-Tenant',
      category: 'arquitetura',
      tags: ['multi-tenant', 'institucional', 'hierarquia'],
      version: '3.0.0',
      lastUpdate: '2025-11-07',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'avançado' as const,
      path: '/wiki/03-arquitetura/multi-tenant.md',
      content: `
# Arquitetura Multi-Tenant

3 Níveis: Instituição (Master) → Organizações (OrgAdmin) → Usuários (Member)

Master:
- Acesso: Todas orgs, todos usuários, criar/editar/excluir orgs, relatórios consolidados, config global
- Responsabilidades: Estrutura de orgs, definir admins, monitorar performance, políticas

OrgAdmin:
- Acesso: Sua org apenas, todos usuários da org, criar/editar/excluir usuários, relatórios org
- NÃO vê outras orgs

Member:
- Acesso: Próprios dados, fazer DISC, ver perfil
- NÃO vê outros usuários, sem funções admin

Isolamento de Dados:
- Org A NÃO vê Org B
- OrgAdmin A NÃO acessa Org B
- Apenas Master vê todos
- Storage: localStorage segmentado por orgId
- Validações permissão em queries

Fluxos:
- Criação: Master → OrgAdmin → Member → Avaliação → Dados na org
- Relatórios: Member (só seu), OrgAdmin (toda org), Master (consolidado)

Casos Uso:
- Empresa multi-filial
- Universidade (faculdades)
- Governo (escolas)
- Corporação (departamentos)

Configurações Org:
- maxUsers, maxAssessments/mês
- Features: DISC, Team Builder IA, Relatórios, Export PDF, API, Auditoria
- Custom branding (opcional)

Transferências (só Master):
- userService.transfer(userId, fromOrg, toOrg)
- Histórico preservado

Segurança:
- Master: CPF + senha forte (12+ chars)
- OrgAdmin: CPF + senha (8+ chars)
- Member: CPF + senha (8+ chars)
- Todas ações auditadas

Compliance LGPD:
- Consentimento por org
- Direito acesso, correção, exclusão
- Portabilidade JSON/CSV
      `,
      wordCount: 250
    }
  };

  /**
   * Inicializar serviço (carregar docs)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Carregar documentos da base estática
    Object.values(this.WIKI_DOCS).forEach(doc => {
      this.documents.set(doc.id, doc);
      this.indexDocument(doc);
    });

    this.initialized = true;
    console.log(`✅ WikiService initialized with ${this.documents.size} documents`);
  }

  /**
   * Indexar documento para busca
   */
  private indexDocument(doc: WikiDocument): void {
    if (!doc.aiContext) return; // Só indexa docs marcados para IA

    // Extrair keywords do conteúdo
    const keywords = this.extractKeywords(doc.content + ' ' + doc.title + ' ' + doc.tags.join(' '));
    
    keywords.forEach(keyword => {
      if (!this.index.has(keyword)) {
        this.index.set(keyword, new Set());
      }
      this.index.get(keyword)!.add(doc.id);
    });
  }

  /**
   * Extrair keywords relevantes do texto
   */
  private extractKeywords(text: string): string[] {
    // Normalizar texto
    const normalized = text.toLowerCase()
      .replace(/[^\w\sáàâãéèêíìîóòôõúùûç]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Palavras stop (ignorar)
    const stopWords = new Set([
      'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das',
      'em', 'no', 'na', 'nos', 'nas', 'para', 'com', 'por', 'e', 'ou',
      'que', 'se', 'é', 'são', 'como', 'quando', 'onde', 'qual', 'quais'
    ]);

    // Split e filtrar
    return normalized
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index); // Unique
  }

  /**
   * Buscar documentos relevantes
   */
  async search(query: string, limit: number = 3): Promise<WikiSearchResult[]> {
    await this.initialize();

    const queryKeywords = this.extractKeywords(query);
    const scores = new Map<string, number>();

    // Calcular score de relevância para cada documento
    queryKeywords.forEach(keyword => {
      const matchingDocs = this.index.get(keyword);
      if (matchingDocs) {
        matchingDocs.forEach(docId => {
          scores.set(docId, (scores.get(docId) || 0) + 1);
        });
      }
    });

    // Ordenar por relevância
    const results: WikiSearchResult[] = Array.from(scores.entries())
      .map(([docId, score]) => {
        const doc = this.documents.get(docId)!;
        return {
          document: doc,
          relevance: score / queryKeywords.length,
          matchedSections: this.findMatchedSections(doc, queryKeywords)
        };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return results;
  }

  /**
   * Encontrar seções do documento que contêm keywords
   */
  private findMatchedSections(doc: WikiDocument, keywords: string[]): string[] {
    const sections: string[] = [];
    const lines = doc.content.split('\n');
    
    let currentSection = '';
    for (const line of lines) {
      if (line.startsWith('#')) {
        currentSection = line.replace(/^#+\s*/, '');
      }
      
      const hasMatch = keywords.some(kw => line.toLowerCase().includes(kw));
      if (hasMatch && currentSection && !sections.includes(currentSection)) {
        sections.push(currentSection);
      }
    }

    return sections.slice(0, 3); // Máximo 3 seções
  }

  /**
   * Obter documento por ID
   */
  async getDocument(id: string): Promise<WikiDocument | null> {
    await this.initialize();
    return this.documents.get(id) || null;
  }

  /**
   * Obter todos os documentos de uma categoria
   */
  async getByCategory(category: string): Promise<WikiDocument[]> {
    await this.initialize();
    return Array.from(this.documents.values())
      .filter(doc => doc.category === category);
  }

  /**
   * Gerar contexto para IA baseado em query
   */
  async getContextForAI(query: string): Promise<string> {
    const results = await this.search(query, 2); // Top 2 docs mais relevantes

    if (results.length === 0) {
      return 'Nenhuma documentação específica encontrada para esta pergunta.';
    }

    let context = '📚 DOCUMENTAÇÃO RELEVANTE:\n\n';
    
    results.forEach((result, index) => {
      context += `--- ${index + 1}. ${result.document.title} (${Math.round(result.relevance * 100)}% relevante) ---\n`;
      context += result.document.content.substring(0, 800); // Primeiros 800 chars
      if (result.matchedSections.length > 0) {
        context += `\n\nSeções relevantes: ${result.matchedSections.join(', ')}`;
      }
      context += '\n\n';
    });

    return context;
  }

  /**
   * Listar todos os documentos (para debug)
   */
  async listAll(): Promise<WikiDocument[]> {
    await this.initialize();
    return Array.from(this.documents.values());
  }
}

export const wikiService = new WikiService();
