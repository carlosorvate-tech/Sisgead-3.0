# 🔄 **PLANO DE ROLLBACK v2.0 - SISGEAD BACKUP STRATEGY**

## 🎯 **OBJETIVO**
Garantir que podemos **voltar rapidamente** à versão 2.0 estável caso os incrementos multi-tenant causem problemas em produção.

---

## 📋 **ESTRATÉGIAS DE ROLLBACK**

### **🚀 1. ROLLBACK RÁPIDO (< 5 minutos)**
Para emergências críticas em produção.

#### **Comandos de Emergência:**
```bash
# 1. Checkout da versão estável
git checkout v2.0.5-stable
git push origin main --force-with-lease

# 2. Deploy automático
npm run build
npm run deploy

# 3. Verificação imediata
curl -I https://carlosorvate-tech.github.io/sisgead-2.0/
```

#### **Validação Pós-Rollback:**
- ✅ Sistema carrega em < 3 segundos
- ✅ Questionário DISC funcional
- ✅ Admin portal acessível
- ✅ Exportação de dados operacional

---

### **🔧 2. ROLLBACK SELETIVO (10-15 minutos)**
Para manter algumas funcionalidades dos incrementos.

#### **Opções de Rollback Seletivo:**

##### **Versão v2.5 (Foundation + Admin Básico)**
```bash
# Manter INCREMENT 1 + 2, remover 3 + 4
git checkout main
git revert --no-commit HEAD~20..HEAD~10
git commit -m "Rollback to v2.5: Keep foundation + basic admin"
```

**Funcionalidades Mantidas:**
- ✅ Multi-tenant foundation
- ✅ CPF validation aprimorada
- ✅ Audit básico
- ❌ Super admin dashboard
- ❌ Security compliance

##### **Versão v2.7 (Sem Security)**
```bash
# Manter INCREMENT 1 + 2 + 3, remover 4
git revert --no-commit HEAD~5..HEAD
git commit -m "Rollback security: Keep admin features"
```

**Funcionalidades Mantidas:**
- ✅ Multi-tenant completo
- ✅ Admin enhancement
- ✅ Super admin dashboard
- ❌ Security & compliance

---

### **📦 3. ROLLBACK COMPLETO (v2.0 Original)**
Volta ao estado exato antes dos incrementos.

#### **Processo Detalhado:**
```bash
# 1. Backup da versão atual (segurança)
git tag -a v3.0.0-backup -m "Backup antes do rollback"
git push origin v3.0.0-backup

# 2. Checkout da versão estável v2.0
git checkout v2.0.5-stable
git checkout -b rollback-to-v2.0

# 3. Limpeza de arquivos dos incrementos
rm -rf types/institutional.ts
rm -rf services/tenantManager.ts
rm -rf services/auditService.ts
rm -rf components/SuperAdminDashboard.tsx
rm -rf components/ComplianceReports.tsx
# ... outros arquivos dos incrementos

# 4. Restore dos arquivos originais v2.0
git checkout v2.0.5-stable -- components/
git checkout v2.0.5-stable -- services/
git checkout v2.0.5-stable -- types/

# 5. Build e deploy
npm install --force
npm run build
npm run deploy

# 6. Validação completa
npm test
npm run preview
```

---

## 🎨 **CONFIGURAÇÃO DE BRANCHES DE SEGURANÇA**

### **Branch Strategy:**
```
main (v3.0.0) ──┐
                ├─ v2.0.5-stable (backup permanente)
                ├─ v2.5-selective (rollback parcial)
                └─ emergency-rollback (rollback rápido)
```

### **Comandos de Setup:**
```bash
# Criar branch de backup antes do deploy v3.0
git checkout main
git tag -a v2.0.5-stable -m "Stable backup antes multi-tenant"
git push origin v2.0.5-stable

# Branch para rollbacks seletivos
git checkout -b v2.5-selective v2.0.5-stable
git push origin v2.5-selective

# Branch para emergências
git checkout -b emergency-rollback v2.0.5-stable
git push origin emergency-rollback
```

---

## ⚡ **SCRIPTS DE AUTOMAÇÃO**

### **Rollback Automático - Script PowerShell**
```powershell
# rollback-emergency.ps1
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("v2.0", "v2.5", "v2.7")]
    [string]$Version
)

Write-Host "🚨 INICIANDO ROLLBACK PARA $Version" -ForegroundColor Red

switch ($Version) {
    "v2.0" {
        git checkout v2.0.5-stable
        git push origin main --force-with-lease
    }
    "v2.5" {
        git checkout v2.5-selective  
        git push origin main --force-with-lease
    }
    "v2.7" {
        git revert --no-commit HEAD~5..HEAD
        git commit -m "Emergency rollback: Remove security increment"
        git push origin main
    }
}

Write-Host "📦 Executando build..." -ForegroundColor Yellow
npm run build

Write-Host "🚀 Executando deploy..." -ForegroundColor Yellow
npm run deploy

Write-Host "✅ ROLLBACK CONCLUÍDO! Validando..." -ForegroundColor Green
Start-Sleep -Seconds 10

# Validação automática
$response = Invoke-WebRequest -Uri "https://carlosorvate-tech.github.io/sisgead-2.0/" -UseBasicParsing
if ($response.StatusCode -eq 200) {
    Write-Host "✅ Sistema online e operacional!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro na validação. Status: $($response.StatusCode)" -ForegroundColor Red
}
```

### **Uso do Script:**
```powershell
# Rollback completo para v2.0
.\rollback-emergency.ps1 -Version "v2.0"

# Rollback seletivo mantendo admin
.\rollback-emergency.ps1 -Version "v2.5"

# Rollback removendo só security
.\rollback-emergency.ps1 -Version "v2.7"
```

---

## 📊 **MATRIZ DE DECISÃO DE ROLLBACK**

| Problema | Severidade | Rollback Recomendado | Tempo Estimado |
|----------|------------|---------------------|----------------|
| **Sistema não carrega** | 🔴 Crítica | v2.0 completo | 5 min |
| **Performance muito lenta** | 🟡 Alta | v2.5 seletivo | 10 min |
| **Admin portal com bugs** | 🟡 Alta | v2.0 completo | 5 min |
| **Security issues** | 🟠 Média | v2.7 (sem security) | 8 min |
| **Multi-tenant conflicts** | 🟡 Alta | v2.0 completo | 5 min |
| **Memory leaks** | 🟠 Média | v2.5 seletivo | 10 min |
| **Bundle muito grande** | 🟢 Baixa | Otimização sem rollback | - |

---

## 🔍 **MONITORAMENTO PÓS-ROLLBACK**

### **Checklist de Validação:**
- [ ] ✅ **Homepage carrega** em < 3 segundos
- [ ] ✅ **Questionário DISC** funciona completamente  
- [ ] ✅ **Resultados** são calculados corretamente
- [ ] ✅ **Admin login** aceita credenciais válidas
- [ ] ✅ **Exportação/Importação** de dados funcional
- [ ] ✅ **Smart Hints** estão ativos
- [ ] ✅ **Responsividade** mobile/desktop
- [ ] ✅ **Performance** dentro dos targets v2.0

### **Métricas de Sucesso v2.0:**
```javascript
const v2_0_targets = {
  bundleSize: "< 800KB",
  gzipSize: "< 200KB", 
  timeToInteractive: "< 2.5s",
  memoryUsage: "< 10MB",
  lighthouseScore: "> 90"
};
```

---

## 🚨 **PLANOS DE CONTINGÊNCIA**

### **Cenário Crítico: GitHub Pages Down**
```bash
# Deploy alternativo via Netlify/Vercel
npm run build

# Netlify
npx netlify deploy --prod --dir dist

# Vercel  
npx vercel --prod
```

### **Cenário: Backup Corrompido**
```bash
# Reconstruir v2.0 a partir dos commits
git log --oneline --grep="v2.0" 
git checkout [commit-hash-v2.0-stable]
git checkout -b rebuild-v2.0
```

### **Cenário: Perda Total do Repositório**
1. **Clone do backup**: GitHub maintains automatic backups
2. **Reconstrução**: A partir da documentação completa
3. **Deploy manual**: Upload direto via GitHub interface

---

## 📝 **COMUNICAÇÃO DE ROLLBACK**

### **Template de Comunicação:**
```
🚨 MANUTENÇÃO EMERGENCIAL - SISGEAD 2.0

Prezados usuários,

Identificamos um problema na versão 3.0 multi-tenant e realizamos 
um rollback para a versão 2.0 estável.

• Todas as funcionalidades principais estão funcionando
• Dados dos usuários estão preservados  
• Sistema foi testado e validado

O acesso está normalizado em: https://carlosorvate-tech.github.io/sisgead-2.0/

Tempo de resolução: [X] minutos
Status: ✅ RESOLVIDO

Equipe Técnica SISGEAD
```

---

## ✅ **CHECKLIST DE PREPARAÇÃO**

### **Antes do Deploy v3.0:**
- [ ] ✅ **Tag de backup** v2.0.5-stable criada
- [ ] ✅ **Branches de rollback** configuradas
- [ ] ✅ **Scripts automatizados** testados
- [ ] ✅ **Documentação** atualizada
- [ ] ✅ **Equipe treinada** nos procedimentos
- [ ] ✅ **Monitoramento** configurado
- [ ] ✅ **Comunicação** preparada

### **Pós-Deploy v3.0:**
- [ ] ⏳ **Monitoring ativo** nas primeiras 24h
- [ ] ⏳ **Feedback dos usuários** coletado
- [ ] ⏳ **Métricas de performance** analisadas
- [ ] ⏳ **Logs de erro** monitorizados
- [ ] ⏳ **Rollback decision** baseada em dados

---

## 🎯 **CONCLUSÃO**

O **Plano de Rollback v2.0** garante que:

1. **🚀 Rollback rápido** em caso de emergência (< 5 min)
2. **🔧 Opções seletivas** para manter funcionalidades
3. **📦 Backup completo** da versão estável
4. **⚡ Automação** para reduzir erro humano
5. **📊 Monitoramento** contínuo pós-rollback

**Risk Mitigation**: 🟢 **EXCELENTE** - Risco praticamente eliminado com múltiplas camadas de proteção.

---
**Documento**: Plano de Rollback v2.0  
**Data**: Novembro 2025  
**Autor**: Equipe de Engenharia SISGEAD  
**Aprovação**: ✅ Pronto para Implementação