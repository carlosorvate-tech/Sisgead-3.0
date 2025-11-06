# PROPOSTA INTEGRAÇÃO SISGEAD 2.0 + 3.0 - PARTE 1: ARQUITETURA

**Data:** 06/11/2025  
**Status:** 📋 AGUARDANDO APROVAÇÃO  

---

## 🎯 ENTENDIMENTO DA LÓGICA

### Hierarquia Operacional

```
NÍVEL 1: INSTITUIÇÃO (Master)
├─ SISGEAD 3.0 Premium
├─ Visão consolidada
├─ Aprovar transferências
├─ Aprovar desligamentos
└─ NÃO opera SISGEAD 2.0

NÍVEL 2: ORGANIZAÇÕES (Org_Admin)
├─ SISGEAD 2.0 completo
├─ Gerenciar equipes
├─ Realizar avaliações
├─ Solicitar transferências
├─ Solicitar desligamentos
└─ Ver APENAS seus dados
```

### Fluxo de Dados

```
Org A → Cadastra membro → SISGEAD 2.0 → Segregado
Org B → Cadastra membro → SISGEAD 2.0 → Segregado
Org C → Cadastra membro → SISGEAD 2.0 → Segregado
         ↓
Master → Ver todos → Consolidação → Aprovar ações
```

---

## 📋 COMPONENTES PRINCIPAIS

### 1. Para Organizações (Org_Admin)
- **Aba:** "Gerenciar Equipes"
- **Funções:**
  - Cadastrar membros
  - Editar dados
  - Solicitar transferências
  - Solicitar desligamentos
  - Operar SISGEAD 2.0
  - Ver relatórios da organização

### 2. Para Instituição (Master)
- **Aba:** "Consolidação Institucional"
- **Funções:**
  - Ver efetivo total
  - Ver por organização
  - Aprovar transferências
  - Aprovar desligamentos
  - Relatórios consolidados
  - Auditoria completa

---

## 🔐 SEGREGAÇÃO DE DADOS

### Regra de Ouro
```typescript
// Org_Admin vê APENAS sua organização
const members = await teamService.listMembers({
  organizationId: currentUser.organizationIds[0]
});

// Master vê TODAS as organizações
const allMembers = await teamService.listMembers({
  institutionId: currentUser.institutionId
});
```

### Validação de Acesso
```typescript
if (currentUser.role === 'org_admin') {
  // Pode ver apenas organizationIds do usuário
  canAccess = member.organizationId IN currentUser.organizationIds;
}

if (currentUser.role === 'master') {
  // Pode ver toda a instituição
  canAccess = member.institutionId === currentUser.institutionId;
}
```

---

## ✅ APROVAÇÃO NECESSÁRIA

**Esta parte 1 está clara?**
- [ ] Sim, hierarquia entendida
- [ ] Sim, segregação está correta
- [ ] Precisa ajustes (especificar)

**Próximos passos:**
- PARTE 2: Estrutura de Dados (Types)
- PARTE 3: Serviços (Services)
- PARTE 4: Interface de Usuário
- PARTE 5: Implementação

---

*INFINITUS Sistemas Inteligentes*
