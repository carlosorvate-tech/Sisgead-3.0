# PROPOSTA INTEGRAÇÃO SISGEAD 2.0 + 3.0 - PARTE 2: ESTRUTURA DE DADOS

**Data:** 06/11/2025  
**Status:** 📋 AGUARDANDO APROVAÇÃO  

---

## 📊 TIPOS TYPESCRIPT

### 1. TeamMember (Membro da Equipe)

```typescript
interface TeamMember {
  // Identificação
  id: string;
  institutionId: string;
  organizationId: string;
  
  // Dados pessoais
  profile: {
    name: string;
    cpf: string;              // Único na instituição
    email?: string;
    phone?: string;
    birthDate?: string;
  };
  
  // Vínculo
  employment: {
    registrationNumber: string;  // Matrícula
    role: string;                // Cargo
    department?: string;
    admissionDate: string;
    currentStatus: 'active' | 'on_leave' | 'transferred' | 'dismissed';
  };
  
  // Avaliações SISGEAD 2.0
  assessments: {
    totalAssessments: number;
    averageScore?: number;
    lastAssessmentDate?: string;
  };
  
  // Controle
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  
  // Pendências
  pendingTransfer?: PendingTransfer;
  pendingDismissal?: PendingDismissal;
}
```

### 2. PendingTransfer (Transferência Pendente)

```typescript
interface PendingTransfer {
  id: string;
  memberId: string;
  fromOrganizationId: string;
  toOrganizationId: string;
  
  // Solicitação
  requestedBy: string;      // User ID
  requestedAt: string;
  reason: string;
  effectiveDate: string;
  
  // Aprovação Master
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}
```

### 3. PendingDismissal (Desligamento Pendente)

```typescript
interface PendingDismissal {
  id: string;
  memberId: string;
  organizationId: string;
  
  // Solicitação
  requestedBy: string;
  requestedAt: string;
  reason: string;
  dismissalType: 'resignation' | 'termination' | 'retirement';
  effectiveDate: string;
  
  // Aprovação Master
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}
```

### 4. OrganizationTeamStats (Estatísticas)

```typescript
interface OrganizationTeamStats {
  organizationId: string;
  totalMembers: number;
  activeMembers: number;
  onLeaveMembers: number;
  
  // Avaliações
  assessmentStats: {
    totalAssessments: number;
    averageScore: number;
  };
  
  // Pendências
  pendingTransfersIn: number;
  pendingTransfersOut: number;
  pendingDismissals: number;
  
  lastUpdated: string;
}
```

---

## 💾 STORAGE (localStorage)

### Chaves Multi-Tenant

```typescript
// Membros por organização (segregado)
`premium-team-members-${organizationId}`

// Transferências da instituição (global)
`premium-pending-transfers-${institutionId}`

// Desligamentos da instituição (global)
`premium-pending-dismissals-${institutionId}`

// Consolidação (cache master)
`premium-consolidation-${institutionId}`
```

### Exemplo de Dados

```json
// premium-team-members-org_123
[
  {
    "id": "member_001",
    "institutionId": "inst_001",
    "organizationId": "org_123",
    "profile": {
      "name": "João Silva",
      "cpf": "123.456.789-00"
    },
    "employment": {
      "role": "Analista",
      "status": "active"
    },
    "assessments": {
      "totalAssessments": 5,
      "averageScore": 8.5
    }
  }
]
```

---

## ✅ APROVAÇÃO NECESSÁRIA

**Estes tipos estão adequados?**
- [ ] Sim, tipos completos
- [ ] Falta algum campo (especificar)
- [ ] Precisa ajustes (especificar)

**Próximo:** PARTE 3 - Serviços e Métodos

---

*INFINITUS Sistemas Inteligentes*
