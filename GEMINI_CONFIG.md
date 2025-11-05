# 🔑 Configuração da API do Google Gemini - SISGEAD 2.0

## ⚡ Acesso Rápido

O sistema **funciona perfeitamente** sem configuração adicional em **Modo Simulação**! 

Todas as funcionalidades estão disponíveis com dados simulados realistas.

## 🛠️ Para usar IA Real (Opcional)

Se quiser usar a IA real do Google Gemini, siga estes passos:

### 1. Obter Chave da API

1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 2. Configurar Localmente (Desenvolvimento)

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# .env.local
GEMINI_API_KEY=sua_chave_aqui
```

### 3. Para Deploy (Produção)

#### GitHub Pages (Recomendado)
O sistema usa um Cloudflare Worker proxy por segurança. Configure:

1. Acesse: https://dash.cloudflare.com
2. Vá em Workers & Pages
3. Configure a variável `GEMINI_API_KEY` no worker
4. URL do Worker: `https://sisgead-gemini-proxy.carlosorvate-tech.workers.dev`

#### Outras Plataformas
Configure a variável de ambiente `GEMINI_API_KEY` na plataforma de deploy.

## 🔒 Segurança

- ✅ Nunca commite arquivos `.env*` 
- ✅ Use proxy/worker para production
- ✅ A chave nunca é exposta no frontend
- ✅ Sistema funciona offline sem API

## ⚠️ **PROBLEMA ATUAL: API não configurada**

Se você está vendo a mensagem **"Ocorreu um erro ao processar sua solicitação"**, significa que a chave da API não está configurada no Cloudflare Worker.

### 🔧 **Solução Rápida:**

1. **Obtenha uma chave API:**
   - Vá em: https://makersuite.google.com/app/apikey
   - Clique em "Create API Key"
   - Copie a chave

2. **Configure no Cloudflare:**
   - Acesse: https://dash.cloudflare.com
   - Workers & Pages > sisgead-gemini-proxy
   - Settings > Variables
   - Adicione: `GEMINI_API_KEY` = sua chave

3. **Teste no aplicativo:**
   - Aguarde 1-2 minutos para propagação
   - Teste a IA novamente

### 🎯 **Status do Sistema**

- **Modo Simulação**: ✅ Sempre funcional
- **API Real**: ⚙️ Opcional para recursos avançados
- **Fallback Automático**: ✅ Sem interrupção de serviço

---

**💡 Dica**: O modo simulação oferece experiência completa para demonstração e testes!