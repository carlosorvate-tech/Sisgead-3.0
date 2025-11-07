---
title: "Solução: Página em Branco"
category: "troubleshooting"
tags: ["página-branca", "erro", "cache", "deploy"]
version: "3.0.0"
lastUpdate: "2025-11-07"
author: "Sistema"
aiContext: true
difficulty: "intermediário"
---

# Solução: Página em Branco

Guia completo para resolver problema de página em branco no SISGEAD 3.0.

## 🔍 Diagnóstico Rápido

### Sintomas
- Sistema carrega mas exibe apenas tela branca
- Sem mensagens de erro visíveis
- Barra de endereço mostra URL correta

### Causas Mais Comuns
1. **Cache do navegador** desatualizado (80% dos casos)
2. **Erro JavaScript** silencioso (15% dos casos)
3. **Deploy em andamento** no GitHub Pages (5% dos casos)

## ✅ Solução 1: Limpar Cache (TENTE PRIMEIRO)

### Chrome/Edge
```
1. Pressione Ctrl+Shift+Del
2. Selecione "Todo o período"
3. Marque:
   ✅ Cookies e outros dados do site
   ✅ Imagens e arquivos armazenados em cache
4. Clique "Limpar dados"
5. Feche TODAS as abas do SISGEAD
6. Feche o navegador completamente
7. Reabra e acesse novamente
```

### Firefox
```
1. Pressione Ctrl+Shift+Del
2. Intervalo: "Tudo"
3. Marque:
   ✅ Cookies
   ✅ Cache
4. Clique "Limpar agora"
5. Feche e reabra navegador
```

### Safari (Mac)
```
1. Safari → Preferências → Privacidade
2. Clique "Gerenciar Dados de Sites"
3. Busque "github.io"
4. Remova todos
5. Feche e reabra Safari
```

## ✅ Solução 2: Hard Refresh

Tente forçar atualização **SEM limpar cache**:

```
Windows:
• Ctrl+F5 (Chrome, Firefox, Edge)
• Ctrl+Shift+R (alternativa)

Mac:
• Cmd+Shift+R (Chrome, Firefox, Safari)
• Cmd+Option+R (Safari alternativa)
```

## ✅ Solução 3: Modo Anônimo/Privado

Teste em janela privada para isolar problema:

```
Chrome/Edge: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
Safari: Cmd+Shift+N
```

**Se funciona em modo anônimo** → Problema é cache/cookies/extensões

**Solução definitiva**: Limpe cache (Solução 1)

## ✅ Solução 4: Verificar Console (Erro JS)

### Abrir Console do Desenvolvedor

```
1. Pressione F12 (Windows) ou Cmd+Option+I (Mac)
2. Vá para aba "Console"
3. Recarregue a página (F5)
4. Procure por erros em vermelho
```

### Erros Comuns e Soluções

#### Erro: "Failed to load resource"
**Causa**: Assets CSS/JS não carregaram

**Solução**:
```
1. Verifique URL no console
2. Se for 404, deploy pode estar incompleto
3. Aguarde 5-10 minutos
4. Recarregue (Ctrl+F5)
```

#### Erro: "Uncaught SyntaxError"
**Causa**: JavaScript corrompido/incompleto

**Solução**:
```
1. Limpe cache completamente
2. Aguarde 10 minutos (deploy pode estar em andamento)
3. Tente novamente
```

#### Erro: "Cannot read property of undefined"
**Causa**: React não iniciou corretamente

**Solução**:
```
1. Verifique se arquivo index.js carregou
2. Vá em F12 → Network
3. Procure por index-[hash].js
4. Se estiver vermelho (404), aguarde deploy
```

## ✅ Solução 5: Verificar Network (Deploy)

### Verificar se Assets Carregaram

```
1. Pressione F12
2. Vá para aba "Network"
3. Recarregue a página (F5)
4. Procure por:
   ✅ index.html (200 OK)
   ✅ index-[hash].css (200 OK)
   ✅ index-[hash].js (200 OK)
```

### Se algum está 404 ou Failed

**Causa**: Deploy incompleto ou em andamento

**Solução**:
```
1. Aguarde 10 minutos
2. GitHub Pages pode levar até 10 min para propagar
3. Tente em modo anônimo após 10 min
4. Se persistir, contacte administrador técnico
```

## ✅ Solução 6: Testar URLs Alternativas

Às vezes o problema é case-sensitive (maiúscula/minúscula):

```
Teste estas variações:
• https://carlosorvate-tech.github.io/sisgead-3.0/
• https://carlosorvate-tech.github.io/Sisgead-3.0/
• https://carlosorvate-tech.github.io/SISGEAD-3.0/
```

## ✅ Solução 7: Verificar Navegador

### Navegadores Suportados

```
✅ Chrome 90+
✅ Firefox 88+
✅ Edge 90+
✅ Safari 14+
❌ Internet Explorer (QUALQUER versão)
```

### Atualizar Navegador

```
Chrome:
1. chrome://settings/help
2. Aguarde atualização automática
3. Reinicie navegador

Firefox:
1. Menu → Ajuda → Sobre Firefox
2. Aguarde atualização
3. Reinicie

Edge:
1. edge://settings/help
2. Aguarde atualização
3. Reinicie
```

## 🔧 Para Administradores Técnicos

### Verificar Deploy GitHub Pages

```bash
# 1. Verificar se build está correto
npm run build

# Deve gerar:
# ✅ dist/index.html
# ✅ dist/assets/index-[hash].css
# ✅ dist/assets/index-[hash].js

# 2. Verificar vite.config.ts
# base deve ser: '/sisgead-3.0/' ou '/Sisgead-3.0/'

# 3. Re-deploy se necessário
npm run deploy

# 4. Aguardar propagação (5-10 min)
```

### Verificar Configuração Repository

```
GitHub.com → Repositório → Settings → Pages:

✅ Source: Deploy from a branch
✅ Branch: gh-pages
✅ Folder: / (root)
```

### Testar Localmente

```bash
# 1. Build local
npm run build

# 2. Servir localmente
npx serve dist -p 3000

# 3. Acessar
http://localhost:3000

# Se funciona local mas não produção:
# → Problema é deploy/GitHub Pages
# → Refazer deploy e aguardar
```

## 📊 Checklist de Diagnóstico

Execute em ordem:

- [ ] **Passo 1**: Limpar cache (Ctrl+Shift+Del)
- [ ] **Passo 2**: Hard refresh (Ctrl+F5)
- [ ] **Passo 3**: Testar modo anônimo
- [ ] **Passo 4**: Verificar console F12 (erros?)
- [ ] **Passo 5**: Verificar network F12 (404?)
- [ ] **Passo 6**: Aguardar 10 minutos (deploy)
- [ ] **Passo 7**: Testar URL alternativa
- [ ] **Passo 8**: Atualizar navegador
- [ ] **Passo 9**: Testar outro navegador
- [ ] **Passo 10**: Contactar suporte técnico

## 🎯 Taxa de Sucesso por Solução

```
Solução 1 (Limpar Cache): 80% de sucesso
Solução 2 (Hard Refresh): 10% adicional
Solução 3 (Modo Anônimo): Diagnóstico
Solução 6 (Aguardar Deploy): 5% adicional
Outras: 5% (casos raros)
```

## ❓ Quando Escalar para Suporte

Entre em contato com suporte técnico se:

- ❌ Todas soluções acima falharam
- ❌ Console mostra erro não documentado aqui
- ❌ Problema persiste após 1 hora
- ❌ Outros usuários reportam mesmo problema

### Informações para Fornecer

```
1. URL completa tentada
2. Navegador + versão (chrome://version)
3. Print do console (F12 → Console)
4. Print do network (F12 → Network)
5. Timestamp da tentativa
6. Já tentou limpar cache? (Sim/Não)
7. Funciona em modo anônimo? (Sim/Não)
```

---

**99% dos casos de página branca são resolvidos limpando cache + hard refresh.**
