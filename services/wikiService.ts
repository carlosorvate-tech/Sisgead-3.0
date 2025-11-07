/**
 * WikiService - Sistema de Base de Conhecimento para IA
 * 
 * ResponsÃ¡vel por:
 * - Carregar documentaÃ§Ã£o do Wiki
 * - Indexar conteÃºdo para busca semÃ¢ntica
 * - Fornecer contexto para IA Assistant
 * - Buscar respostas em documentaÃ§Ã£o
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
  difficulty: 'bÃ¡sico' | 'intermediÃ¡rio' | 'avanÃ§ado';
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
   * Base de documentaÃ§Ã£o estÃ¡tica (serÃ¡ carregada dinamicamente em produÃ§Ã£o)
   */
  private readonly WIKI_DOCS = {
    'guia-administrador': {
      id: 'guia-administrador',
      title: 'Guia do Administrador SISGEAD 3.0',
      category: 'guias-admin',
      tags: ['administrador', 'gestÃ£o', 'master', 'organizaÃ§Ãµes'],
      version: '3.0.0',
      lastUpdate: '2025-11-06',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'intermediÃ¡rio' as const,
      path: '/wiki/02-guias-administrador/guia-administrador.md',
      content: `
# Guia do Administrador SISGEAD 3.0

## NÃ­veis de Acesso

### Master (Institucional)
PermissÃµes completas: gerenciar todas organizaÃ§Ãµes, todos usuÃ¡rios, redefinir senhas, acesso a dados consolidados, IA institucional.

### OrgAdmin (Organizacional)
PermissÃµes limitadas: gerenciar apenas sua organizaÃ§Ã£o, criar/editar usuÃ¡rios da org, IA organizacional.

### Member (Membro)
PermissÃµes bÃ¡sicas: fazer avaliaÃ§Ãµes, visualizar prÃ³prio perfil, IA pessoal.

## GestÃ£o de OrganizaÃ§Ãµes

### Criar Nova OrganizaÃ§Ã£o
Dashboard Master â†’ OrganizaÃ§Ãµes â†’ "+ Nova OrganizaÃ§Ã£o"

Campos: Nome, Status (Ativa/Inativa/Suspensa), MÃ¡x UsuÃ¡rios (padrÃ£o: 50), Features (AvaliaÃ§Ãµes, RelatÃ³rios, Analytics, Team Builder, IA), AprovaÃ§Ã£o de AvaliaÃ§Ãµes.

### Editar OrganizaÃ§Ã£o
Lista â†’ Editar â†’ Alterar dados, configuraÃ§Ãµes, ou EXCLUIR (irreversÃ­vel).

## GestÃ£o de UsuÃ¡rios

### Criar Novo UsuÃ¡rio
Dashboard â†’ UsuÃ¡rios â†’ "+ Novo UsuÃ¡rio"

Dados: Nome, Email (login Ãºnico), Telefone (opcional), Departamento, Role (Member/OrgAdmin/Master), OrganizaÃ§Ãµes, Status.

Senha inicial: Sisgead@2024 (usuÃ¡rio DEVE trocar no primeiro login).

### Editar UsuÃ¡rio

1. Alterar Dados: Nome, email, telefone, departamento, organizaÃ§Ãµes, role.

2. Redefinir Senha:
   - Quando: UsuÃ¡rio esqueceu senha, conta bloqueada, reset de seguranÃ§a
   - Como: BotÃ£o "Redefinir Senha" â†’ Senha volta para Sisgead@2024
   - Efeito: ForÃ§a criaÃ§Ã£o de nova senha, remove bloqueio

3. Excluir UsuÃ¡rio:
   - IrreversÃ­vel: Remove TODOS os dados
   - Uso: FuncionÃ¡rio desligado, conta duplicada

## Sistema de Senhas

Senha PadrÃ£o: Sisgead@2024
Usado em: Novos usuÃ¡rios, reset de senha

PolÃ­tica:
- MÃ­nimo 8 caracteres
- 1 maiÃºscula, 1 minÃºscula, 1 nÃºmero, 1 especial
- Bloqueio apÃ³s 5 tentativas falhadas
- Admin desbloqueia via "Redefinir Senha"

### Fluxos Comuns

Novo UsuÃ¡rio:
1. Admin cria â†’ Senha padrÃ£o
2. UsuÃ¡rio recebe email
3. Primeiro login â†’ Pede nova senha
4. Cria senha forte â†’ Acesso liberado

Esqueceu Senha:
1. UsuÃ¡rio falha login
2. Contacta admin
3. Admin "Redefinir Senha"
4. Volta para padrÃ£o
5. UsuÃ¡rio cria nova

Conta Bloqueada:
1. Errou 5x â†’ Bloqueio
2. Admin "Redefinir Senha"
3. Bloqueio removido
4. Senha padrÃ£o
5. UsuÃ¡rio cria nova

## IA Assistant

BotÃ£o Flutuante: Canto inferior direito
- Master: Roxo com ðŸ‘‘
- OrgAdmin: Azul com ðŸ‘”
- Member: Verde com ðŸ‘¤

Quick Actions (Master):
- VisÃ£o Institucional
- Comparar OrganizaÃ§Ãµes
- Mapeamento de Talentos
- Insights EstratÃ©gicos

Exemplos de Perguntas:
- "Quantos usuÃ¡rios ativos?"
- "Quais organizaÃ§Ãµes inativas?"
- "Como redefinir senha?"
- "DistribuiÃ§Ã£o de perfis DISC?"

## Troubleshooting

UsuÃ¡rio nÃ£o loga:
â†’ Editar UsuÃ¡rio â†’ Redefinir Senha

OrganizaÃ§Ã£o nÃ£o aparece:
â†’ Editar UsuÃ¡rio â†’ OrganizaÃ§Ãµes â†’ Marcar â†’ Salvar

IA nÃ£o aparece:
â†’ Verificar feature "ai-assistant" na org
      `,
      wordCount: 450
    },

    'sistema-senhas': {
      id: 'sistema-senhas',
      title: 'Sistema de Gerenciamento de Senhas',
      category: 'guias-admin',
      tags: ['senha', 'seguranÃ§a', 'reset', 'bloqueio'],
      version: '3.0.0',
      lastUpdate: '2025-11-06',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'bÃ¡sico' as const,
      path: '/wiki/02-guias-administrador/sistema-senhas.md',
      content: `
# Sistema de Senhas SISGEAD 3.0

## Senha PadrÃ£o

Senha: Sisgead@2024

Quando Ã© usada:
- CriaÃ§Ã£o de novos usuÃ¡rios
- Reset de senha por administrador
- RecuperaÃ§Ã£o de conta bloqueada

SeguranÃ§a:
- UsuÃ¡rio NÃƒO pode manter senha padrÃ£o
- Sistema FORÃ‡A troca no primeiro login
- Campo requirePasswordChange: true

## PolÃ­tica de Senhas

Requisitos obrigatÃ³rios:
âœ“ MÃ­nimo 8 caracteres
âœ“ Pelo menos 1 letra maiÃºscula
âœ“ Pelo menos 1 letra minÃºscula
âœ“ Pelo menos 1 nÃºmero
âœ“ Pelo menos 1 caractere especial (@, #, $, %, etc.)

Bloqueio automÃ¡tico:
- ApÃ³s 5 tentativas falhadas de login
- Admin pode desbloquear via "Redefinir Senha"

## Redefinir Senha (Admin)

Acesso: Editar UsuÃ¡rio â†’ BotÃ£o "Redefinir Senha" (amarelo)

O que acontece:
1. Senha volta para Sisgead@2024
2. requirePasswordChange = true (forÃ§a nova senha)
3. failedLoginAttempts = 0 (limpa tentativas)
4. isLocked = false (desbloqueia conta)

Quando usar:
- UsuÃ¡rio esqueceu a senha
- Conta bloqueada por tentativas falhadas
- Reset de seguranÃ§a (suspeita de comprometimento)

## Fluxos Completos

### Novo UsuÃ¡rio
1. Admin cria usuÃ¡rio
2. Sistema define senha = Sisgead@2024
3. requirePasswordChange = true
4. UsuÃ¡rio recebe credenciais
5. Primeiro login detecta requirePasswordChange
6. FormulÃ¡rio de nova senha aparece
7. UsuÃ¡rio cria senha forte
8. requirePasswordChange = false
9. Login normal liberado

### UsuÃ¡rio Esqueceu Senha
1. UsuÃ¡rio tenta logar e falha
2. UsuÃ¡rio contacta administrador
3. Admin acessa: Dashboard â†’ UsuÃ¡rios â†’ Editar UsuÃ¡rio
4. Admin clica "Redefinir Senha"
5. Modal de confirmaÃ§Ã£o aparece
6. Admin confirma
7. Sistema reseta senha para Sisgead@2024
8. Admin informa usuÃ¡rio da senha temporÃ¡ria
9. UsuÃ¡rio faz login com Sisgead@2024
10. Sistema forÃ§a criaÃ§Ã£o de nova senha
11. Acesso liberado

### Conta Bloqueada
1. UsuÃ¡rio erra senha 5 vezes
2. Sistema bloqueia: isLocked = true
3. Mensagem: "Conta bloqueada. Contacte administrador"
4. UsuÃ¡rio contacta admin
5. Admin: Editar UsuÃ¡rio â†’ Redefinir Senha
6. Sistema automaticamente:
   - isLocked = false
   - failedLoginAttempts = 0
   - senha = Sisgead@2024
   - requirePasswordChange = true
7. Admin informa usuÃ¡rio
8. UsuÃ¡rio loga e cria nova senha

## Boas PrÃ¡ticas

Para Administradores:
âœ“ Sempre informe o usuÃ¡rio apÃ³s redefinir senha
âœ“ PeÃ§a confirmaÃ§Ã£o de identidade antes de resetar
âœ“ Documente resets frequentes (pode indicar problema)
âœ“ Oriente sobre polÃ­tica de senhas fortes

Para UsuÃ¡rios:
âœ“ Use gerenciador de senhas (LastPass, 1Password)
âœ“ Nunca compartilhe senha
âœ“ Troque regularmente (sugestÃ£o: 90 dias)
âœ“ Use senhas diferentes por sistema

## SeguranÃ§a TÃ©cnica

Hash de Senha:
- Algoritmo: bcrypt (cost factor 10)
- Salt automÃ¡tico
- Nunca armazenada em plain text

ValidaÃ§Ã£o:
- Frontend: Regex para requisitos
- Backend: bcrypt.compare() para verificaÃ§Ã£o
- Timeout: 3 segundos para prevenir timing attacks

Auditoria:
- lastPasswordChange registrado
- failedLoginAttempts incrementado
- isLocked quando â‰¥ 5 tentativas
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
      difficulty: 'avanÃ§ado' as const,
      path: '/wiki/03-arquitetura/arquitetura-ia-dual-level.md',
      content: `
# Arquitetura IA Dual-Level

## Conceito

Sistema de IA com dois nÃ­veis de contexto:

1. Institucional (Master/OrgAdmin)
   - Acesso a TODOS os dados da instituiÃ§Ã£o
   - AnÃ¡lise cross-org
   - Insights estratÃ©gicos

2. Organizacional (OrgAdmin/Member)
   - Acesso a dados de UMA organizaÃ§Ã£o
   - AnÃ¡lise isolada
   - Workspace v2.0 dedicado

## Componentes

AIContext:
- Provedor global de estado
- useAI() hook
- useAIAccess() hook
- Gerencia conversaÃ§Ã£o e contexto

AIFloatingButton:
- Adaptativo por role
- Master: Roxo ðŸ‘‘
- OrgAdmin: Azul ðŸ‘”
- Member: Verde ðŸ‘¤

UnifiedAIModal:
- Interface contextual
- Quick actions por role
- HistÃ³rico de conversaÃ§Ã£o

## Contexto Data

Master vÃª:
- currentInstitution
- allOrganizations[]
- allUsers[]
- consolidatedAssessments[]

OrgAdmin vÃª:
- currentOrganization
- orgUsers[]
- orgAssessments[]

Member vÃª:
- currentUser
- ownAssessments[]

## IntegraÃ§Ã£o Gemini

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
      title: 'Como Fazer AvaliaÃ§Ã£o DISC',
      category: 'guias-usuario',
      tags: ['disc', 'avaliaÃ§Ã£o', 'questionÃ¡rio', 'tutorial'],
      version: '3.0.0',
      lastUpdate: '2025-11-07',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'bÃ¡sico' as const,
      path: '/wiki/01-guias-usuario/como-fazer-avaliacao.md',
      content: `
# Como Fazer AvaliaÃ§Ã£o DISC

Passo 1: Acesse o link enviado pelo administrador (funciona em celular, tablet, computador).

Passo 2: Preencha Nome completo e CPF (apenas nÃºmeros).

Passo 3: Responda questionÃ¡rio (15-20 min):
- 24 perguntas com 4 palavras
- Escolha 1 MAIS parecida e 1 MENOS parecida
- Primeira impressÃ£o Ã© melhor
- Pense no comportamento NO TRABALHO

Passo 4: Veja resultado:
- Perfil principal: D, I, S ou C
- GrÃ¡fico de pontos
- CaracterÃ­sticas
- Funcionamento em equipe

Passo 5: Salve PDF (Imprimir â†’ Salvar como PDF)

Problemas comuns:
- QuestionÃ¡rio nÃ£o salva: Limpe cache, use navegador atualizado
- Link nÃ£o funciona: Copie link completo, tente modo anÃ´nimo
- Refazer avaliaÃ§Ã£o: Entre com CPF â†’ sistema pergunta se quer substituir

Dicas:
1. Reserve 20-30 min sem interrupÃ§Ãµes
2. Seja honesto (nÃ£o hÃ¡ certo/errado)
3. Pense no trabalho, nÃ£o lazer
4. NÃ£o pense muito
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
      difficulty: 'bÃ¡sico' as const,
      path: '/wiki/01-guias-usuario/primeiro-acesso.md',
      content: `
# Primeiro Acesso

Para Membros:
1. Receba link, CPF, senha temporÃ¡ria Sisgead@2024
2. FaÃ§a login
3. Sistema FORÃ‡A criar nova senha (mÃ­n 8 chars, 1 maiÃºscula, 1 minÃºscula, 1 nÃºmero, 1 especial)
4. Pronto!

Para OrgAdmin:
- Mesmo fluxo de membro
- Acesso a: Dashboard org, gerenciar usuÃ¡rios, criar membros, relatÃ³rios
- NÃƒO vÃª outras organizaÃ§Ãµes

Para Master:
- Login com senha do setup
- Acesso total: todas orgs, todos usuÃ¡rios, criar orgs, configuraÃ§Ãµes, relatÃ³rios consolidados

SeguranÃ§a:
- Troque senha temporÃ¡ria imediatamente
- Use senha forte e Ãºnica
- NÃ£o compartilhe
- FaÃ§a logout ao sair

Se esquecer senha: Admin pode redefinir para Sisgead@2024

Conta bloqueada (5 tentativas): Admin redefine senha (desbloqueia)

Navegadores suportados: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
NÃƒO suportado: Internet Explorer

Dispositivos: Desktop (recomendado), notebook, tablet, celular (funcional mas otimizado para desktop)

Problemas:
- Senha temporÃ¡ria nÃ£o funciona: Verifique maiÃºsculas/minÃºsculas, contacte admin
- CPF nÃ£o reconhecido: Digite apenas nÃºmeros, verifique cadastro com admin
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
      difficulty: 'bÃ¡sico' as const,
      path: '/wiki/05-troubleshooting/problemas-login.md',
      content: `
# Problemas de Login

Erro "CPF nÃ£o encontrado":
- Digite apenas nÃºmeros (nÃ£o 123.456.789-00, sim 12345678900)
- Verifique cadastro com admin
- Pode estar em outra organizaÃ§Ã£o (peÃ§a link correto)

Erro "Senha incorreta":
- Primeiro acesso? Senha: Sisgead@2024 (S maiÃºsculo)
- Verifique Caps Lock desativado
- Admin pode redefinir senha

Conta bloqueada (5 tentativas falhadas):
- Apenas admin desbloqueia
- Admin redefine senha â†’ volta Sisgead@2024 + desbloqueia
- FaÃ§a login e crie nova senha

Deve alterar senha:
- VocÃª estÃ¡ com senha temporÃ¡ria
- Crie nova senha: mÃ­n 8 chars, 1 maiÃºscula, 1 minÃºscula, 1 nÃºmero, 1 especial
- Exemplos vÃ¡lidos: Minhasenha@2025, Admin#2024Forte

PÃ¡gina branca apÃ³s login:
1. Limpe cache (Ctrl+Shift+Del)
2. Pressione F12 â†’ Console â†’ veja erros
3. Teste modo anÃ´nimo
4. Atualize navegador

Sistema lento:
- Teste internet (mÃ­n 5 Mbps)
- Feche outras abas
- Reinicie navegador/computador

Quando contactar suporte:
- Nenhuma soluÃ§Ã£o funcionou
- Erro persiste apÃ³s limpar cache
- Mensagem nÃ£o documentada
- Sistema nÃ£o carrega hÃ¡ 10+ min

InformaÃ§Ãµes para fornecer:
1. CPF
2. Mensagem de erro exata (print)
3. Navegador usado
4. O que estava tentando fazer
5. Print do console (F12)

Checklist antes de reportar:
- CPF apenas nÃºmeros
- Senha correta
- Caps Lock desativado
- Cache limpo
- Navegador atualizado
- Testado modo anÃ´nimo
- Internet 5+ Mbps
- Console sem erros
      `,
      wordCount: 250
    },

    'pagina-branca': {
      id: 'pagina-branca',
      title: 'SoluÃ§Ã£o: PÃ¡gina em Branco',
      category: 'troubleshooting',
      tags: ['pÃ¡gina-branca', 'erro', 'cache', 'deploy'],
      version: '3.0.0',
      lastUpdate: '2025-11-07',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'intermediÃ¡rio' as const,
      path: '/wiki/05-troubleshooting/pagina-branca.md',
      content: `
# PÃ¡gina em Branco - SoluÃ§Ã£o

Causas: 80% cache, 15% erro JavaScript, 5% deploy.

SoluÃ§Ã£o 1 - Limpar Cache (TENTE PRIMEIRO):
Chrome/Edge: Ctrl+Shift+Del â†’ Todo perÃ­odo â†’ Marque cookies e cache â†’ Limpar â†’ Feche TUDO â†’ Reabra
Firefox: Ctrl+Shift+Del â†’ Tudo â†’ Cookies e cache â†’ Limpar â†’ Feche â†’ Reabra
Safari: PreferÃªncias â†’ Privacidade â†’ Gerenciar Dados â†’ Remover github.io

SoluÃ§Ã£o 2 - Hard Refresh:
Windows: Ctrl+F5 ou Ctrl+Shift+R
Mac: Cmd+Shift+R

SoluÃ§Ã£o 3 - Modo AnÃ´nimo:
Chrome/Edge: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
Se funciona em anÃ´nimo â†’ problema Ã© cache/extensÃµes

SoluÃ§Ã£o 4 - Console F12:
1. F12 â†’ Console â†’ Recarregue
2. "Failed to load resource" â†’ Assets nÃ£o carregaram â†’ Aguarde 10 min
3. "Uncaught SyntaxError" â†’ JS corrompido â†’ Limpe cache
4. "Cannot read property" â†’ React nÃ£o iniciou â†’ Verifique se index.js carregou

SoluÃ§Ã£o 5 - Network F12:
1. F12 â†’ Network â†’ Recarregue
2. Procure: index.html (200 OK), index.css (200 OK), index.js (200 OK)
3. Se 404 â†’ Deploy incompleto â†’ Aguarde 10 min

SoluÃ§Ã£o 6 - URLs Alternativas:
Teste: /sisgead-3.0/, /Sisgead-3.0/, /SISGEAD-3.0/

SoluÃ§Ã£o 7 - Navegador:
âœ… Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
âŒ Internet Explorer
Atualize: chrome://settings/help

Taxa sucesso:
- Limpar cache: 80%
- Hard refresh: +10%
- Aguardar deploy: +5%
- Outros: 5%

Quando escalar:
- Todas soluÃ§Ãµes falharam
- Erro nÃ£o documentado
- Problema persiste 1+ hora
- Outros usuÃ¡rios reportam

InformaÃ§Ãµes fornecer:
- URL completa
- Navegador + versÃ£o
- Print console F12
- Print network F12
- Timestamp
- Limpou cache? Sim/NÃ£o
- Funciona modo anÃ´nimo? Sim/NÃ£o
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
      difficulty: 'avanÃ§ado' as const,
      path: '/wiki/03-arquitetura/multi-tenant.md',
      content: `
# Arquitetura Multi-Tenant

3 NÃ­veis: InstituiÃ§Ã£o (Master) â†’ OrganizaÃ§Ãµes (OrgAdmin) â†’ UsuÃ¡rios (Member)

Master:
- Acesso: Todas orgs, todos usuÃ¡rios, criar/editar/excluir orgs, relatÃ³rios consolidados, config global
- Responsabilidades: Estrutura de orgs, definir admins, monitorar performance, polÃ­ticas

OrgAdmin:
- Acesso: Sua org apenas, todos usuÃ¡rios da org, criar/editar/excluir usuÃ¡rios, relatÃ³rios org
- NÃƒO vÃª outras orgs

Member:
- Acesso: PrÃ³prios dados, fazer DISC, ver perfil
- NÃƒO vÃª outros usuÃ¡rios, sem funÃ§Ãµes admin

Isolamento de Dados:
- Org A NÃƒO vÃª Org B
- OrgAdmin A NÃƒO acessa Org B
- Apenas Master vÃª todos
- Storage: localStorage segmentado por orgId
- ValidaÃ§Ãµes permissÃ£o em queries

Fluxos:
- CriaÃ§Ã£o: Master â†’ OrgAdmin â†’ Member â†’ AvaliaÃ§Ã£o â†’ Dados na org
- RelatÃ³rios: Member (sÃ³ seu), OrgAdmin (toda org), Master (consolidado)

Casos Uso:
- Empresa multi-filial
- Universidade (faculdades)
- Governo (escolas)
- CorporaÃ§Ã£o (departamentos)

ConfiguraÃ§Ãµes Org:
- maxUsers, maxAssessments/mÃªs
- Features: DISC, Team Builder IA, RelatÃ³rios, Export PDF, API, Auditoria
- Custom branding (opcional)

TransferÃªncias (sÃ³ Master):
- userService.transfer(userId, fromOrg, toOrg)
- HistÃ³rico preservado

SeguranÃ§a:
- Master: CPF + senha forte (12+ chars)
- OrgAdmin: CPF + senha (8+ chars)
- Member: CPF + senha (8+ chars)
- Todas aÃ§Ãµes auditadas

Compliance LGPD:
- Consentimento por org
- Direito acesso, correÃ§Ã£o, exclusÃ£o
- Portabilidade JSON/CSV
      `,
      wordCount: 250
    },

    'holocracia-papeis': {
      id: 'holocracia-papeis',
      title: 'Gestão por Papéis - Holocracia',
      category: 'metodologia',
      tags: ['holocracia', 'papéis', 'círculos', 'autoridade', 'equipes'],
      version: '3.0.0',
      lastUpdate: '2025-11-07',
      author: 'Sistema',
      aiContext: true,
      difficulty: 'avançado' as const,
      path: '/wiki/metodologias/holocracia.md',
      content: `
# Gestão por Papéis (Holocracia)

IMPORTANTE: A IA deve buscar na web informações atualizadas sobre Holocracia.

## O que é Holocracia?

Sistema de gestão organizacional que distribui autoridade através de PAPÉIS claros, não cargos hierárquicos tradicionais.

## Princípios Fundamentais

1. **Papéis, não cargos**: Pessoas preenchem múltiplos papéis dinâmicos
2. **Círculos auto-organizados**: Times com autonomia decisória
3. **Autoridade distribuída**: Decisão no nível do papel específico
4. **Transparência radical**: Regras e processos explícitos

## Como SISGEAD Premium Aplica Holocracia

A IA deve:
1. Analisar perfil DISC do usuário
2. Considerar experiências e competências do questionário expandido
3. **BUSCAR NA WEB** premissas atuais de Holocracia (Holacracy.org)
4. Sugerir PAPÉIS adequados ao perfil + contexto organizacional
5. Recomendar composição de círculos (equipes balanceadas)

## Exemplo Multi-Tenant

**Contexto**:
- Instituição: Empresa XYZ
- Organização: Departamento de TI
- Perfil: Master com D alto + Experiência em liderança técnica

**Papéis sugeridos** (baseado em Holocracia web + contexto institucional):
- Lead Link do Círculo Institucional
- Papel de Estratégia Organizacional Multi-Tenant
- Facilitador de Governança entre Organizações

## Diretivas para IA Premium

Ao sugerir papéis/equipes multi-org, a IA DEVE:

1. **Consultar fonte web** sobre Holocracia atual (Holacracy.org, artigos 2024-2025)
2. **Mapear perfis DISC** para papéis holacráticos:
   - D (Dominância)  Lead Links, papéis de tomada de decisão
   - I (Influência)  Facilitadores, papéis de comunicação externa
   - S (Estabilidade)  Papéis de suporte, processos contínuos
   - C (Conformidade)  Papéis de qualidade, governança interna
3. **Considerar hierarquia multi-tenant**:
   - Masters  Papéis estratégicos institucionais
   - OrgAdmins  Lead Links de círculos organizacionais
   - Members  Papéis operacionais específicos
4. **Sugerir círculos cross-org** quando adequado (projetos transversais)
5. **Balancear** autoridade distribuída com isolamento de dados LGPD
6. **Explicar razão** baseada em Holocracia + contexto institucional específico

## Recursos Web para Consulta

IA DEVE buscar automaticamente em:
- **Holacracy.org** (fonte oficial, constituição v5.0+)
- Artigos recentes 2024-2025 sobre implementação prática
- Cases de sucesso em estruturas multi-tenant
- Adaptações para organizações hierárquicas tradicionais
- Holocracia no contexto corporativo brasileiro

## Exemplo de Resposta Ideal

"Com base no seu perfil DISC (D alto, I médio) e experiência em gestão de projetos, sugiro os seguintes papéis holacráticos (segundo Holacracy.org 2024):

1. **Lead Link do Círculo de TI** - Sua dominância facilita decisões rápidas
2. **Facilitador de Governança** - Equilibra autonomia com estrutura
3. **Papel de Arquitetura de Soluções** - Combina expertise técnica com visão estratégica

Para sua equipe, recomendo círculo balanceado:
- 1 Lead Link (D alto) - você
- 2 Papéis operacionais (S alto) - estabilidade de processos  
- 1 Facilitador (I alto) - comunicação stakeholders
- 1 Papel de qualidade (C alto) - governança interna

Fonte: Holacracy Constitution v5.0 + Case Study XYZ Corp 2024"
`,
      wordCount: 250
    }
  };

  /**
   * Inicializar serviÃ§o (carregar docs)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Carregar documentos da base estÃ¡tica
    Object.values(this.WIKI_DOCS).forEach(doc => {
      this.documents.set(doc.id, doc);
      this.indexDocument(doc);
    });

    this.initialized = true;
    console.log(`âœ… WikiService initialized with ${this.documents.size} documents`);
  }

  /**
   * Indexar documento para busca
   */
  private indexDocument(doc: WikiDocument): void {
    if (!doc.aiContext) return; // SÃ³ indexa docs marcados para IA

    // Extrair keywords do conteÃºdo
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
      .replace(/[^\w\sÃ¡Ã Ã¢Ã£Ã©Ã¨ÃªÃ­Ã¬Ã®Ã³Ã²Ã´ÃµÃºÃ¹Ã»Ã§]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Palavras stop (ignorar)
    const stopWords = new Set([
      'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das',
      'em', 'no', 'na', 'nos', 'nas', 'para', 'com', 'por', 'e', 'ou',
      'que', 'se', 'Ã©', 'sÃ£o', 'como', 'quando', 'onde', 'qual', 'quais'
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

    // Calcular score de relevÃ¢ncia para cada documento
    queryKeywords.forEach(keyword => {
      const matchingDocs = this.index.get(keyword);
      if (matchingDocs) {
        matchingDocs.forEach(docId => {
          scores.set(docId, (scores.get(docId) || 0) + 1);
        });
      }
    });

    // Ordenar por relevÃ¢ncia
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
   * Encontrar seÃ§Ãµes do documento que contÃªm keywords
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

    return sections.slice(0, 3); // MÃ¡ximo 3 seÃ§Ãµes
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
      return 'Nenhuma documentaÃ§Ã£o especÃ­fica encontrada para esta pergunta.';
    }

    let context = 'ðŸ“š DOCUMENTAÃ‡ÃƒO RELEVANTE:\n\n';
    
    results.forEach((result, index) => {
      context += `--- ${index + 1}. ${result.document.title} (${Math.round(result.relevance * 100)}% relevante) ---\n`;
      context += result.document.content.substring(0, 800); // Primeiros 800 chars
      if (result.matchedSections.length > 0) {
        context += `\n\nSeÃ§Ãµes relevantes: ${result.matchedSections.join(', ')}`;
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
