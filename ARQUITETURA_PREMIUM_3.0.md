# 🏢 ARQUITETURA PREMIUM 3.0 - SISGEAD
## Sistema Multi-Tenant Institucional

**Data de Criação:** 5 de novembro de 2025  
**Versão Target:** v3.0.0-premium  
**Branch:** main-3.0-premium  
**Status:** 🚧 **EM DESENVOLVIMENTO**

---

## 🎯 VISÃO GERAL

### Proposta de Valor
O SISGEAD Premium 3.0 oferece uma experiência **progressiva e não invasiva**:
- ✅ Usuários podem **testar a versão Standard 2.0** antes de migrar
- ✅ Migração para Premium é **opcional e reversível**
- ✅ Setup institucional **guiado e intuitivo**
- ✅ Hierarquia multi-tenant completa

---

## 🔄 FLUXO DE EXPERIÊNCIA DO USUÁRIO

### 1️⃣ **Ponto de Entrada - Modal de Seleção**

```
┌─────────────────────────────────────────────┐
│     SISGEAD - Escolha sua Experiência       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────┐   ┌──────────────────┐  │
│  │  📊 STANDARD  │   │  🏢 PREMIUM 3.0  │  │
│  │               │   │                  │  │
│  │  • Individual │   │  • Institucional │  │
│  │  • Simples    │   │  • Multi-tenant  │  │
│  │  • Rápido     │   │  • Avançado      │  │
│  │               │   │                  │  │
│  │  [Continuar]  │   │  [Configurar]    │  │
│  └───────────────┘   └──────────────────┘  │
│                                             │
│  💡 Você pode alternar entre versões        │
│     a qualquer momento                      │
└─────────────────────────────────────────────┘
```

**Quando Aparece:**
- ✅ Imediatamente após login administrativo
- ✅ Antes de entrar no painel de análise
- ✅ Destaque visual para nova funcionalidade
- ✅ Pode ser reaberto em Configurações > Versão

---

### 2️⃣ **Wizard de Setup Institucional**

#### **Etapa 1: Criação do Usuário Master**

```typescript
interface MasterUserSetup {
  name: string;              // Nome completo
  cpf: string;               // CPF validado
  email: string;             // Email institucional
  phone?: string;            // Telefone (opcional)
  password: string;          // Senha forte
  passwordConfirm: string;   // Confirmação
}
```

**Validações:**
- ✅ CPF válido e único
- ✅ Email corporativo
- ✅ Senha mínimo 8 caracteres (maiúscula, minúscula, número, especial)
- ✅ Termos de uso e LGPD aceitos

---

#### **Etapa 2: Dados da Instituição**

```typescript
interface InstitutionSetup {
  id: string;                    // UUID gerado
  name: string;                  // Nome da instituição
  cnpj?: string;                 // CNPJ (opcional)
  type: 'public' | 'private' | 'ngo' | 'educational';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  settings: {
    maxOrganizations: number;    // Limite de organizações
    maxUsersPerOrg: number;      // Limite de usuários por org
    features: string[];          // Features ativas
  };
  createdAt: string;
  createdBy: string;             // ID do Master User
}
```

**Campos:**
- 📝 Nome da Instituição (obrigatório)
- 📝 CNPJ (opcional, mas recomendado)
- 📝 Tipo de Instituição (dropdown)
- 📝 Endereço completo (opcional)
- ⚙️ Configurações iniciais (limites padrão sugeridos)

---

#### **Etapa 3: Criação de Organizações Subordinadas**

```typescript
interface Organization {
  id: string;                    // UUID
  institutionId: string;         // ID da instituição pai
  name: string;                  // Nome da organização
  code?: string;                 // Código interno
  description?: string;
  parentOrgId?: string;          // Para hierarquia de org
  settings: {
    maxUsers: number;
    allowedFeatures: string[];
  };
  createdAt: string;
  createdBy: string;
}
```

**Funcionalidades:**
- ➕ Adicionar múltiplas organizações
- 🗂️ Hierarquia de organizações (org pai → org filha)
- ✏️ Editar/remover organizações
- 📊 Preview da estrutura hierárquica

**Exemplo Prático:**
```
Instituição: Prefeitura de São Paulo
├── Organização: Secretaria de Educação
│   ├── Sub-org: Escolas Zona Norte
│   └── Sub-org: Escolas Zona Sul
├── Organização: Secretaria de Saúde
│   ├── Sub-org: Hospitais
│   └── Sub-org: UBS
└── Organização: Secretaria de Obras
```

---

#### **Etapa 4: Criação de Usuários e Privilégios**

```typescript
interface User {
  id: string;
  institutionId: string;
  organizationIds: string[];     // Pode pertencer a múltiplas orgs
  name: string;
  cpf: string;
  email: string;
  role: UserRole;
  privileges: UserPrivileges;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

enum UserRole {
  MASTER = 'master',                    // Acesso total - organiza as verticais
  ORG_ADMIN = 'org_admin',              // Admin da organização - gestão completa
  USER = 'user',                        // Usuário padrão
  VIEWER = 'viewer'                     // Apenas visualização
}

interface UserPrivileges {
  // Privilégios Institucionais (apenas MASTER)
  institutional: {
    manageOrganizations: boolean;
    manageUsers: boolean;
    viewAllReports: boolean;
    exportInstitutionalData: boolean;
    manageSettings: boolean;
  };
  
  // Privilégios Organizacionais (MASTER e ORG_ADMIN)
  organizational: {
    manageOrgUsers: boolean;
    createAssessments: boolean;        // Enviar questionários
    viewOrgReports: boolean;           // Receber dados
    exportOrgData: boolean;            // Gerar equipes
    manageOrgSettings: boolean;        // Decisões executivas
  };
  
  // Privilégios de Usuário (todos)
  user: {
    viewOwnAssessments: boolean;
    respondAssessments: boolean;
    viewOwnReports: boolean;
  };
}
```

**Interface de Criação:**
```
┌─────────────────────────────────────────────┐
│  Adicionar Novo Usuário                     │
├─────────────────────────────────────────────┤
│  Nome: [________________]                   │
│  CPF:  [_______________]                    │
│  Email: [_______________]                   │
│                                             │
│  Função:                                    │
│  ( ) Master (acesso total - organiza tudo)  │
│  (•) Admin Organizacional (gestão completa) │
│  ( ) Usuário (responder avaliações)         │
│  ( ) Visualizador (apenas leitura)          │
│                                             │
│  Organizações:                              │
│  [x] Secretaria de Educação                 │
│  [x] Escolas Zona Norte                     │
│  [ ] Secretaria de Saúde                    │
│                                             │
│  Privilégios do Org Admin:                  │
│  ┌─────────────────────────────────┐        │
│  │ ☑ Gerenciar usuários da org     │        │
│  │ ☑ Criar/enviar avaliações       │        │
│  │ ☑ Ver relatórios da org         │        │
│  │ ☑ Exportar dados da org         │        │
│  │ ☑ Gerar equipes                 │        │
│  │ ☑ Tomar decisões executivas     │        │
│  └─────────────────────────────────┘        │
│                                             │
│  [Cancelar]  [Adicionar Usuário]            │
└─────────────────────────────────────────────┘
```

---

### 3️⃣ **Dashboard Adaptativo Baseado em Privilégios**

#### **View: Master User**
```
┌─────────────────────────────────────────────────────────┐
│  SISGEAD Premium 3.0 - Painel Institucional             │
│  👤 Carlos Orvate (Master) | 🏢 Prefeitura de São Paulo │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Visão Institucional                                 │
│  ├─ 5 Organizações ativas                               │
│  ├─ 127 Usuários totais                                 │
│  ├─ 1.243 Avaliações realizadas                         │
│  └─ 89% Taxa de completude                              │
│                                                         │
│  🏢 Organizações                                         │
│  [Gerenciar Organizações]  [+ Nova Organização]         │
│                                                         │
│  👥 Usuários                                             │
│  [Gerenciar Usuários]  [+ Novo Usuário]                 │
│                                                         │
│  📈 Relatórios Consolidados                             │
│  [Relatório Institucional]  [Exportar Dados]            │
│                                                         │
│  ⚙️ Configurações Globais                                │
│  [Configurações da Instituição]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **View: Org Admin**
```
┌─────────────────────────────────────────────────────────┐
│  SISGEAD Premium 3.0 - Secretaria de Educação           │
│  👤 Maria Silva (Org Admin) | 🏢 Secretaria Educação    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Visão da Organização                                │
│  ├─ 45 Usuários ativos                                  │
│  ├─ 327 Avaliações realizadas                           │
│  └─ 92% Taxa de completude                              │
│                                                         │
│  👥 Usuários da Organização                             │
│  [Gerenciar Usuários]  [+ Novo Usuário]                 │
│                                                         │
│  📝 Avaliações                                           │
│  [Nova Avaliação]  [Enviar Questionários]               │
│  [Ver Avaliações]  [Receber Dados]                      │
│                                                         │
│  � Gestão de Equipes                                   │
│  [Gerar Equipes]  [Ver Interações]                      │
│                                                         │
│  �📊 Relatórios e Análises                               │
│  [Relatório Consolidado]  [Análises Executivas]         │
│  [Exportar Dados]                                       │
│                                                         │
│  ⚙️ Configurações                                        │
│  [Configurações da Organização]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **View: Usuário Padrão**
```
┌─────────────────────────────────────────────────────────┐
│  SISGEAD Premium 3.0 - Meu Painel                       │
│  👤 João Santos (Usuário)                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📋 Minhas Avaliações                                   │
│  ├─ 3 Pendentes                                         │
│  ├─ 12 Concluídas                                       │
│  └─ Última: há 2 dias                                   │
│                                                         │
│  ✏️ Responder Avaliações                                │
│  [Ver Avaliações Pendentes]                             │
│                                                         │
│  📊 Meus Resultados                                     │
│  [Ver Meus Relatórios]                                  │
│                                                         │
│  ⚙️ Meu Perfil                                           │
│  [Editar Perfil]  [Alterar Senha]                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ ARQUITETURA TÉCNICA

### **Estrutura de Dados**

```typescript
// Modelo de dados hierárquico
Database {
  institutions: {
    [institutionId]: Institution
  },
  
  organizations: {
    [organizationId]: Organization
  },
  
  users: {
    [userId]: User
  },
  
  assessments: {
    [assessmentId]: Assessment & {
      institutionId: string;
      organizationId: string;
      createdBy: string;
    }
  },
  
  auditLog: {
    [logId]: AuditEntry
  }
}
```

### **Isolamento de Dados**

```typescript
// TenantManager - Garante isolamento
class TenantManager {
  private currentUser: User;
  private currentInstitution: Institution;
  
  // Filtra dados baseado no contexto do usuário
  filterByTenant<T>(data: T[], userId: string): T[] {
    const user = this.getUser(userId);
    
    switch (user.role) {
      case UserRole.MASTER:
        // Acesso total à instituição
        return data.filter(item => 
          item.institutionId === user.institutionId
        );
        
      case UserRole.ORG_ADMIN:
        // Acesso apenas à sua organização
        return data.filter(item =>
          user.organizationIds.includes(item.organizationId)
        );
        
      case UserRole.USER:
        // Acesso apenas aos próprios dados
        return data.filter(item =>
          item.createdBy === userId || item.assignedTo === userId
        );
        
      default:
        return [];
    }
  }
  
  // Valida permissão de ação
  canPerformAction(
    userId: string, 
    action: string, 
    resource: string
  ): boolean {
    const user = this.getUser(userId);
    const privilege = this.getPrivilege(user, action, resource);
    return privilege?.allowed ?? false;
  }
}
```

### **Sistema de Autenticação**

```typescript
// AuthService - Gerencia login e sessões
class AuthService {
  async login(cpf: string, password: string): Promise<AuthResult> {
    // 1. Validar credenciais
    const user = await this.validateCredentials(cpf, password);
    
    // 2. Carregar contexto institucional
    const institution = await this.loadInstitution(user.institutionId);
    const organizations = await this.loadOrganizations(user.organizationIds);
    
    // 3. Criar sessão
    const session = {
      user,
      institution,
      organizations,
      privileges: user.privileges,
      token: this.generateToken(user),
      expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 horas
    };
    
    // 4. Salvar sessão
    await this.saveSession(session);
    
    return { success: true, session };
  }
  
  async checkVersionPreference(userId: string): Promise<Version> {
    const preference = localStorage.getItem(`user-${userId}-version`);
    return preference === 'premium' ? 'premium' : 'standard';
  }
}
```

---

## 🎨 COMPONENTES A IMPLEMENTAR

### **Novos Componentes**

```
/components/
├── premium/
│   ├── VersionSelectorModal.tsx       # Modal inicial de seleção
│   ├── SetupWizard/
│   │   ├── SetupWizard.tsx            # Orquestrador do wizard
│   │   ├── Step1MasterUser.tsx        # Criação usuário master
│   │   ├── Step2Institution.tsx       # Dados institucionais
│   │   ├── Step3Organizations.tsx     # Criação de organizações
│   │   ├── Step4Users.tsx             # Usuários e privilégios
│   │   └── SetupComplete.tsx          # Tela de conclusão
│   ├── InstitutionalDashboard.tsx     # Dashboard master
│   ├── OrganizationDashboard.tsx      # Dashboard org admin
│   ├── UserDashboard.tsx              # Dashboard usuário padrão
│   ├── OrganizationManager.tsx        # CRUD organizações
│   ├── UserManager.tsx                # CRUD usuários
│   ├── PrivilegeEditor.tsx            # Editor de privilégios
│   └── InstitutionalReports.tsx       # Relatórios consolidados
```

### **Serviços**

```
/services/
├── premium/
│   ├── tenantManager.ts               # Isolamento de dados
│   ├── authService.ts                 # Autenticação multi-tenant
│   ├── institutionService.ts          # CRUD instituições
│   ├── organizationService.ts         # CRUD organizações
│   ├── userService.ts                 # CRUD usuários
│   ├── privilegeService.ts            # Gestão de privilégios
│   └── auditService.ts                # Logs de auditoria
```

### **Types**

```
/types/
├── premium/
│   ├── institution.ts                 # Interfaces institucionais
│   ├── organization.ts                # Interfaces organizacionais
│   ├── user.ts                        # Interfaces de usuário
│   ├── privilege.ts                   # Interfaces de privilégios
│   └── audit.ts                       # Interfaces de auditoria
```

---

## 📊 CRONOGRAMA DE IMPLEMENTAÇÃO

### **Fase 1: Fundação (8-10 horas)**
- [ ] Criar types e interfaces
- [ ] Implementar TenantManager
- [ ] Implementar AuthService básico
- [ ] Criar estrutura de storage multi-tenant

### **Fase 2: Setup Flow (10-12 horas)**
- [ ] VersionSelectorModal
- [ ] Setup Wizard completo (4 etapas)
- [ ] Validações e feedback
- [ ] Persistência de configuração

### **Fase 3: Dashboards (12-15 horas)**
- [ ] Dashboard Master (institucional)
- [ ] Dashboard Org Admin
- [ ] Dashboard User
- [ ] Sistema de roteamento baseado em role

### **Fase 4: Gestão (10-12 horas)**
- [ ] OrganizationManager (CRUD)
- [ ] UserManager (CRUD)
- [ ] PrivilegeEditor
- [ ] Sistema de auditoria

### **Fase 5: Testes e Deploy (8-10 horas)**
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes E2E do fluxo completo
- [ ] Deploy GitHub Pages

**Total Estimado: 48-59 horas (~1.5-2 semanas)**

---

## 🔒 SEGURANÇA E COMPLIANCE

### **Princípios de Segurança**

1. **Isolamento Total de Dados**
   - Cada instituição tem dados completamente isolados
   - Queries sempre filtradas por institutionId
   - Impossível acessar dados de outra instituição

2. **Controle de Acesso Granular**
   - RBAC (Role-Based Access Control)
   - Privilégios validados em todas as ações
   - Logs de auditoria completos

3. **Autenticação Robusta**
   - Senhas hasheadas (bcrypt)
   - Tokens JWT com expiração
   - Sessões seguras

4. **LGPD Compliance**
   - Consentimento explícito
   - Direito de exclusão de dados
   - Portabilidade de dados
   - Logs de acesso

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. ✅ **Documentação criada** (este arquivo)
2. ⏳ Criar interfaces TypeScript
3. ⏳ Implementar TenantManager
4. ⏳ Criar VersionSelectorModal
5. ⏳ Implementar Setup Wizard

---

**Desenvolvido para democratizar gestão de desempenho institucional**  
**© 2025 SISGEAD Premium 3.0**
