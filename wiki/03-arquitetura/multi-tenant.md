---
title: "Arquitetura Multi-Tenant"
category: "arquitetura"
tags: ["multi-tenant", "institucional", "hierarquia", "organizações"]
version: "3.0.0"
lastUpdate: "2025-11-07"
author: "Sistema"
aiContext: true
difficulty: "avançado"
---

# Arquitetura Multi-Tenant SISGEAD 3.0

Sistema hierárquico institucional para gestão de múltiplas organizações.

## 🏛️ Visão Geral

O SISGEAD 3.0 implementa arquitetura **multi-tenant em 3 níveis**:

```
INSTITUIÇÃO (Master)
    ├── ORGANIZAÇÃO 1 (OrgAdmin)
    │   ├── Usuário 1 (Member)
    │   ├── Usuário 2 (Member)
    │   └── Usuário 3 (Member)
    ├── ORGANIZAÇÃO 2 (OrgAdmin)
    │   ├── Usuário 4 (Member)
    │   └── Usuário 5 (Member)
    └── ORGANIZAÇÃO 3 (OrgAdmin)
        └── Usuário 6 (Member)
```

## 🎯 Níveis de Hierarquia

### Nível 1: Instituição (Master)

**Quem é**: Usuário Master institucional (CEO, Diretor, Presidente)

**Acesso**:
- ✅ **Todas organizações** da instituição
- ✅ **Todos usuários** (qualquer organização)
- ✅ **Criar/editar/excluir** organizações
- ✅ **Relatórios consolidados** institucionais
- ✅ **Configurações globais**

**Responsabilidades**:
- Criar estrutura de organizações
- Definir administradores de cada organização
- Monitorar performance institucional
- Definir políticas e limites

### Nível 2: Organização (OrgAdmin)

**Quem é**: Administrador de uma organização específica

**Acesso**:
- ✅ **Sua organização** apenas
- ✅ **Todos usuários** da sua organização
- ✅ **Criar/editar/excluir** usuários na sua org
- ✅ **Relatórios** da sua organização
- ❌ **NÃO vê** outras organizações

**Responsabilidades**:
- Gerenciar equipe da sua organização
- Criar membros
- Redefinir senhas
- Gerar relatórios locais

### Nível 3: Membro (Member)

**Quem é**: Usuário final, membro de equipe

**Acesso**:
- ✅ **Seus próprios dados** apenas
- ✅ **Fazer avaliação DISC**
- ✅ **Ver seu perfil**
- ❌ **NÃO vê** outros usuários
- ❌ **NÃO tem** funções administrativas

**Responsabilidades**:
- Responder questionário DISC
- Manter dados pessoais atualizados

## 🔐 Isolamento de Dados (Data Isolation)

### Princípio Fundamental

**Cada organização tem dados isolados**:
- Usuários de Org A **NÃO veem** usuários de Org B
- OrgAdmin A **NÃO acessa** dados de Org B
- Apenas **Master** vê todos

### Implementação Técnica

```typescript
// Storage segmentado por organização
localStorage.setItem(`users_${organizationId}`, JSON.stringify(users));

// Queries filtradas por contexto
const users = userService.getAll().filter(u => 
  u.organizationId === currentUser.organizationId
);

// Validações de permissão
if (currentUser.role !== 'MASTER' && 
    targetUser.organizationId !== currentUser.organizationId) {
  throw new Error('Acesso negado');
}
```

## 📊 Fluxo de Dados

### Criação de Usuário

```
Master cria OrgAdmin
    ↓
OrgAdmin cria Members
    ↓
Member faz avaliação DISC
    ↓
Dados salvos na organização
    ↓
OrgAdmin vê resultados da sua org
    ↓
Master vê consolidado de todas orgs
```

### Relatórios

```
Member: Apenas seu perfil
    ↓
OrgAdmin: Todos perfis da sua organização
    ↓
Master: Consolidado de todas organizações
```

## 🏢 Tipos de Organização

### Casos de Uso

**Empresa Multi-Filial**:
```
INSTITUIÇÃO: Empresa XYZ Ltda
├── Filial São Paulo
├── Filial Rio de Janeiro
└── Filial Belo Horizonte
```

**Universidade**:
```
INSTITUIÇÃO: Universidade ABC
├── Faculdade de Engenharia
├── Faculdade de Medicina
└── Faculdade de Administração
```

**Governo**:
```
INSTITUIÇÃO: Secretaria de Educação
├── Escola Municipal 1
├── Escola Municipal 2
└── Escola Municipal 3
```

**Corporação Departamental**:
```
INSTITUIÇÃO: Corporação Tech
├── Departamento de TI
├── Departamento Comercial
└── Departamento RH
```

## ⚙️ Configurações de Organização

### Limites e Quotas

```typescript
interface OrganizationSettings {
  maxUsers: number;           // Limite de usuários
  maxAssessments: number;     // Limite de avaliações/mês
  features: string[];         // Features ativas
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}
```

### Features Disponíveis

- ✅ **Avaliação DISC** (básico - sempre ativo)
- ✅ **Construtor de Equipes IA** (opcional)
- ✅ **Relatórios Avançados** (opcional)
- ✅ **Exportação PDF** (opcional)
- ✅ **API Access** (opcional)
- ✅ **Auditoria Completa** (opcional)

## 🔄 Migração e Transferência

### Transferir Usuário entre Organizações

**Apenas Master pode**:

```typescript
// Usuário muda de Org A para Org B
userService.transfer(userId, fromOrgId, toOrgId);

// Histórico preservado
// Avaliações antigas mantidas
// Acesso revogado em Org A
// Acesso concedido em Org B
```

### Mesclar Organizações

**Apenas Master pode**:

```typescript
// Unir Org B em Org A
organizationService.merge(orgAId, orgBId);

// Todos usuários de B → A
// Org B é desativada
// Histórico preservado
```

## 📈 Escalabilidade

### Limites por Nível

```
Free Tier:
- 1 Instituição
- 5 Organizações
- 50 Usuários total
- 500 Avaliações/mês

Professional:
- 1 Instituição
- 20 Organizações
- 500 Usuários total
- Avaliações ilimitadas

Enterprise:
- 1 Instituição
- Organizações ilimitadas
- Usuários ilimitados
- Recursos customizados
```

## 🛡️ Segurança

### Autenticação por Nível

```
Master: CPF + Senha forte (mín 12 caracteres)
OrgAdmin: CPF + Senha forte (mín 8 caracteres)
Member: CPF + Senha (mín 8 caracteres)
```

### Auditoria

**Todas ações são logadas**:
- Quem fez a ação
- Quando foi feita
- Qual organização
- O que foi alterado
- IP de origem

### Compliance LGPD

- ✅ Consentimento explícito por organização
- ✅ Direito de acesso (member vê seus dados)
- ✅ Direito de correção (member edita perfil)
- ✅ Direito de exclusão (admin exclui usuário)
- ✅ Portabilidade (exportação JSON/CSV)

## 🎯 Benefícios da Arquitetura

### Para a Instituição

- ✅ **Visão consolidada** de todas organizações
- ✅ **Gestão centralizada** de políticas
- ✅ **Relatórios estratégicos** institucionais
- ✅ **Controle de custos** e recursos

### Para Organizações

- ✅ **Autonomia operacional** na sua organização
- ✅ **Dados isolados** e seguros
- ✅ **Gestão simplificada** da equipe
- ✅ **Relatórios locais** específicos

### Para Membros

- ✅ **Privacidade** (dados isolados)
- ✅ **Interface simples** (sem complexidade administrativa)
- ✅ **Acesso rápido** aos próprios resultados

---

**A arquitetura multi-tenant garante escalabilidade, segurança e isolamento de dados entre organizações.**
