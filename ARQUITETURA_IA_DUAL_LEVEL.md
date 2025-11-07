# Arquitetura IA Dual-Level - SISGEAD Suite Híbrida

**Data**: 06/11/2025  
**Objetivo**: Integrar IA Institucional (v3.0) + IA Organizacional (v2.0) em sistema único

---

## 🏗️ Arquitetura Proposta

### **1. Dois Níveis de Inteligência**

```
┌─────────────────────────────────────────────────────────────┐
│                   NÍVEL INSTITUCIONAL (v3.0)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🏛️ IA Master - Visão Consolidada                     │  │
│  │  • Dados: TODAS as organizações                       │  │
│  │  • Usuários: Master                                   │  │
│  │  • Insights: Cross-org, benchmarking, estratégico    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  👔 IA Gestores - Contexto Institucional             │  │
│  │  • Dados: Organizações que administram               │  │
│  │  • Usuários: OrgAdmins                               │  │
│  │  • Insights: Multi-org, comparações, melhores práticas│ │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ⬇️
┌─────────────────────────────────────────────────────────────┐
│              NÍVEL ORGANIZACIONAL (v2.0 Embedded)           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🏢 Organização A - SISGEAD Standard                  │  │
│  │  • IA própria: Apenas dados da org A                 │  │
│  │  • OrgAdmin A: Gestão completa do efetivo           │  │
│  │  • Funcionalidades v2.0: DISC, Teams, Portfolios    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🏢 Organização B - SISGEAD Standard                  │  │
│  │  • IA própria: Apenas dados da org B                 │  │
│  │  • OrgAdmin B: Gestão completa do efetivo           │  │
│  │  • Funcionalidades v2.0: DISC, Teams, Portfolios    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementação Técnica

### **1. Ao Criar Organização**

```typescript
// organizationService.create()
async create(data: CreateOrganizationData) {
  // 1. Criar organização no storage Premium
  const org = await storage.save('organizations', newOrg);
  
  // 2. Inicializar workspace v2.0 para a organização
  await initializeV2Workspace(org.id);
  
  // 3. Criar contexto isolado de dados
  const workspace = {
    organizationId: org.id,
    auditLog: [],
    proposalLog: [],
    teams: [],
    assessments: []
  };
  
  await storage.save('v2-workspaces', workspace);
  
  return org;
}
```

### **2. Componente Organizacional**

```typescript
// components/premium/OrganizationDashboard.tsx
export const OrganizationDashboard = ({ organization }) => {
  const [activeView, setActiveView] = useState<'premium' | 'standard'>('premium');
  
  return (
    <div>
      {/* Toggle entre Premium e Standard */}
      <ViewSelector 
        current={activeView}
        onChange={setActiveView}
      />
      
      {activeView === 'premium' ? (
        <PremiumOrgView organization={organization} />
      ) : (
        <StandardV2Dashboard 
          organizationId={organization.id}
          isolated={true}  // Dados isolados
        />
      )}
    </div>
  );
};
```

### **3. IA com Contexto Dual**

```typescript
// services/premium/aiService.ts
export class DualLevelAIService {
  
  // IA Institucional - Acesso total
  async queryInstitutional(user: User, question: string) {
    if (user.role !== UserRole.MASTER && user.role !== UserRole.ORG_ADMIN) {
      throw new Error('Acesso negado');
    }
    
    // Buscar TODOS os dados institucionais
    const allOrgs = await organizationService.list({ institutionId: user.institutionId });
    const allUsers = await userService.list({ institutionId: user.institutionId });
    
    // Consolidar dados de todos os workspaces v2.0
    const allWorkspaces = await Promise.all(
      allOrgs.map(org => this.loadV2Workspace(org.id))
    );
    
    const context = {
      institution: user.institutionId,
      organizations: allOrgs,
      users: allUsers,
      assessments: allWorkspaces.flatMap(w => w.assessments),
      teams: allWorkspaces.flatMap(w => w.teams),
      proposals: allWorkspaces.flatMap(w => w.proposalLog)
    };
    
    return await geminiService.queryWithContext(question, context);
  }
  
  // IA Organizacional - Escopo limitado
  async queryOrganizational(user: User, orgId: string, question: string) {
    // Verificar se usuário tem acesso à organização
    if (!user.organizationIds.includes(orgId)) {
      throw new Error('Acesso negado a esta organização');
    }
    
    // Buscar APENAS dados da organização
    const workspace = await this.loadV2Workspace(orgId);
    
    const context = {
      organization: orgId,
      assessments: workspace.assessments,
      teams: workspace.teams,
      proposals: workspace.proposalLog
    };
    
    return await geminiService.queryWithContext(question, context);
  }
  
  private async loadV2Workspace(orgId: string) {
    return await storage.get('v2-workspaces', orgId);
  }
}
```

---

## 📊 Estrutura de Dados

### **Premium Storage (v3.0)**
```
institutions/
  └─ inst-001/
       ├─ settings
       └─ metadata

organizations/
  ├─ org-001/
  │    ├─ name, description, status
  │    └─ v2WorkspaceId -> "v2-ws-001"
  └─ org-002/
       ├─ name, description, status
       └─ v2WorkspaceId -> "v2-ws-002"

users/
  ├─ user-001/ (Master)
  │    ├─ institutionId: inst-001
  │    └─ organizationIds: [org-001, org-002]
  └─ user-002/ (OrgAdmin)
       ├─ institutionId: inst-001
       └─ organizationIds: [org-001]
```

### **v2.0 Workspaces (Isolated)**
```
v2-workspaces/
  ├─ org-001/
  │    ├─ auditLog[]         # Histórico de avaliações
  │    ├─ proposalLog[]      # Propostas de times
  │    ├─ teams[]            # Composições de equipes
  │    └─ assessments[]      # Avaliações DISC
  └─ org-002/
       ├─ auditLog[]
       ├─ proposalLog[]
       ├─ teams[]
       └─ assessments[]
```

---

## 🎨 Interface do Usuário

### **Master Dashboard**
```
┌─────────────────────────────────────────┐
│  SISGEAD Premium - Master Dashboard     │
├─────────────────────────────────────────┤
│  Visão Geral | Organizações | Usuários  │
├─────────────────────────────────────────┤
│                                         │
│  📊 Consolidação Institucional          │
│  • Total: 15 organizações               │
│  • 450 colaboradores                    │
│  • 1.200 avaliações DISC                │
│                                         │
│  🏢 Organizações:                       │
│  ┌───────────────────────────────────┐  │
│  │ Recursos Humanos (120 pessoas)   │  │
│  │ [Ver Detalhes] [Acessar SISGEAD] │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Tecnologia (80 pessoas)           │  │
│  │ [Ver Detalhes] [Acessar SISGEAD] │  │
│  └───────────────────────────────────┘  │
│                                         │
│          [🤖 IA Institucional]          │
└─────────────────────────────────────────┘
```

### **OrgAdmin Dashboard**
```
┌─────────────────────────────────────────┐
│  Organização: Recursos Humanos          │
├─────────────────────────────────────────┤
│  [Premium] | [SISGEAD Standard]         │
├─────────────────────────────────────────┤
│                                         │
│  📊 Efetivo da Organização              │
│  • 120 colaboradores                    │
│  • 45 avaliações pendentes              │
│                                         │
│  👥 Equipes Formadas: 8                 │
│  📈 Relatórios: 12 gerados              │
│                                         │
│  [Novo Questionário]                    │
│  [Formar Equipe]                        │
│  [Relatório de Desempenho]              │
│                                         │
│     [🤖 IA Organizacional]              │
└─────────────────────────────────────────┘
```

---

## 🚀 Fluxo de Criação de Organização

### **Antes (v3.0 atual)**
```javascript
createOrganization() {
  // 1. Criar registro
  // 2. Salvar no storage
  // ❌ Não tem workspace v2.0
}
```

### **Depois (v3.0 + v2.0 Embedded)**
```javascript
async createOrganization(data) {
  // 1. Criar organização Premium
  const org = await organizationService.create(data);
  
  // 2. Inicializar workspace v2.0
  const workspace = {
    organizationId: org.id,
    auditLog: [],
    proposalLog: [],
    teams: [],
    assessments: [],
    createdAt: new Date(),
    settings: {
      allowPublicSharing: false,
      requireManagerApproval: org.settings.requireAssessmentApproval
    }
  };
  
  await storage.save('v2-workspaces', org.id, workspace);
  
  // 3. Criar usuário admin padrão no v2.0
  await initializeV2AdminUser(org.id, creatorUserId);
  
  return org;
}
```

---

## 🎯 Benefícios da Arquitetura

### **1. Isolamento de Dados**
- ✅ Cada organização tem workspace próprio
- ✅ Privacidade entre organizações
- ✅ Conformidade LGPD

### **2. IA Multi-Nível**
- ✅ Master: Visão estratégica consolidada
- ✅ OrgAdmin: Contexto institucional + gestão tática
- ✅ User: Apenas seus dados pessoais

### **3. Reuso de Código**
- ✅ 100% do v2.0 aproveitado
- ✅ Sem reescrever funcionalidades maduras
- ✅ Manutenção centralizada

### **4. Escalabilidade**
- ✅ Cada org cresce independentemente
- ✅ Performance isolada por workspace
- ✅ Fácil migração de dados

---

## 📝 Próximos Passos

1. ✅ **Modificar CreateOrganizationModal** - Adicionar inicialização v2.0
2. ✅ **Criar OrganizationWorkspaceService** - Gerenciar workspaces v2.0
3. ✅ **Criar DualLevelAIService** - IA com contexto dual
4. ✅ **Criar OrganizationDashboard** - Toggle Premium/Standard
5. ✅ **Atualizar MasterDashboard** - Botão "Acessar SISGEAD" por org
6. ✅ **Integrar geminiService** - Adaptar para contexto multi-tenant

---

**Quer que eu implemente essa arquitetura agora?** 🚀
