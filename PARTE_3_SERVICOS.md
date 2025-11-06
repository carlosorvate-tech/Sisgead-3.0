# PROPOSTA INTEGRAÇÃO SISGEAD 2.0 + 3.0 - PARTE 3: SERVIÇOS

**Data:** 06/11/2025  
**Status:** 📋 AGUARDANDO APROVAÇÃO  

---

## 🔧 TEAMSERVICE (Gestão de Equipes)

### Métodos Principais

```typescript
class TeamService {
  // CRUD Básico
  async createMember(data: CreateTeamMemberData): Promise<TeamMember>
  async getMemberById(memberId: string): Promise<TeamMember | null>
  async updateMember(memberId: string, data: UpdateTeamMemberData): Promise<TeamMember>
  async deleteMember(memberId: string): Promise<void>
  
  // Listagem
  async listMembers(filters: {
    institutionId?: string;
    organizationId?: string;
    status?: 'active' | 'on_leave' | 'transferred' | 'dismissed';
  }): Promise<TeamMember[]>
  
  // Transferências
  async requestTransfer(data: {
    memberId: string;
    toOrganizationId: string;
    reason: string;
    effectiveDate: string;
  }): Promise<PendingTransfer>
  
  async approveTransfer(transferId: string, notes?: string): Promise<void>
  async rejectTransfer(transferId: string, notes: string): Promise<void>
  
  // Desligamentos
  async requestDismissal(data: {
    memberId: string;
    reason: string;
    dismissalType: string;
    effectiveDate: string;
  }): Promise<PendingDismissal>
  
  async approveDismissal(dismissalId: string, notes?: string): Promise<void>
  async rejectDismissal(dismissalId: string, notes: string): Promise<void>
}
```

---

## 📊 CONSOLIDATIONSERVICE (Consolidação)

### Métodos Principais

```typescript
class ConsolidationService {
  // Dashboard Master
  async getInstitutionDashboard(institutionId: string): Promise<{
    totalMembers: number;
    totalOrganizations: number;
    organizationBreakdown: Array<{
      organization: Organization;
      stats: OrganizationTeamStats;
    }>;
    pendingApprovals: {
      transfers: PendingTransfer[];
      dismissals: PendingDismissal[];
    };
  }>
  
  // Relatórios
  async generateReport(
    institutionId: string,
    type: 'headcount' | 'transfers' | 'assessments'
  ): Promise<Report>
  
  // Auditoria
  async getAuditTrail(filters: {
    institutionId: string;
    organizationId?: string;
    dateRange?: { start: string; end: string };
  }): Promise<AuditLog[]>
}
```

---

## 🔄 FLUXO DE APROVAÇÃO

### Transferência

```
1. Org_Admin solicita
   → teamService.requestTransfer()
   → PendingTransfer criado
   → Status: 'pending'

2. Master vê na aba Consolidação
   → consolidationService.getInstitutionDashboard()
   → Lista de pendências

3. Master aprova
   → teamService.approveTransfer(transferId)
   → Membro.organizationId atualizado
   → Status: 'approved'
   → Stats atualizadas

OU

3. Master rejeita
   → teamService.rejectTransfer(transferId, notes)
   → Status: 'rejected'
   → Membro permanece na org original
```

### Desligamento

```
1. Org_Admin solicita
   → teamService.requestDismissal()
   → PendingDismissal criado

2. Master aprova
   → teamService.approveDismissal(dismissalId)
   → Membro.status = 'dismissed'
   → Stats atualizadas

OU

2. Master rejeita
   → teamService.rejectDismissal(dismissalId, notes)
   → Membro permanece ativo
```

---

## ✅ APROVAÇÃO NECESSÁRIA

**Estes serviços atendem?**
- [ ] Sim, métodos completos
- [ ] Falta algum método (especificar)
- [ ] Precisa ajustes (especificar)

**Próximo:** PARTE 4 - Interface de Usuário

---

*INFINITUS Sistemas Inteligentes*
