---
title: "Guia do Administrador SISGEAD 3.0"
category: "guias-admin"
tags: ["administrador", "gestão", "master", "organizações"]
version: "3.0.0"
lastUpdate: "2025-11-06"
author: "Sistema"
aiContext: true
difficulty: "intermediário"
---

# 📋 Guia do Administrador SISGEAD 3.0

**Manual completo para Master e Administradores de Organização**

---

## 🎯 Visão Geral

O SISGEAD 3.0 é uma plataforma **multi-tenant** de gestão de avaliações DISC com:
- ✅ **Arquitetura Enterprise**: Instituição → Organizações → Usuários
- ✅ **IA Integrada**: Assistente inteligente contextual
- ✅ **Gestão Completa**: CRUD de organizações, usuários e senhas
- ✅ **Multi-nível**: Acesso hierárquico (Master > OrgAdmin > Member)

---

## 👤 Níveis de Acesso

### 👑 Master (Institucional)
**Permissões**:
- Gerenciar **todas as organizações** da instituição
- Criar/editar/excluir organizações
- Gerenciar **todos os usuários** (qualquer organização)
- Redefinir senhas de qualquer usuário
- Acesso a **dados consolidados** de toda instituição
- IA com contexto institucional (cross-org analytics)

**Use Cases**:
- CEO, CTO, Diretor de RH
- Gestão estratégica global
- Análise comparativa entre organizações

---

### 👔 OrgAdmin (Organizacional)
**Permissões**:
- Gerenciar **apenas sua organização**
- Criar/editar usuários da própria org
- Visualizar relatórios da organização
- IA com contexto organizacional (single-org analytics)

**Use Cases**:
- Gerente de departamento
- Líder de equipe
- Coordenador de RH regional

---

### 👤 Member (Membro)
**Permissões**:
- Fazer avaliações DISC
- Visualizar próprio perfil
- IA com contexto pessoal (career guidance)

**Use Cases**:
- Funcionários
- Colaboradores
- Candidatos

---

## 🏢 Gestão de Organizações

### Criar Nova Organização

**Acesso**: Dashboard Master → Aba "Organizações" → "+ Nova Organização"

**Campos Obrigatórios**:
- **Nome**: Identificação única (ex: "Matriz São Paulo", "Filial Sul")
- **Status**: Ativa / Inativa / Suspensa

**Configurações**:
- **Máx Usuários**: Limite de membros (padrão: 50)
- **Features Permitidas**:
  - ✅ Avaliações DISC
  - ✅ Relatórios
  - ✅ Analytics
  - ✅ Construtor de Equipes
  - ✅ Assistente IA

**Aprovação de Avaliações**:
- ☑️ **Ativado**: Avaliações precisam ser aprovadas por OrgAdmin
- ☐ **Desativado**: Avaliações são automáticas

**Exemplo**:
```
Nome: Filial Rio de Janeiro
Descrição: Escritório regional RJ - Equipe comercial
Status: Ativa
Máx Usuários: 30
Features: ✅ Todas
Requer Aprovação: ☐ Não
```

---

### Editar Organização

**Acesso**: Lista de Organizações → Botão "Editar" na organização

**Ações Disponíveis**:
1. **Alterar Informações**: Nome, descrição, status
2. **Ajustar Configurações**: Máx usuários, features
3. **Excluir Organização**: ⚠️ Remove **todos os dados** (irreversível)

**Modal de Exclusão**:
- Lista impactos da exclusão
- Exige confirmação explícita
- Mostra número de membros afetados

---

## 👥 Gestão de Usuários

### Criar Novo Usuário

**Acesso**: Dashboard Master → Aba "Usuários" → "+ Novo Usuário"

**Informações Pessoais**:
- **Nome Completo**: Ex: "Maria Silva Santos"
- **Email**: Login único no sistema
- **Telefone**: Opcional (recomendado para recuperação)
- **Departamento**: Opcional (ex: "Comercial", "TI")

**Configurações de Acesso**:
- **Role**: Member 👤 / OrgAdmin 👔 / Master 👑
- **Organizações**: Selecionar uma ou mais organizações
- **Status**: ☑️ Ativo / ☐ Inativo

**Senha Inicial**:
- Automática: `Sisgead@2024` (padrão do sistema)
- Usuário **deve trocar** no primeiro login
- Sistema força criação de nova senha

**Exemplo**:
```
Nome: João Carlos Oliveira
Email: joao.oliveira@empresa.com
Telefone: (11) 98765-4321
Departamento: Vendas
Role: Member 👤
Organizações: [✓] Filial São Paulo
Status: ✓ Ativo
Senha Inicial: Sisgead@2024 (será forçado a trocar)
```

---

### Editar Usuário

**Acesso**: Lista de Usuários → Botão "Editar" no usuário

**Ações Disponíveis**:

#### 1. **Alterar Dados Cadastrais**
- Nome, email, telefone, departamento
- Organizações atribuídas
- Role (permissões)

#### 2. **🔑 Redefinir Senha**
**Quando usar**:
- Usuário esqueceu a senha
- Conta bloqueada por tentativas falhadas
- Reset de segurança

**Como funciona**:
1. Clique "Redefinir Senha" (botão amarelo)
2. Sistema confirma ação
3. Senha volta para `Sisgead@2024`
4. Usuário é **forçado a criar nova senha** no próximo login
5. Bloqueio de conta é removido

**Modal de Confirmação**:
```
🔑 Redefinir Senha

Redefinir senha para João Carlos Oliveira:

✓ Senha será redefinida para: Sisgead@2024
✓ Usuário será forçado a criar nova senha no próximo login
✓ Bloqueio de conta será removido (se existir)

[Cancelar] [Redefinir Senha]
```

#### 3. **🗑️ Excluir Usuário**
**Quando usar**:
- Funcionário desligado
- Conta duplicada
- Limpeza de dados

**⚠️ ATENÇÃO**: Ação **irreversível**
- Remove todos os dados do usuário
- Deleta avaliações e histórico
- Revoga acesso imediatamente

**Modal de Confirmação**:
```
⚠️ Confirmar Exclusão

Você está prestes a excluir o usuário:
João Carlos Oliveira
joao.oliveira@empresa.com

• Todos os dados do usuário serão removidos
• Acesso será revogado imediatamente
• Avaliações e histórico serão deletados

[Cancelar] [Excluir Definitivamente]
```

---

## 🔐 Sistema de Senhas

### Senha Padrão Inicial

**Senha**: `Sisgead@2024`

**Onde é usada**:
- ✅ Criação de novos usuários
- ✅ Reset de senha (quando admin redefine)

**Segurança**:
- Usuário **não pode manter** a senha padrão
- Sistema **força troca** no primeiro login
- Campo `requirePasswordChange: true` garante isso

---

### Política de Senhas

**Requisitos** (implementados no authService):
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial (@, #, $, %, etc.)

**Bloqueio de Conta**:
- Após **5 tentativas falhadas** de login
- Admin pode desbloquear via "Redefinir Senha"

**Expiração**:
- Senhas não expiram automaticamente (ainda)
- Boa prática: Pedir troca a cada 90 dias

---

### Fluxo Completo de Senha

#### Cenário 1: Novo Usuário
```
1. Admin cria usuário → Senha = Sisgead@2024
2. Usuário recebe email com login
3. Primeiro login → Sistema pede nova senha
4. Usuário cria senha forte
5. Acesso liberado
```

#### Cenário 2: Usuário Esqueceu Senha
```
1. Usuário tenta logar → Falha
2. Usuário contacta admin
3. Admin clica "Redefinir Senha"
4. Senha volta para Sisgead@2024
5. Admin informa usuário
6. Usuário faz login e cria nova senha
```

#### Cenário 3: Conta Bloqueada
```
1. Usuário erra senha 5x → Conta bloqueada
2. Admin vai em "Editar Usuário"
3. Clica "Redefinir Senha"
4. Bloqueio é removido automaticamente
5. Senha volta para padrão
6. Usuário pode logar e criar nova
```

---

## 📊 Dashboard Master

### Visão Consolidada

**Métricas Principais**:
- **Total de Organizações**: Ativas, inativas, suspensas
- **Total de Usuários**: Por role, por status
- **Avaliações Realizadas**: Por organização, por período
- **Uso de Features**: Analytics de adoção

**Gráficos**:
- Distribuição de perfis DISC por organização
- Timeline de criação de usuários
- Taxa de conclusão de avaliações

---

### Ações Rápidas

**Organizações**:
- ➕ Criar nova organização
- 📊 Ver estatísticas consolidadas
- 🔍 Buscar por nome/status

**Usuários**:
- ➕ Criar novo usuário
- 🔍 Filtrar por role/organização
- 📧 Exportar lista de emails

**IA**:
- 💬 Abrir assistente IA (botão flutuante)
- Contexto institucional automático
- Perguntas rápidas: "Quantos usuários ativos?", "Qual organização tem mais membros?"

---

## 🤖 Usando a IA

### Botão Flutuante

**Localização**: Canto inferior direito (sempre visível)

**Aparência por Role**:
- 👑 **Master**: Gradiente roxo com coroa
- 👔 **OrgAdmin**: Gradiente azul com gravata
- 👤 **Member**: Gradiente verde com usuário

**Clique** → Abre modal de IA

---

### Quick Actions (Master)

**IA oferece atalhos**:
1. 📊 **Visão Institucional**: "Me mostre um resumo da instituição"
2. 🔍 **Comparar Organizações**: "Qual organização tem melhor performance?"
3. 👥 **Mapeamento de Talentos**: "Quais usuários têm perfil D (liderança)?"
4. 💡 **Insights Estratégicos**: "Onde investir em treinamento?"

**Como usar**:
- Clique no botão sugerido OU
- Digite pergunta livre

---

### Exemplos de Perguntas

**Gestão**:
- "Quantos usuários ativos eu tenho?"
- "Quais organizações estão inativas?"
- "Preciso criar uma nova organização para a filial de Curitiba"

**Análise**:
- "Qual é a distribuição de perfis DISC na organização X?"
- "Quem são os líderes naturais (perfil D alto)?"
- "Mostre um comparativo de desempenho entre organizações"

**Suporte**:
- "Como redefinir a senha de um usuário?"
- "Como excluir uma organização?"
- "Qual a diferença entre Master e OrgAdmin?"

---

## 🔧 Troubleshooting

### Problema: Usuário não consegue logar

**Possíveis causas**:
1. **Senha incorreta** → Redefinir senha
2. **Conta bloqueada** → Redefinir senha (remove bloqueio)
3. **Conta inativa** → Editar usuário e ativar
4. **Email errado** → Editar usuário e corrigir

**Solução rápida**:
```
Editar Usuário → Redefinir Senha → Informar usuário
```

---

### Problema: Organização não aparece para usuário

**Causa**: Usuário não está vinculado à organização

**Solução**:
```
Editar Usuário → Organizações → Marcar organização desejada → Salvar
```

---

### Problema: Botão de IA não aparece

**Verificar**:
1. Feature "ai-assistant" está habilitada na organização?
2. Usuário tem permissão de acesso?
3. Navegador compatível? (Chrome, Edge, Firefox modernos)

---

## 📚 Referências Relacionadas

- [Gerenciar Organizações](gerenciar-organizacoes.md)
- [Gerenciar Usuários](gerenciar-usuarios.md)
- [Sistema de Senhas](sistema-senhas.md)
- [Arquitetura Enterprise](../03-arquitetura/arquitetura-enterprise-v3.md)
- [API Reference](../04-api-referencia/user-service.md)

---

**Última Atualização**: 06/11/2025  
**Versão**: 3.0.0  
**Autor**: Sistema SISGEAD
