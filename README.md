# 🏢 SISGEAD PREMIUM 3.0

**Sistema de Gestão Educacional e Administrativa - Versão Premium Multi-Tenant**

[![Status](https://img.shields.io/badge/status-alpha-yellow)](https://github.com/carlosorvate-tech/Sisgead-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🎯 Visão Geral

O **SISGEAD Premium 3.0** é uma evolução multi-tenant do SISGEAD Standard 2.0, projetado para instituições que necessitam de gestão hierárquica de organizações, controle granular de acesso e isolamento completo de dados.

### ✨ Diferenciais

| Standard 2.0 | Premium 3.0 |
|--------------|-------------|
| ✅ Uso individual | ✅ Multi-instituição |
| ✅ Gestão de documentos | ✅ Gestão hierárquica completa |
| ✅ IndexedDB local | ✅ Multi-tenant isolado |
| ❌ Sem hierarquia organizacional | ✅ Organizações recursivas |
| ❌ Sem controle de acesso avançado | ✅ RBAC com 4 níveis |
| ❌ Sem auditoria | ✅ Auditoria completa |

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- npm 9+

### Instalação

```bash
# Clone o repositório
git clone https://github.com/carlosorvate-tech/Sisgead-3.0.git
cd Sisgead-3.0

# Instale dependências
npm install

# Inicie servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:5173**

### Primeiro Uso

1. **Escolha Premium 3.0** no seletor de versão
2. **Complete o wizard** de setup (4 etapas):
   - Criar usuário Master
   - Configurar instituição
   - Adicionar organizações (opcional)
   - Adicionar usuários (opcional)
3. **Acesse o dashboard** e comece a usar!

📖 **Guia completo:** [GUIA_TESTES_PREMIUM.md](GUIA_TESTES_PREMIUM.md)

---

## 🏗️ Arquitetura

### Hierarquia de Entidades

```
┌─────────────────────────────────────┐
│         INSTITUIÇÃO                 │
│  (ex: Secretaria de Educação)       │
└────────────┬────────────────────────┘
             │
        ┌────▼────┬──────────┬─────────┐
        │         │          │         │
   ┌────▼────┐ ┌──▼──────┐ ┌▼────────┐│
   │  ORG 1  │ │  ORG 2  │ │  ORG 3  ││
   │Ens.Fund │ │Ens.Médio│ │Ed.Infant││
   └────┬────┘ └─────────┘ └─────────┘│
        │                              │
   ┌────▼────┬─────────┐              │
   │ SUB-ORG │ SUB-ORG │              │
   │ Escola A│ EscolaB │              │
   └─────────┘─────────┘              │
                                       │
        ┌──────────────────────────────┘
        │
   ┌────▼────────────────────────┐
   │        USUÁRIOS              │
   │ Master | Org Admin | User    │
   └──────────────────────────────┘
```

### Níveis de Acesso (RBAC)

| Role | Nível | Permissões |
|------|-------|------------|
| 👑 **MASTER** | 4 | Gestão completa da instituição |
| 🔑 **ORG_ADMIN** | 3 | Gestão de sua organização e subordinadas |
| 👤 **USER** | 2 | Operação padrão dentro de suas organizações |
| 👁️ **VIEWER** | 1 | Apenas visualização |

### Stack Tecnológica

```typescript
Frontend:
  - React 18 + TypeScript 5
  - Tailwind CSS (styling)
  - Vite (build tool)

Persistência:
  - localStorage (multi-tenant isolation)
  - Estrutura: premium-{institutions|organizations|users}

Padrões:
  - Singleton (TenantManager, AuthService)
  - Repository (Data Services)
  - State Machine (Navigation Flow)
```

---

## 📂 Estrutura do Projeto

```
sisgead-3.0/
├── src/
│   ├── components/
│   │   └── premium/              # Componentes Premium isolados
│   │       ├── PremiumApp.tsx    # 🎯 Orquestrador principal
│   │       ├── VersionSelectorModal.tsx
│   │       ├── PremiumDashboard.tsx
│   │       └── SetupWizard/      # Wizard de configuração inicial
│   │           ├── SetupWizard.tsx
│   │           ├── Step1MasterUser.tsx
│   │           ├── Step2Institution.tsx
│   │           ├── Step3Organizations.tsx
│   │           ├── Step4Users.tsx
│   │           └── SetupComplete.tsx
│   ├── services/
│   │   └── premium/              # Serviços de negócio
│   │       ├── tenantManager.ts  # 🔐 Gestão de contexto multi-tenant
│   │       ├── authService.ts    # 🔑 Autenticação e sessão
│   │       ├── institutionService.ts
│   │       ├── organizationService.ts
│   │       ├── userService.ts
│   │       └── index.ts
│   └── types/
│       └── premium/              # Definições TypeScript
│           ├── institution.ts
│           ├── organization.ts
│           ├── user.ts
│           ├── audit.ts
│           └── index.ts
├── GUIA_TESTES_PREMIUM.md       # 📖 Manual de testes
├── MEMORIA_DESENVOLVIMENTO.md    # 📚 Gestão do conhecimento
└── README.md                     # Este arquivo
```

---

## 🔄 Fluxo de Uso

### State Machine

```
┌──────────────────┐
│ Version Selector │ ◄─── Primeiro acesso
└────────┬─────────┘
         │ Escolhe Premium
         ▼
┌──────────────────┐
│  Setup Wizard    │ ◄─── Configuração inicial (apenas 1x)
│  (4 etapas)      │
└────────┬─────────┘
         │ Completa setup
         ▼
┌──────────────────┐
│  Dashboard       │ ◄─── Uso contínuo
│  Premium         │
└──────────────────┘
         │
         ▼
    [Logout ou Troca de versão]
```

---

## 📊 Funcionalidades

### ✅ Implementado (v3.0-alpha)

- [x] **Seletor de Versão** - Escolha entre Standard 2.0 e Premium 3.0
- [x] **Wizard de Setup** - Configuração guiada em 4 etapas
- [x] **Multi-Tenancy** - Isolamento completo entre instituições
- [x] **Hierarquia Organizacional** - Organizações recursivas ilimitadas
- [x] **CRUD Completo** - Instituições, Organizações, Usuários
- [x] **RBAC** - 4 níveis de acesso com validação hierárquica
- [x] **Dashboard Básico** - Estatísticas e listagens
- [x] **Autenticação** - Sistema de login com sessão
- [x] **Auditoria** - Tracking de criação/modificação

### 🔄 Em Desenvolvimento (v3.0-beta)

- [ ] **Dashboards Específicos** - Institucional, Organizacional, Usuário
- [ ] **Edição de Entidades** - Modificar organizações e usuários
- [ ] **Permissões Granulares** - Controle fino de ações
- [ ] **Auditoria Visual** - Logs de ações em interface
- [ ] **Relatórios** - Consolidados por instituição/organização

### 🎯 Planejado (v3.0-stable)

- [ ] **Analytics** - Gráficos e indicadores
- [ ] **Exportação** - Excel, PDF, CSV
- [ ] **Importação em Lote** - Upload de CSV
- [ ] **Visualização em Árvore** - Hierarquia de organizações
- [ ] **Notificações** - Sistema de alertas
- [ ] **API REST** - Integrações externas
- [ ] **SSO** - Single Sign-On

---

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários (quando implementado)
npm run test

# Testes E2E (quando implementado)
npm run test:e2e

# Coverage
npm run test:coverage
```

### Testes Manuais

Siga o guia completo: **[GUIA_TESTES_PREMIUM.md](GUIA_TESTES_PREMIUM.md)**

Fluxos cobertos:
- ✅ Setup completo do zero
- ✅ Dashboard e navegação
- ✅ Troca entre versões
- ✅ Validações de formulário
- ✅ Persistência de dados

---

## 🛠️ Desenvolvimento

### Comandos Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linter
npm run type-check   # Verificação TypeScript
```

### Convenções de Código

```typescript
// ✅ Boas Práticas
- Usar enums ao invés de strings literais
- Sempre validar no serviço (não apenas no componente)
- Type annotations explícitas em operações complexas
- Nomenclatura: PascalCase (componentes), camelCase (funções/vars)
- Imports organizados: types → services → components

// ❌ Evitar
- Validação apenas no frontend
- Any types
- Lógica de negócio em componentes
- Mutação direta de estado
```

📖 **Guia completo:** [MEMORIA_DESENVOLVIMENTO.md](MEMORIA_DESENVOLVIMENTO.md)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Convenções de Commit

```
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
refactor: Refatoração de código
test:     Testes
chore:    Tarefas gerais
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

- 🐛 **Bugs:** [GitHub Issues](https://github.com/carlosorvate-tech/Sisgead-3.0/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/carlosorvate-tech/Sisgead-3.0/discussions)
- 📧 **Email:** suporte@sisgead.com.br

---

## 🙏 Agradecimentos

- Comunidade React/TypeScript
- Equipe de desenvolvimento SISGEAD
- Beta testers que contribuíram com feedback

---

## 📈 Status do Projeto

```
┌─────────────────────────────────┐
│ SISGEAD Premium 3.0 - v3.0-alpha│
├─────────────────────────────────┤
│ Fundação         ████████ 100%  │
│ Setup/CRUD       ████████ 100%  │
│ Dashboard        ████████ 100%  │
│ Testes           ████████ 100%  │
│ Funcionalidades  ████░░░░  50%  │
│ Documentação     ████████ 100%  │
└─────────────────────────────────┘
Status Geral: ✅ Pronto para testes externos
```

---

**Desenvolvido com ❤️ e inteligência pela equipe INFINITUS Sistemas Inteligentes**

*Transformando gestão educacional através da tecnologia*

🌟 **[Star no GitHub](https://github.com/carlosorvate-tech/Sisgead-3.0)** se este projeto foi útil!
