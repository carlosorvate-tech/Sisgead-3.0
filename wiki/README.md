# 📚 Wiki SISGEAD 3.0

**Base de Conhecimento Oficial do Sistema de Gestão de Avaliações DISC**

---

## 🎯 Visão Geral

Este Wiki centraliza toda a documentação do SISGEAD 3.0, organizada para:
- ✅ **Usuários**: Guias práticos de uso
- ✅ **Administradores**: Gestão e configuração
- ✅ **Desenvolvedores**: Arquitetura e APIs
- ✅ **IA Assistant**: Suporte técnico automatizado

---

## 📁 Estrutura do Wiki

```
wiki/
├── 01-guias-usuario/          # Manuais para usuários finais
├── 02-guias-administrador/    # Gestão de instituições e organizações
├── 03-arquitetura/            # Documentação técnica e design
├── 04-api-referencia/         # APIs e serviços
├── 05-troubleshooting/        # Solução de problemas
├── 06-changelog/              # Histórico de versões
├── 07-deployment/             # Deploy e infraestrutura
└── 08-development/            # Guias para desenvolvedores
```

---

## 🔍 Índice Rápido

### Para Usuários
- [Guia Prático de Uso](01-guias-usuario/guia-pratico-uso.md)
- [Como Fazer Avaliação DISC](01-guias-usuario/como-fazer-avaliacao.md)
- [Entendendo Seu Perfil](01-guias-usuario/entendendo-perfil-disc.md)

### Para Administradores
- [Guia do Administrador](02-guias-administrador/guia-administrador.md)
- [Gerenciar Organizações](02-guias-administrador/gerenciar-organizacoes.md)
- [Gerenciar Usuários](02-guias-administrador/gerenciar-usuarios.md)
- [Sistema de Senhas](02-guias-administrador/sistema-senhas.md)

### Para Desenvolvedores
- [Arquitetura Enterprise V3](03-arquitetura/arquitetura-enterprise-v3.md)
- [Arquitetura IA Dual-Level](03-arquitetura/arquitetura-ia-dual-level.md)
- [Premium Multi-Tenant](03-arquitetura/premium-multi-tenant.md)
- [API Reference](04-api-referencia/api-overview.md)

### Troubleshooting
- [Página em Branco](05-troubleshooting/pagina-branca.md)
- [Smart Hints não Funciona](05-troubleshooting/smart-hints.md)
- [Problemas de Impressão](05-troubleshooting/sistema-impressao.md)

### Deployment
- [Deploy DigitalOcean](07-deployment/deploy-digitalocean.md)
- [Deploy GitHub Pages](07-deployment/deploy-github-pages.md)
- [Rollback](07-deployment/rollback.md)

---

## 🤖 Integração com IA

Este Wiki alimenta o **AI Assistant** do SISGEAD com:
- **Contexto de Produto**: Funcionalidades e recursos
- **Conhecimento Técnico**: APIs, serviços, componentes
- **Soluções Conhecidas**: Troubleshooting documentado
- **Boas Práticas**: Padrões e recomendações

---

## 📝 Convenções

### Frontmatter
Cada documento deve conter metadados:

```yaml
---
title: "Título do Documento"
category: "guias-usuario | guias-admin | arquitetura | api | troubleshooting | changelog | deployment | development"
tags: ["tag1", "tag2", "tag3"]
version: "3.0.0"
lastUpdate: "2025-11-06"
author: "Sistema"
aiContext: true  # Se deve ser indexado pela IA
difficulty: "básico | intermediário | avançado"
---
```

### Estrutura de Documento

1. **Título e Descrição**
2. **Pré-requisitos** (se aplicável)
3. **Conteúdo Principal**
4. **Exemplos Práticos**
5. **Problemas Comuns**
6. **Referências Relacionadas**

---

## 🔄 Manutenção

### Documentos Ativos
✅ Mantidos e atualizados regularmente

### Documentos Arquivados
📦 Movidos para `/wiki/archive/` quando obsoletos

### Critérios de Arquivamento
- Versão anterior (< 3.0)
- Funcionalidade removida
- Duplicado de outro documento
- Informação desatualizada > 6 meses

---

## 🎯 Roadmap do Wiki

- [x] Estrutura base criada
- [ ] Migração de docs existentes
- [ ] Consolidação de duplicados
- [ ] Indexação para IA
- [ ] Sistema de busca semântica
- [ ] Versionamento automático

---

**Última Atualização**: 06/11/2025  
**Versão do Wiki**: 1.0.0  
**Compatível com**: SISGEAD 3.0.0+
