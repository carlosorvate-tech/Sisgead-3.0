# 🚨 TROUBLESHOOT SMART HINTS - Soluções Rápidas

## ✅ CHECKLIST DE VERIFICAÇÃO (Execute em ordem):

### 1️⃣ **VERIFICAR URL CORRETA**
- ✅ Acesse: `http://localhost:3000/sisgead-2.0/`
- ❌ NÃO use: `http://localhost:3000/` (sem /sisgead-2.0/)

### 2️⃣ **HARD REFRESH COMPLETO**
```bash
# No Chrome:
1. Ctrl + Shift + R (hard refresh)
2. Ou F12 > Network > "Disable cache" ✅ > F5
```

### 3️⃣ **LIMPAR STORAGE COMPLETO**
```bash
# No Chrome DevTools (F12):
1. Application tab
2. Storage > Clear storage
3. ✅ Marcar tudo > Clear site data
4. Fechar e reabrir aba
```

### 4️⃣ **VERIFICAR CONSOLE ERRORS**
```javascript
// No Console (F12 > Console), cole:
console.clear();
console.log('🔍 Verificando Smart Hints...');

// Aguarde 5 segundos e verifique se há erros vermelhos
```

### 5️⃣ **EXECUTAR DIAGNÓSTICO AUTOMÁTICO**
```javascript
// Cole no Console do Chrome (F12 > Console):
fetch('/debug-smart-hints.js')
  .then(response => response.text())
  .then(code => eval(code))
  .catch(() => {
    console.log('❌ Erro carregando debug script');
    console.log('💡 Copie manualmente o conteúdo de debug-smart-hints.js');
  });
```

### 6️⃣ **FORÇAR TRIGGER MANUAL**
```javascript
// No Console, após 5 segundos na página:
console.log('🎯 Forçando trigger do Smart Hints...');

// Simular primeira visita
localStorage.removeItem('sisgead_user_context');

// Recarregar página
window.location.reload();
```

### 7️⃣ **VERIFICAR MODO DEVELOPMENT**
Se o debug panel (canto inferior esquerdo) não aparece:

```bash
# Parar servidor (Ctrl+C no terminal)
# Reiniciar em modo dev explícito:
npm run dev
```

### 8️⃣ **TESTE VISUAL DIRETO**
```javascript
// Forçar mostrar hint manualmente:
const testHint = document.createElement('div');
testHint.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%);
  border: 2px solid #2563eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  z-index: 9999;
  max-width: 300px;
  font-family: system-ui;
`;
testHint.innerHTML = `
  <div style="font-weight: bold; margin-bottom: 8px;">🧪 Teste Smart Hints</div>
  <div style="font-size: 14px;">Se você vê esta mensagem, o sistema pode renderizar hints!</div>
  <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px;">OK</button>
`;
document.body.appendChild(testHint);
```

## 🔍 **POSSÍVEIS CAUSAS E SOLUÇÕES:**

### ❌ **Problema: Hints não aparecem**
**Causas:**
1. Cache do navegador não limpo
2. Está no modo production (sem debug panel)  
3. Condições dos hints não atendidas
4. JavaScript bloqueado ou erro

**Soluções:**
```javascript
// 1. Verificar se Provider carregou:
console.log('Provider check:', !!document.querySelector('[data-smart-hints-provider]'));

// 2. Verificar contexto:
console.log('Context:', localStorage.getItem('sisgead_user_context'));

// 3. Forçar reset:
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### ❌ **Problema: Debug panel não aparece**
**Causa:** Modo production
**Solução:**
```bash
# Terminal (parar com Ctrl+C e rodar):
set NODE_ENV=development
npm run dev
```

### ❌ **Problema: Erros no Console**
**Verificar:**
1. TypeScript errors (texto vermelho)
2. Network errors (falha carregar arquivos)
3. React errors (problemas de rendering)

## 🎯 **TESTE FINAL DEFINITIVO:**

```javascript
// COLE TUDO ISSO NO CONSOLE:
console.log('🚀 TESTE DEFINITIVO SMART HINTS');

// Reset completo
localStorage.clear();
sessionStorage.clear();

// Aguardar e recarregar
setTimeout(() => {
  window.location.reload();
}, 1000);
```

## 📞 **SE AINDA NÃO FUNCIONAR:**

1. **Feche completamente o Chrome**
2. **Reabra e vá direto para:** `http://localhost:3000/sisgead-2.0/`  
3. **Aguarde 10 segundos sem fazer nada**
4. **Verifique canto inferior esquerdo** (debug panel)
5. **Se não aparecer, execute o diagnóstico automático acima**

---

**💡 DICA:** O Smart Hints precisa de alguns segundos para "aprender" seu comportamento. Seja paciente na primeira visita!