# 🌊 GUIA COMPLETO - DigitalOcean para SISGEAD 3.0

**Data:** 06/11/2025  
**Objetivo:** Configurar hospedagem web profissional  
**Custo Inicial:** $45-50/mês  

---

## 🎯 O QUE SERÁ CONFIGURADO

```
┌─────────────────────────────────────────────────┐
│              INFRAESTRUTURA                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  1️⃣ DROPLET (Servidor Virtual)                │
│     └─ Ubuntu 22.04                            │
│     └─ 4GB RAM / 2 vCPUs                       │
│     └─ Node.js 20 + PM2                        │
│     └─ Nginx (reverse proxy)                   │
│     └─ $24/mês                                 │
│                                                 │
│  2️⃣ MANAGED DATABASE (PostgreSQL)             │
│     └─ PostgreSQL 16                           │
│     └─ 1GB RAM                                 │
│     └─ Backups automáticos                     │
│     └─ $15/mês                                 │
│                                                 │
│  3️⃣ FIREWALL + SEGURANÇA                      │
│     └─ Regras de acesso                        │
│     └─ SSL/HTTPS automático                    │
│     └─ Grátis                                  │
│                                                 │
│  4️⃣ DOMÍNIO (Opcional)                        │
│     └─ sisgead.com.br                          │
│     └─ $12/ano (~$1/mês)                       │
│                                                 │
└─────────────────────────────────────────────────┘

TOTAL: $40/mês (sem domínio) ou $41/mês (com)
```

---

## 📋 PASSO 1: Criar Conta DigitalOcean

### 1.1 Cadastro
```
1. Acesse: https://www.digitalocean.com/
2. Clique em "Sign Up"
3. Use login do GitHub (recomendado) ou email

Benefício:
✅ $200 créditos grátis (primeiros 60 dias)
✅ Link: https://try.digitalocean.com/freetrialoffer/
```

### 1.2 Adicionar Método de Pagamento
```
Settings → Billing → Add Payment Method

Opções:
- Cartão de crédito (recomendado)
- PayPal

Nota: $5 de cobrança inicial (creditado na conta)
```

---

## 🖥️ PASSO 2: Criar Droplet (Servidor)

### 2.1 Iniciar Criação
```
Dashboard → Create → Droplets
```

### 2.2 Configurações Detalhadas

#### **Choose Region (Região)**
```
✅ RECOMENDADO: New York 3 (NYC3)
   - Latência Brasil: ~120ms
   - Data center moderno
   - Preços competitivos

Alternativas:
- San Francisco 3 (SFO3): ~180ms
- Toronto 1 (TOR1): ~140ms
```

#### **Choose Image (Sistema Operacional)**
```
Distributions → Ubuntu
└─ Ubuntu 22.04 (LTS) x64

✅ Por quê Ubuntu 22.04?
   - LTS (Long Term Support - 5 anos)
   - Mais estável
   - Documentação extensa
   - Node.js 20 compatível
```

#### **Choose Size (Tamanho/Plano)**
```
Droplet Type: Basic
CPU Options: Regular (SSD)

RECOMENDADO PARA INÍCIO:
┌─────────────────────────────────┐
│ $24/mo                          │
│ 4 GB RAM / 2 vCPUs              │
│ 80 GB SSD Disk                  │
│ 4 TB Transfer                   │
└─────────────────────────────────┘

Por quê 4GB?
✅ Node.js API: ~500MB
✅ Nginx: ~50MB
✅ PostgreSQL client: ~100MB
✅ Sistema: ~1GB
✅ Folga: ~2.3GB para crescimento
```

#### **Choose Authentication (SSH Keys)**
```
✅ RECOMENDADO: SSH keys

COMO CRIAR SSH KEY:

Windows (PowerShell):
> ssh-keygen -t ed25519 -C "seuemail@email.com"
  Saved: C:\Users\SEU_USUARIO\.ssh\id_ed25519

Linux/Mac:
$ ssh-keygen -t ed25519 -C "seuemail@email.com"
  Saved: ~/.ssh/id_ed25519

Copiar chave pública:
Windows: > type C:\Users\SEU_USUARIO\.ssh\id_ed25519.pub
Linux/Mac: $ cat ~/.ssh/id_ed25519.pub

Colar no campo "New SSH Key"
```

#### **Hostname & Tags**
```
Hostname: sisgead-api-production

Tags (para organização):
- production
- sisgead
- api
```

#### **Advanced Options**
```
✅ MARCAR:
[x] Enable backups (+$5/mês)
    └─ Backup automático semanal
    └─ Restauração em 1 clique

[x] Enable monitoring (GRÁTIS)
    └─ CPU, RAM, Disk, Network graphs
    └─ Alertas automáticos
```

### 2.3 Criar Droplet
```
Clique em "Create Droplet"
Aguarde ~60 segundos

Resultado:
✅ IP público: XXX.XXX.XXX.XXX
✅ Status: Active (verde)
```

---

## 🗄️ PASSO 3: Criar Managed Database

### 3.1 Iniciar Criação
```
Dashboard → Create → Databases
```

### 3.2 Configurações

#### **Database Engine**
```
PostgreSQL 16
└─ Versão mais recente e estável
```

#### **Choose a Plan**
```
RECOMENDADO PARA INÍCIO:
┌─────────────────────────────────┐
│ Basic                           │
│ $15/mo                          │
│ 1 GB RAM / 1 vCPU               │
│ 10 GB Disk                      │
│ 1 Standby Node                  │
└─────────────────────────────────┘

Benefícios:
✅ Backups diários automáticos (7 dias retenção)
✅ Alta disponibilidade
✅ Escalável (upgrade sem downtime)
```

#### **Region**
```
✅ MESMA REGIÃO DO DROPLET
   └─ New York 3 (NYC3)
   
Por quê?
- Latência mínima (~1ms entre droplet e DB)
- Rede privada (grátis e segura)
```

#### **Database Name**
```
Cluster Name: sisgead-db-production
Database Name: sisgead
```

#### **Trusted Sources**
```
[x] Restrict inbound connections

Adicionar:
1. Seu Droplet (selecionar da lista)
2. Seu IP (para administração remota)
```

### 3.3 Criar Database
```
Clique em "Create Database Cluster"
Aguarde ~5 minutos (provisionamento)

Resultado:
✅ Connection Details (Host, Port, User, Password)
✅ Status: Available (verde)
```

---

## 🔐 PASSO 4: Configurar Firewall

### 4.1 Criar Firewall
```
Networking → Firewalls → Create Firewall
```

### 4.2 Configuração

#### **Name**
```
sisgead-production-firewall
```

#### **Inbound Rules**
```
Tipo        Protocolo  Porta    Origem
────────────────────────────────────────────
SSH         TCP        22       Seu IP apenas
HTTP        TCP        80       All IPv4/IPv6
HTTPS       TCP        443      All IPv4/IPv6

IMPORTANTE:
❌ NÃO abrir porta 3000 (API interna)
❌ NÃO abrir porta 5432 (PostgreSQL)
```

#### **Outbound Rules**
```
Tipo        Protocolo  Porta    Destino
────────────────────────────────────────────
All TCP     TCP        All      All IPv4/IPv6
All UDP     UDP        All      All IPv4/IPv6

(Permite conexões de saída para updates, APIs externas, etc)
```

#### **Apply to Droplets**
```
[x] sisgead-api-production
```

### 4.3 Criar
```
Clique em "Create Firewall"
```

---

## 🌐 PASSO 5: Configurar Domínio (Opcional mas Recomendado)

### 5.1 Comprar Domínio

**Opção A: DigitalOcean (mais fácil)**
```
Networking → Domains → Add Domain
└─ Buscar e comprar (ex: sisgead.com.br)
└─ $12/ano
```

**Opção B: Registro.br (mais barato)**
```
1. https://registro.br/
2. Buscar: sisgead.com.br
3. $40/ano (inclui .br)
```

### 5.2 Configurar DNS

**Se comprou na DigitalOcean:**
```
Domains → sisgead.com.br → Manage

Adicionar Records:

1. A Record:
   Hostname: @
   Will Direct To: sisgead-api-production (seu droplet)
   TTL: 3600

2. A Record:
   Hostname: www
   Will Direct To: sisgead-api-production
   TTL: 3600

3. CNAME Record (para API):
   Hostname: api
   Is an Alias Of: @
   TTL: 3600
```

**Se comprou em outro lugar:**
```
Apontar nameservers para DigitalOcean:
ns1.digitalocean.com
ns2.digitalocean.com
ns3.digitalocean.com

Depois configurar DNS como acima
```

---

## 📊 PASSO 6: Monitoramento

### 6.1 Habilitar Alertas
```
Manage → Monitoring → Alerts → Create Alert Policy

Configurações Recomendadas:

1. CPU Alert:
   Metric: CPU utilization
   Threshold: > 80%
   Duration: 10 minutes
   Notification: Email

2. RAM Alert:
   Metric: Memory utilization
   Threshold: > 85%
   Duration: 5 minutes

3. Disk Alert:
   Metric: Disk utilization
   Threshold: > 80%
   Duration: 10 minutes
```

### 6.2 Uptime Monitoring (Externo - Grátis)
```
Recomendação: UptimeRobot
https://uptimerobot.com/

Setup:
1. Criar conta grátis
2. Add Monitor → HTTP(s)
3. URL: https://seu-dominio.com/health
4. Check interval: 5 minutes
5. Alert via: Email/Telegram/Slack
```

---

## 💰 RESUMO DE CUSTOS

### Configuração Mínima (Início)
```
Droplet 4GB:          $24/mês
PostgreSQL 1GB:       $15/mês
Backups Droplet:      $5/mês
Firewall:             $0 (grátis)
Monitoring:           $0 (grátis)
───────────────────────────────
SUBTOTAL:             $44/mês

Domínio .com.br:      $12/ano ÷ 12 = $1/mês
───────────────────────────────
TOTAL:                $45/mês
```

### Com Créditos ($200 grátis)
```
Você TEM 60 DIAS GRÁTIS!
$200 créditos ÷ $45/mês = ~4.5 meses

Após créditos acabarem:
$45/mês (começa cobrança normal)
```

### Escalabilidade Futura
```
Se precisar crescer:

DROPLET:
4GB ($24) → 8GB ($48) → 16GB ($96)

DATABASE:
1GB ($15) → 2GB ($30) → 4GB ($60)

Exemplo: 50 organizações simultâneas
└─ Droplet 8GB ($48) + DB 4GB ($60) = $108/mês
```

---

## ✅ CHECKLIST FINAL

Antes de prosseguir com instalação:

```
CONTA:
[ ] Conta DigitalOcean criada
[ ] Método de pagamento adicionado
[ ] Créditos $200 ativados

INFRAESTRUTURA:
[ ] Droplet 4GB criado e ativo
[ ] SSH key configurada
[ ] PostgreSQL database provisionado
[ ] Credenciais database salvas

SEGURANÇA:
[ ] Firewall criado e aplicado
[ ] Apenas portas 22, 80, 443 abertas
[ ] Trusted sources configurados no DB

DOMÍNIO (Opcional):
[ ] Domínio registrado
[ ] DNS apontando para Droplet
[ ] Records A e CNAME configurados

MONITORAMENTO:
[ ] Alertas DigitalOcean configurados
[ ] UptimeRobot configurado (opcional)
```

---

## 🚀 PRÓXIMOS PASSOS

Após concluir esta configuração:

1. ✅ **Conectar via SSH**
   ```bash
   ssh root@SEU_DROPLET_IP
   ```

2. ✅ **Instalar Node.js + Nginx**
   (Siga guia DEPLOY_DIGITALOCEAN.md - Fase 2)

3. ✅ **Deploy da API**
   (Backend Sprint 2)

4. ✅ **Configurar SSL/HTTPS**
   (Certbot - automático)

5. ✅ **Deploy Frontend**
   (Build React → Nginx)

---

## 🆘 TROUBLESHOOTING

### Problema: Não consigo conectar via SSH
```
Solução:
1. Verificar se IP está correto
2. Verificar firewall permite porta 22
3. Verificar chave SSH está correta:
   ssh -i ~/.ssh/id_ed25519 root@IP
```

### Problema: Droplet muito lento
```
Verificar:
1. Dashboard → Monitoring → CPU/RAM
2. Se > 80% uso constante → upgrade
3. Verificar processos: htop
```

### Problema: Database não conecta
```
Verificar:
1. Trusted Sources inclui seu Droplet
2. Connection string correta
3. Firewall do DB permite conexão
```

### Problema: Custo muito alto
```
Otimizar:
1. Usar créditos $200 primeiro
2. Droplet menor (2GB = $18/mês)
3. DB menor (512MB = $7/mês)
4. Desabilitar backups (-$5/mês)

Configuração econômica:
Droplet 2GB + DB 512MB = $25/mês
```

---

## 📞 SUPORTE

### DigitalOcean Support
```
Tipo        Plano Necessário    Resposta
───────────────────────────────────────────
Email       Todos (grátis)      24-48h
Ticket      Todos (grátis)      12-24h
Chat        Premium ($20/mês)   < 1h
Phone       Premium ($20/mês)   Imediato
```

### Community
```
- Forum: https://www.digitalocean.com/community
- Tutorials: https://www.digitalocean.com/community/tutorials
- Discord: DigitalOcean Community
```

---

## 🎯 ESTÁ PRONTO PARA COMEÇAR?

Você tem tudo que precisa para configurar a infraestrutura!

**Recomendação:**
1. Configure AGORA (30 minutos)
2. Use créditos grátis enquanto desenvolve
3. Quando backend estiver pronto (Sprint 2), faça deploy

**Custo total:** $0 nos primeiros 4 meses (créditos)

Quer que eu te oriente **passo a passo** durante a configuração? 🚀
