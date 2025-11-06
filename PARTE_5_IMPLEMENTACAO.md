# PROPOSTA INTEGRAÇÃO SISGEAD 2.0 + 3.0 - PARTE 5: IMPLEMENTAÇÃO

**Data:** 06/11/2025  
**Status:** 📋 AGUARDANDO APROVAÇÃO  

---

## 🚀 ROADMAP

### SPRINT 1: Tipos e Serviços Base (2 dias)
- [ ] Criar `types/premium/team.ts`
- [ ] Criar `types/premium/consolidation.ts`
- [ ] Criar `services/premium/teamService.ts`
- [ ] Criar `services/premium/consolidationService.ts`
- [ ] Testes unitários

### SPRINT 2: Interface Org_Admin (3 dias)
- [ ] Aba "Gerenciar Equipes"
- [ ] TeamMembersList.tsx
- [ ] CreateMemberModal.tsx
- [ ] EditMemberModal.tsx
- [ ] TransferRequestModal.tsx
- [ ] DismissalRequestModal.tsx

### SPRINT 3: Interface Master (3 dias)
- [ ] Aba "Consolidação" no MasterDashboard
- [ ] InstitutionDashboard.tsx
- [ ] OrganizationBreakdown.tsx
- [ ] TransferApprovalCard.tsx
- [ ] DismissalApprovalCard.tsx
- [ ] ConsolidatedReports.tsx

### SPRINT 4: Integração SISGEAD 2.0 (2 dias)
- [ ] Bridge de dados 2.0 → 3.0
- [ ] Sincronização de avaliações
- [ ] Botão contextual "Acessar SISGEAD 2.0"

### SPRINT 5: Testes (2 dias)
- [ ] Testes de segregação de dados
- [ ] Testes de aprovação/rejeição
- [ ] Testes de fluxo completo
- [ ] Performance

### SPRINT 6: Deploy (1 dia)
- [ ] Build de produção
- [ ] Deploy GitHub Pages
- [ ] Documentação

**Total:** 13 dias úteis

---

## 📁 ESTRUTURA DE ARQUIVOS

```
types/premium/
├── team.ts
└── consolidation.ts

services/premium/
├── teamService.ts
├── consolidationService.ts
└── assessmentSyncService.ts

components/premium/
├── MasterDashboard.tsx (modificar)
├── OrgAdminDashboard.tsx (criar)
│
├── teams/
│   ├── TeamMembersList.tsx
│   ├── MemberCard.tsx
│   ├── CreateMemberModal.tsx
│   ├── EditMemberModal.tsx
│   ├── TransferRequestModal.tsx
│   └── DismissalRequestModal.tsx
│
└── consolidation/
    ├── InstitutionDashboard.tsx
    ├── OrganizationBreakdown.tsx
    ├── TransferApprovalCard.tsx
    ├── DismissalApprovalCard.tsx
    ├── ConsolidatedReports.tsx
    └── AuditTrail.tsx
```

---

## 🔐 MATRIZ DE PERMISSÕES

| Ação | Master | Org_Admin | Member |
|------|--------|-----------|--------|
| Ver consolidação institucional | ✅ | ❌ | ❌ |
| Ver membros de sua org | ✅ | ✅ | ❌ |
| Ver membros de outras orgs | ✅ | ❌ | ❌ |
| Criar membro | ✅ | ✅ | ❌ |
| Editar membro | ✅ | ✅ | ❌ |
| Solicitar transferência | ✅ | ✅ | ❌ |
| Aprovar transferência | ✅ | ❌ | ❌ |
| Solicitar desligamento | ✅ | ✅ | ❌ |
| Aprovar desligamento | ✅ | ❌ | ❌ |
| Operar SISGEAD 2.0 | ❌ | ✅ | ✅ |
| Ver relatórios consolidados | ✅ | ❌ | ❌ |

---

## ✅ DECISÃO NECESSÁRIA

### APROVAR PROPOSTA?

**[ ] SIM - Começar implementação**
- Iniciar Sprint 1 imediatamente
- Estimar 13 dias úteis
- Deploy incremental

**[ ] AJUSTES - Especificar mudanças**
- Quais pontos ajustar?
- Campos adicionais?
- Telas diferentes?

**[ ] REPENSAR - Nova abordagem**
- Qual aspecto repensar?
- Sugestões de mudança?

---

## 📞 PERGUNTAS PARA REFINAMENTO

1. Há limite de membros por organização?
2. Precisa notificação quando aprovação acontecer?
3. Exportação em Excel, PDF ou ambos?
4. Transferências entre instituições diferentes?
5. Campos adicionais no TeamMember?

---

## 🎯 PRÓXIMO PASSO

**Se aprovado:**
Começar pela criação dos tipos TypeScript (Sprint 1)

---

*INFINITUS Sistemas Inteligentes*  
*CNPJ: 09.371.580/0001-06*
