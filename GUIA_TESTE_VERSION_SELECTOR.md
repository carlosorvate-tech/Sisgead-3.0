# 🧪 Guia de Teste - Seletor de Versão Educacional

## 🎯 Como Testar a Nova Funcionalidade

### 1️⃣ Limpar Escolha Anterior (Se Existir)

Abra o **Console do Navegador** (F12) e execute:

```javascript
localStorage.removeItem('sisgead-version');
location.reload();
```

### 2️⃣ Acessar o Sistema

Acesse: https://carlosorvate-tech.github.io/sisgead-2.0/

### 3️⃣ Tela de Seleção de Versão

Você verá:

```
┌─────────────────────────────────────────────────────────────┐
│         Escolha a Versão Ideal para Sua Organização        │
│                                                             │
│  O SISGEAD oferece duas versões otimizadas para atender... │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│   VERSÃO STANDARD    │  │   VERSÃO PREMIUM     │
│                      │  │                      │
│ Para pequenas e      │  │ Para grandes         │
│ médias organizações  │  │ corporações          │
│                      │  │                      │
│ 1 organização        │  │ Múltiplas orgs       │
│ ~100 usuários        │  │ Ilimitado            │
│ 4GB RAM mínimo       │  │ 8GB+ RAM mínimo      │
│ ~200KB download      │  │ ~300KB download      │
│                      │  │                      │
│ [Selecionar]         │  │ [Selecionar]         │
└──────────────────────┘  └──────────────────────┘

▼ Ver Comparação Detalhada de Recursos
```

### 4️⃣ Explorar Tabela de Comparação

Clique em **"Ver Comparação Detalhada de Recursos"**

Você verá uma tabela com:
- Multi-organização
- Capacidade de usuários
- Sistema de auditoria
- Backup e restauração
- Relatórios institucionais
- Gestão de tenants
- Análise consolidada
- Segurança avançada (MFA)
- Conformidade LGPD
- Monitoramento de ameaças
- Auditoria de segurança
- E mais...

### 5️⃣ Testar Versão Standard

1. Clique em **"Selecionar"** no card Standard
2. Sistema vai para tela principal
3. **Verifique**: Menu lateral NÃO tem opções "Gestão de Tenants" ou "Relatórios Institucionais"
4. Funcionalidade básica (auditoria, backup) está disponível

### 6️⃣ Testar Versão Premium

1. Limpe a escolha: `localStorage.removeItem('sisgead-version'); location.reload();`
2. Clique em **"Selecionar"** no card Premium
3. Sistema vai para tela principal
4. **Verifique**: Menu lateral TEM opções "Gestão de Tenants" e "Relatórios Institucionais"
5. Todas as funcionalidades avançadas estão disponíveis

### 7️⃣ Verificar Persistência

1. Escolha qualquer versão
2. **Recarregue a página** (F5)
3. **Resultado esperado**: Sistema vai direto para app (não mostra seletor novamente)
4. Sua escolha foi salva!

---

## 🔍 Checklist de Validação

### Visual

- [ ] Cards lado a lado em desktop
- [ ] Cards empilhados em mobile
- [ ] Standard tem tema azul
- [ ] Premium tem tema roxo/gradiente
- [ ] Requisitos de hardware visíveis
- [ ] Tabela de comparação expansível funcionando
- [ ] Fontes legíveis
- [ ] Espaçamento adequado

### Funcional

- [ ] Clicar Standard → vai para app sem multi-tenant
- [ ] Clicar Premium → vai para app com multi-tenant
- [ ] Escolha persiste após reload
- [ ] Limpar localStorage → seletor aparece novamente
- [ ] Tabela de comparação abre/fecha corretamente

### Responsivo

- [ ] Desktop (>1024px): Cards lado a lado
- [ ] Tablet (768-1023px): Cards lado a lado compactos
- [ ] Mobile (<768px): Cards empilhados verticalmente

### Performance

- [ ] Seletor carrega rápido (<100ms)
- [ ] Transição suave para app
- [ ] Sem lags ou travamentos

---

## 🐛 Troubleshooting

### Seletor não aparece

**Solução**:
```javascript
// Console do navegador
localStorage.removeItem('sisgead-version');
location.reload();
```

### Escolha não persiste

**Verificar**:
```javascript
// Console do navegador
localStorage.getItem('sisgead-version');
// Deve retornar: "standard" ou "premium"
```

### Rotas Premium não aparecem

**Verificar**:
1. Escolheu versão Premium?
2. Recarregou página?
3. Check console:
```javascript
localStorage.getItem('sisgead-version');
// Deve ser "premium"
```

---

## 📸 Screenshots Esperadas

### Desktop

```
[Header Explicativo]
    ↓
[Card Standard]  [Card Premium]
    ↓
[Comparação Detalhada - Colapsável]
```

### Mobile

```
[Header Explicativo]
    ↓
[Card Standard]
    ↓
[Card Premium]
    ↓
[Comparação Detalhada - Colapsável]
```

---

## ✅ Resultado Final Esperado

Após escolher uma versão:

### Standard
- ✅ App funciona normalmente
- ✅ Auditoria disponível
- ✅ Backup/Restore disponível
- ❌ Sem gestão de tenants
- ❌ Sem relatórios institucionais
- ❌ Sem features multi-tenant

### Premium
- ✅ Todas features Standard
- ✅ Gestão de tenants
- ✅ Relatórios institucionais
- ✅ Auditoria multi-organização
- ✅ Segurança avançada (MFA)
- ✅ Conformidade LGPD completa

---

## 🎓 Objetivo Atingido

O seletor garante que:

1. **Transparência**: Usuário sabe exatamente o que cada versão oferece
2. **Decisão Informada**: Requisitos técnicos claros (RAM, banda, etc)
3. **Sem Surpresas**: Comparação lado a lado evita frustrações
4. **Contexto Adequado**: Escolhe versão alinhada com infraestrutura
5. **Autonomia**: Decisão técnica sem necessidade de consultoria

---

**Desenvolvido com ❤️ para democratizar avaliação de desempenho**  
**bycao (ogrorvatigão) 2025**
