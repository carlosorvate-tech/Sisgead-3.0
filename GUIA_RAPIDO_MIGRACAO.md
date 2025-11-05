# 🔄 Guia Rápido - Como Migrar Entre Versões

## 🎯 Acesso Rápido

**URL**: https://carlosorvate-tech.github.io/sisgead-2.0/  
**Localização**: Painel Admin → Aba "Configurações IA" → Seção "Gerenciar Versão do Sistema"

---

## 📝 Passo a Passo Simplificado

### Migrar de Standard para Premium

1. **Acesse o sistema** e faça login no portal administrativo
2. **Clique na aba** "Configurações IA" (ícone de engrenagem)
3. **Role a página** até ver "Gerenciar Versão do Sistema"
4. **Clique em** "Migrar para Premium" (card roxo à direita)
5. **Revise os benefícios:**
   - ✅ Gestão de múltiplas organizações
   - ✅ Relatórios institucionais consolidados
   - ✅ Auditoria multi-organização
   - ✅ Segurança avançada (MFA)
   - ✅ Conformidade LGPD completa
   - ✅ Monitoramento de ameaças
6. **Verifique os requisitos:**
   - Mínimo 8GB RAM recomendado
   - Conexão ≥5 Mbps
   - Download adicional: ~100KB
7. **Clique "Confirmar Migração"**
8. **Aguarde** reload automático (~3 segundos)
9. **Pronto!** Sistema reinicia com recursos Premium

### Migrar de Premium para Standard

1. **Acesse o sistema** e faça login no portal administrativo
2. **Clique na aba** "Configurações IA"
3. **Role a página** até "Gerenciar Versão do Sistema"
4. **Clique em** "Migrar para Standard" (card azul à direita)
5. **LEIA O AVISO com atenção:**
   ```
   ⚠️ ATENÇÃO: Você perderá acesso aos recursos Premium
   (multi-tenant, relatórios institucionais, etc.). Os dados
   existentes serão preservados, mas funcionalidades avançadas
   ficarão indisponíveis.
   ```
6. **Revise os benefícios:**
   - ✅ Interface mais leve e rápida
   - ✅ Menor consumo de recursos
   - ✅ Ideal para dispositivos limitados
   - ✅ Foco em recursos essenciais
7. **Verifique os requisitos:**
   - Mínimo 4GB RAM
   - Conexão ≥2 Mbps
   - Compatível com dispositivos móveis
8. **Clique "Confirmar Migração"**
9. **Aguarde** reload automático (~3 segundos)
10. **Pronto!** Sistema reinicia em modo Standard

---

## ❓ Perguntas Frequentes

### 1. Vou perder meus dados ao migrar?

**Não!** Todos os dados são **100% preservados**:
- ✅ Logs de auditoria intactos
- ✅ Propostas de equipe preservadas
- ✅ Composições de equipe mantidas
- ✅ Configurações salvas
- ✅ Backups locais preservados

### 2. Posso voltar atrás depois?

**Sim!** A migração é **totalmente reversível**:
- Pode migrar **quantas vezes quiser**
- Standard → Premium → Standard → Premium...
- **Zero custo**, **zero fricção**

### 3. Quanto tempo leva a migração?

**~3 segundos** no total:
1. Confirmar (1 clique)
2. Salvar escolha (<1ms)
3. Reload página (~2-3s)
4. Sistema reinicia com nova versão

### 4. Preciso fazer backup antes?

**Não é necessário**, mas recomendado por boas práticas:
- Sistema **garante preservação** de dados
- Backup adicional não faz mal
- Aba "Backup/Restore" sempre disponível

### 5. O que acontece se eu migrar e não gostar?

**Migra de volta imediatamente!**
- Mesmo processo, direção oposta
- Dados intactos
- Funcionalidades restauradas
- Menos de 1 minuto no total

### 6. Posso usar ambas versões simultaneamente?

**Não em um único navegador**, mas:
- Pode usar **Standard no Chrome**, **Premium no Firefox**
- Cada navegador/dispositivo escolhe independentemente
- Escolha salva em localStorage (local ao navegador)

### 7. A migração consome internet?

**Sim, mas mínimo**:
- **Standard → Premium**: ~100KB de download adicional (já está no bundle)
- **Premium → Standard**: 0KB (apenas desativa rotas)
- Reload da página: ~305KB (cache do navegador ajuda)

### 8. Preciso de permissões especiais?

**Não**, qualquer **administrador** pode migrar:
- Acesso ao portal admin é suficiente
- Não precisa de super admin
- Não precisa de suporte técnico

---

## 🚨 Avisos Importantes

### ⚠️ Ao Migrar Premium → Standard

Você **perde acesso** a:
- ❌ Interface de gestão de múltiplas organizações
- ❌ Relatórios institucionais consolidados
- ❌ Funcionalidades de segurança avançada (MFA)
- ❌ Conformidade LGPD completa
- ❌ Monitoramento de ameaças

**MAS** os dados continuam salvos! Você só **não pode acessá-los** via interface até migrar de volta para Premium.

### ✅ Ao Migrar Standard → Premium

Você **ganha acesso** a:
- ✅ Gestão centralizada de múltiplas organizações
- ✅ Relatórios institucionais agregados
- ✅ Auditoria multi-organização
- ✅ Segurança avançada (MFA, monitoramento)
- ✅ Conformidade LGPD robusta

---

## 🎯 Quando Migrar?

### Migre para Premium quando:

1. **Sua organização cresceu** e agora tem múltiplas unidades
2. **Precisa de relatórios consolidados** de todas as unidades
3. **Conformidade LGPD** é crítica para seu negócio
4. **Segurança avançada** (MFA) é requerida
5. **Infraestrutura melhorou** (agora tem 8GB+ RAM)

### Migre para Standard quando:

1. **Opera apenas 1 unidade** e não prevê crescimento
2. **Dispositivos limitados** (4GB RAM, tablets antigos)
3. **Prioriza performance** sobre funcionalidades avançadas
4. **Simplicidade** é mais importante que recursos Premium
5. **Reduzir complexidade** do sistema

---

## 🔍 Como Verificar Sua Versão Atual

### Método 1: Interface Visual

Na aba "Configurações IA", veja o card marcado com **"Versão em Uso"**:
- Card **azul** com ✓ = Standard
- Card **roxo** com ✓ = Premium

### Método 2: Console do Navegador (F12)

```javascript
localStorage.getItem('sisgead-version')
// Retorna: "standard" ou "premium"
```

### Método 3: Rotas Disponíveis

- Se tem **"Gestão de Tenants"** no menu = **Premium**
- Se **não tem** = **Standard**

---

## 🆘 Solução de Problemas

### Problema: Migração não funcionou

**Solução:**
1. Verifique conexão com internet
2. Limpe cache do navegador (Ctrl + F5)
3. Tente novamente
4. Se persistir, faça backup e recarregue página

### Problema: Ainda vejo recursos da versão anterior

**Solução:**
1. Force reload: **Ctrl + Shift + R** (Windows) ou **Cmd + Shift + R** (Mac)
2. Verifique localStorage:
   ```javascript
   console.log(localStorage.getItem('sisgead-version'));
   ```
3. Se necessário, defina manualmente:
   ```javascript
   localStorage.setItem('sisgead-version', 'premium'); // ou 'standard'
   location.reload();
   ```

### Problema: Perdi meus dados após migração

**Isso não deve acontecer!** Mas se aconteceu:
1. **Não entre em pânico**
2. Verifique backups na aba "Backup/Restore"
3. Restaure o backup mais recente
4. Se não houver backup, dados podem estar em IndexedDB:
   ```javascript
   // Console do navegador
   indexedDB.databases().then(console.log);
   ```

---

## 📞 Suporte

Se encontrar problemas ou tiver dúvidas:

1. **Documentação Completa**: `SISTEMA_MIGRACAO_VERSAO.md`
2. **Testes Detalhados**: `GUIA_TESTE_VERSION_SELECTOR.md`
3. **Performance**: `ANALISE_PERFORMANCE_INCREMENTOS.md`

---

## ✅ Checklist Rápido

Antes de migrar, confirme:

- [ ] Entendo as diferenças entre Standard e Premium
- [ ] Revisei os requisitos técnicos da versão alvo
- [ ] Fiz backup dos dados (opcional, mas recomendado)
- [ ] Tenho tempo para reload da página (~3s)
- [ ] Sei que posso reverter a qualquer momento

**Tudo certo? Pode migrar com confiança!** 🚀

---

**Sistema de Migração**: ✅ **ATIVO**  
**Preservação de Dados**: ✅ **GARANTIDA**  
**Reversibilidade**: ✅ **ILIMITADA**

**Desenvolvido com ❤️ para democratizar avaliação de desempenho**  
**bycao (ogrorvatigão) 2025**
