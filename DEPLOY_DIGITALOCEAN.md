# SISGEAD 3.0 - Deploy na DigitalOcean
## Guia Completo de Hospedagem Web

**Data:** 06/11/2025  
**Plataforma:** DigitalOcean  
**Modelo:** Cloud Web Application  
**Custo Estimado:** $50-80/mês (início)

---

## 🎯 Visão Geral

Hospedar o SISGEAD 3.0 como **aplicação web completa** na DigitalOcean, com:

- ✅ **Backend Node.js** (API RESTful)
- ✅ **PostgreSQL Managed** (banco gerenciado)
- ✅ **Frontend React** (build estático servido via Nginx)
- ✅ **SSL/HTTPS** (certificado gratuito)
- ✅ **CI/CD** (deploy automático via GitHub)
- ✅ **Backups diários** (automáticos)
- ✅ **Monitoramento** (uptime + logs)

---

## 💰 Custo Mensal Estimado

### Configuração Inicial (Startup/MVP)
```
Droplet 4GB RAM        $24/mês   (API + Nginx)
PostgreSQL 1GB         $15/mês   (Banco gerenciado)
Spaces (S3-like)       $5/mês    (Uploads/arquivos)
Backups                $5/mês    (Snapshots automáticos)
Domain                 $12/ano   (~$1/mês)
────────────────────────────────
TOTAL:                 ~$50/mês
```

### Configuração Produção (Escalado)
```
Droplet 8GB RAM        $48/mês   (API + mais performance)
PostgreSQL 4GB         $60/mês   (Banco maior)
Load Balancer          $12/mês   (Alta disponibilidade)
Redis 1GB              $15/mês   (Cache)
Spaces                 $5/mês    
Backups                $10/mês   
Monitoring             $0/mês    (nativo DigitalOcean)
────────────────────────────────
TOTAL:                 ~$150/mês
```

---

## 🏗️ Arquitetura na DigitalOcean

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS (443)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               DigitalOcean Load Balancer                    │
│                 (Opcional - Produção)                       │
└────────────┬────────────────────────────────────────────────┘
             │
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│          Droplet (Ubuntu 22.04)  - 4GB RAM / 2 vCPU         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │              NGINX (Reverse Proxy)                │    │
│  │  - SSL/TLS (Let's Encrypt)                        │    │
│  │  - Compressão gzip                                │    │
│  │  - Cache de assets                                │    │
│  │  - Rate limiting                                  │    │
│  └──────┬────────────────────────────────────────────┘    │
│         │                                                  │
│         ├──► /api/*  ──► Node.js API (3000)               │
│         │                                                  │
│         └──► /*      ──► Frontend React (static)          │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │        Node.js Backend (PM2)                      │    │
│  │  - Express API                                    │    │
│  │  - Prisma ORM                                     │    │
│  │  - JWT Auth                                       │    │
│  │  - Port 3000                                      │    │
│  └───────────────────────────────────────────────────┘    │
│                          │                                  │
│                          │ PostgreSQL Connection            │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│      PostgreSQL Managed Database (DigitalOcean)             │
│      - Backups automáticos diários                          │
│      - SSL obrigatório                                      │
│      - Connection pooling                                   │
│      - 1GB RAM inicial                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Spaces (S3-compatible)                         │
│      - Upload de relatórios PDF                             │
│      - Anexos e documentos                                  │
│      - CDN integrado                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Passo a Passo Completo

### FASE 1: Setup Inicial na DigitalOcean

#### 1.1 Criar Conta
```bash
1. Acesse: https://www.digitalocean.com/
2. Cadastre-se (GitHub Login recomendado)
3. Adicione método de pagamento
4. Ganhe $200 créditos (novo usuário): 
   → Use cupom: DO200CREDIT
```

#### 1.2 Criar Droplet (Servidor)
```
1. Dashboard → Create → Droplets
2. Configurações:
   
   Choose Region:
   ├─ São Francisco (SF) ou
   └─ Nova York (NYC) → Latência ~120ms Brasil
   
   Choose Image:
   └─ Ubuntu 22.04 LTS x64
   
   Choose Size:
   └─ Basic
      └─ Regular (SSD)
         └─ $24/mo - 4 GB RAM / 2 vCPUs / 80 GB SSD
   
   Choose Authentication:
   └─ SSH keys (RECOMENDADO)
      ├─ Gere localmente: ssh-keygen -t ed25519
      └─ Cole chave pública (.pub)
   
   Hostname:
   └─ sisgead-api
   
   Tags:
   └─ production, sisgead, api
   
   ✅ Enable Backups (+ $5/mês)
   ✅ Enable Monitoring
```

#### 1.3 Provisionar PostgreSQL
```
1. Dashboard → Create → Databases
2. Configurações:
   
   Database Engine:
   └─ PostgreSQL 16
   
   Choose Size:
   └─ Basic Nodes
      └─ 1 GB RAM / 1 vCPU / 10 GB Disk - $15/mo
   
   Region:
   └─ Mesma do Droplet (baixa latência)
   
   Database Name:
   └─ sisgead-db
   
   ✅ Automatic daily backups (7 dias retenção)
   ✅ Private network only (segurança)
```

#### 1.4 Configurar Firewall
```
1. Networking → Firewalls → Create Firewall

Inbound Rules:
├─ SSH      TCP  22    → Seu IP apenas
├─ HTTP     TCP  80    → All IPv4, All IPv6
├─ HTTPS    TCP  443   → All IPv4, All IPv6
└─ Custom   TCP  3000  → Localhost only (API interna)

Outbound Rules:
└─ All TCP/UDP → All destinations (padrão)

Apply to Droplets:
└─ sisgead-api
```

---

### FASE 2: Configuração do Servidor

#### 2.1 Conectar via SSH
```bash
# Do seu computador local
ssh root@<DROPLET_IP>

# Ou com chave específica
ssh -i ~/.ssh/id_ed25519 root@<DROPLET_IP>
```

#### 2.2 Setup Inicial do Ubuntu
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar essenciais
apt install -y curl git build-essential

# Criar usuário não-root
adduser sisgead
usermod -aG sudo sisgead

# Copiar chave SSH para novo usuário
rsync --archive --chown=sisgead:sisgead ~/.ssh /home/sisgead

# Trocar para novo usuário
su - sisgead
```

#### 2.3 Instalar Node.js 20 LTS
```bash
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar
node --version   # v20.x.x
npm --version    # 10.x.x

# Instalar PM2 global (gerenciador de processos)
sudo npm install -g pm2
```

#### 2.4 Instalar PostgreSQL Client
```bash
# Para migrations e conexão
sudo apt install -y postgresql-client

# Testar conexão com banco gerenciado
# (use credenciais do painel DigitalOcean)
psql -U doadmin -h <DB_HOST> -p 25060 -d sisgead-db --set=sslmode=require
```

#### 2.5 Instalar Nginx
```bash
sudo apt install -y nginx

# Iniciar e habilitar
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar
sudo systemctl status nginx
```

---

### FASE 3: Estrutura do Projeto Backend

#### 3.1 Criar Estrutura de Pastas
```bash
cd /home/sisgead
mkdir -p sisgead-backend
cd sisgead-backend

# Inicializar projeto Node.js
npm init -y
```

#### 3.2 Instalar Dependências
```bash
# Core
npm install express cors helmet compression

# TypeScript
npm install -D typescript @types/node @types/express ts-node nodemon

# Prisma ORM
npm install @prisma/client
npm install -D prisma

# Autenticação
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs

# Validação
npm install zod

# Logs
npm install winston

# Variáveis de ambiente
npm install dotenv

# Rate limiting
npm install express-rate-limit

# CORS
npm install cors
npm install -D @types/cors
```

#### 3.3 Estrutura de Arquivos
```
sisgead-backend/
├── src/
│   ├── domain/               # Entidades e regras de negócio
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── Organization.ts
│   │   │   ├── Talent.ts
│   │   │   └── Assessment.ts
│   │   └── interfaces/
│   │       └── repositories/
│   │
│   ├── application/          # Casos de uso
│   │   ├── use-cases/
│   │   │   ├── auth/
│   │   │   │   ├── LoginUseCase.ts
│   │   │   │   └── RegisterUseCase.ts
│   │   │   ├── users/
│   │   │   └── talents/
│   │   └── dtos/
│   │
│   ├── infrastructure/       # Detalhes técnicos
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   │   └── schema.prisma
│   │   │   └── repositories/
│   │   │       ├── UserRepository.ts
│   │   │       └── TalentRepository.ts
│   │   ├── auth/
│   │   │   ├── JwtService.ts
│   │   │   └── BcryptService.ts
│   │   └── external/
│   │       └── GeminiService.ts
│   │
│   ├── presentation/         # HTTP/Controllers
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── organizations.routes.ts
│   │   │   └── talents.routes.ts
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   └── UsersController.ts
│   │   └── middlewares/
│   │       ├── auth.middleware.ts
│   │       ├── error.middleware.ts
│   │       └── validation.middleware.ts
│   │
│   ├── config/
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   └── logger.ts
│   │
│   └── server.ts            # Entry point
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env
├── .env.example
├── tsconfig.json
├── package.json
└── ecosystem.config.js      # PM2 config
```

#### 3.4 Configurar TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"],
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@domain/*": ["domain/*"],
      "@application/*": ["application/*"],
      "@infrastructure/*": ["infrastructure/*"],
      "@presentation/*": ["presentation/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### 3.5 Configurar Prisma
```bash
# Inicializar Prisma
npx prisma init
```

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Institutions
model Institution {
  id            String   @id @default(uuid())
  name          String
  cnpj          String   @unique
  legalName     String
  segment       String?
  
  // LGPD
  dataController String?
  dpoName        String?
  dpoEmail       String?
  
  // Metadata
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  isActive      Boolean  @default(true)
  
  // Relations
  organizations Organization[]
  users         User[]
  
  @@map("institutions")
}

// Organizations
model Organization {
  id            String   @id @default(uuid())
  institutionId String
  name          String
  description   String?
  code          String?  @unique
  managerId     String?
  
  // Metadata
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  isActive      Boolean  @default(true)
  
  // Relations
  institution   Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
  users         User[]
  talents       Talent[]
  teams         Team[]
  assessments   Assessment[]
  
  @@map("organizations")
  @@index([institutionId])
}

// Users (do sistema)
model User {
  id             String   @id @default(uuid())
  institutionId  String
  organizationId String?
  
  email          String   @unique
  passwordHash   String
  name           String
  cpf            String?  @unique
  
  role           String   // master, admin-org, user, viewer
  phone          String?
  department     String?
  jobTitle       String?
  
  // Auth
  emailVerified  Boolean  @default(false)
  lastLoginAt    DateTime?
  refreshToken   String?
  
  // LGPD
  consentGiven   Boolean  @default(false)
  consentGivenAt DateTime?
  
  // Metadata
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  isActive       Boolean  @default(true)
  
  // Relations
  institution    Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  
  @@map("users")
  @@index([email])
  @@index([institutionId])
  @@index([organizationId])
}

// Talents (pessoas avaliadas)
model Talent {
  id             String   @id @default(uuid())
  organizationId String
  
  name           String
  email          String?
  cpf            String?  // Criptografado
  employeeId     String?
  
  jobTitle       String?
  department     String?
  hireDate       DateTime?
  
  currentProfile String?  // D-I-S-C
  performanceScore Float?
  
  // LGPD
  consentGiven   Boolean  @default(false)
  consentGivenAt DateTime?
  
  // Metadata
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  isActive       Boolean  @default(true)
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  assessments    Assessment[]
  teamMembers    TeamMember[]
  
  @@map("talents")
  @@index([organizationId])
}

// Teams
model Team {
  id             String   @id @default(uuid())
  organizationId String
  
  name           String
  description    String?
  teamType       String?
  leaderId       String?
  
  startDate      DateTime?
  endDate        DateTime?
  
  // Metadata
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  isActive       Boolean  @default(true)
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  members        TeamMember[]
  
  @@map("teams")
  @@index([organizationId])
}

model TeamMember {
  id        String   @id @default(uuid())
  teamId    String
  talentId  String
  
  role      String?
  allocation Int     @default(100)
  
  joinedAt  DateTime
  leftAt    DateTime?
  
  // Relations
  team      Team   @relation(fields: [teamId], references: [id], onDelete: Cascade)
  talent    Talent @relation(fields: [talentId], references: [id], onDelete: Cascade)
  
  @@unique([teamId, talentId, joinedAt])
  @@map("team_members")
}

// Assessments
model Assessment {
  id             String   @id @default(uuid())
  organizationId String
  talentId       String?
  
  assessmentType String   // DISC, 360, Performance
  status         String   // Pending, InProgress, Completed
  
  evaluatorId    String?
  approverId     String?
  
  scheduledDate  DateTime?
  startedAt      DateTime?
  completedAt    DateTime?
  approvedAt     DateTime?
  
  questions      Json?
  answers        Json?
  results        Json?
  
  notes          String?
  
  // Metadata
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  talent         Talent? @relation(fields: [talentId], references: [id], onDelete: SetNull)
  
  @@map("assessments")
  @@index([organizationId])
  @@index([talentId])
}

// Audit Logs
model AuditLog {
  id          String   @id @default(uuid())
  
  userId      String?
  userEmail   String?
  userRole    String?
  userIp      String?
  
  action      String   // CREATE, READ, UPDATE, DELETE
  entityType  String
  entityId    String?
  
  changes     Json?
  
  timestamp   DateTime @default(now())
  
  hash        String
  previousHash String?
  
  @@map("audit_logs")
  @@index([userId])
  @@index([timestamp])
  @@index([entityType, entityId])
}
```

#### 3.6 Configurar Variáveis de Ambiente
```bash
# .env
NODE_ENV=production
PORT=3000

# Database (Pegar do painel DigitalOcean)
DATABASE_URL="postgresql://doadmin:PASSWORD@HOST:25060/sisgead-db?sslmode=require"

# JWT
JWT_SECRET="gere-um-secret-forte-aqui-64-caracteres-minimo"
JWT_REFRESH_SECRET="outro-secret-diferente-64-caracteres"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption (para CPF, dados sensíveis)
ENCRYPTION_KEY="chave-32-bytes-base64-encoded"

# LGPD
DPO_EMAIL="dpo@sisgead.com"
DATA_RETENTION_DAYS=1825

# API
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Gemini (opcional)
GEMINI_API_KEY=""

# Frontend URL (para CORS)
FRONTEND_URL="https://sisgead.com.br"
```

#### 3.7 Server Entry Point
```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import logger from './config/logger';
import errorMiddleware from './presentation/middlewares/error.middleware';

// Routes
import authRoutes from './presentation/routes/auth.routes';
import usersRoutes from './presentation/routes/users.routes';
import organizationsRoutes from './presentation/routes/organizations.routes';
import talentsRoutes from './presentation/routes/talents.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(compression()); // Gzip compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/organizations', organizationsRoutes);
app.use('/api/v1/talents', talentsRoutes);

// Error handling
app.use(errorMiddleware);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 SISGEAD API running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
```

---

### FASE 4: Deploy Backend

#### 4.1 Gerar Build
```bash
# No servidor
cd /home/sisgead/sisgead-backend

# Executar migrations
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate

# Build TypeScript
npm run build

# Resultado em: dist/
```

#### 4.2 Configurar PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'sisgead-api',
    script: './dist/server.js',
    instances: 2, // Cluster mode (2x CPU cores)
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

```bash
# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração (inicia no boot)
pm2 save
pm2 startup

# Monitorar
pm2 monit

# Logs
pm2 logs sisgead-api
```

---

### FASE 5: Configurar Nginx

#### 5.1 Configuração Nginx
```nginx
# /etc/nginx/sites-available/sisgead

upstream api_backend {
    least_conn;
    server 127.0.0.1:3000;
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name sisgead.com.br www.sisgead.com.br;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name sisgead.com.br www.sisgead.com.br;
    
    # SSL (configurar depois com Certbot)
    ssl_certificate /etc/letsencrypt/live/sisgead.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sisgead.com.br/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logs
    access_log /var/log/nginx/sisgead_access.log;
    error_log /var/log/nginx/sisgead_error.log;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;
    
    # Frontend (React build)
    location / {
        root /var/www/sisgead/frontend;
        try_files $uri $uri/ /index.html;
        
        # Cache assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check
    location /health {
        proxy_pass http://api_backend;
        access_log off;
    }
}
```

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/sisgead /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

#### 5.2 Instalar SSL (Let's Encrypt)
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d sisgead.com.br -d www.sisgead.com.br

# Renovação automática (certbot cria cron job automaticamente)
# Testar renovação:
sudo certbot renew --dry-run
```

---

### FASE 6: Deploy Frontend React

#### 6.1 Build Local do Frontend
```bash
# No seu computador (repositório atual)
cd c:\w\sisgead-3.0-repo

# Build otimizado
npm run build

# Resultado em: dist/
```

#### 6.2 Upload para Servidor
```bash
# Do seu computador
scp -r dist/* sisgead@<DROPLET_IP>:/tmp/frontend-build/

# No servidor
sudo mkdir -p /var/www/sisgead/frontend
sudo mv /tmp/frontend-build/* /var/www/sisgead/frontend/
sudo chown -R www-data:www-data /var/www/sisgead/frontend
```

---

### FASE 7: CI/CD com GitHub Actions

#### 7.1 Secrets no GitHub
```
Settings → Secrets and variables → Actions → New repository secret

DROPLET_IP:          <IP do servidor>
DROPLET_USER:        sisgead
SSH_PRIVATE_KEY:     <conteúdo da chave privada SSH>
DATABASE_URL:        <URL do PostgreSQL>
JWT_SECRET:          <secret JWT>
```

#### 7.2 Workflow GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to DigitalOcean

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build frontend
      run: npm run build
    
    - name: Setup SSH
      uses: webfactory/ssh-agent@v0.8.0
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
    
    - name: Deploy to DigitalOcean
      env:
        DROPLET_IP: ${{ secrets.DROPLET_IP }}
        DROPLET_USER: ${{ secrets.DROPLET_USER }}
      run: |
        # Upload frontend build
        scp -o StrictHostKeyChecking=no -r dist/* $DROPLET_USER@$DROPLET_IP:/tmp/frontend-build/
        
        # Deploy no servidor
        ssh -o StrictHostKeyChecking=no $DROPLET_USER@$DROPLET_IP << 'EOF'
          # Backup frontend antigo
          sudo mv /var/www/sisgead/frontend /var/www/sisgead/frontend.backup.$(date +%Y%m%d_%H%M%S)
          
          # Deploy novo frontend
          sudo mkdir -p /var/www/sisgead/frontend
          sudo mv /tmp/frontend-build/* /var/www/sisgead/frontend/
          sudo chown -R www-data:www-data /var/www/sisgead/frontend
          
          # Atualizar backend (se houver mudanças)
          cd /home/sisgead/sisgead-backend
          git pull origin main
          npm install
          npm run build
          npx prisma migrate deploy
          pm2 reload sisgead-api
          
          # Limpar builds antigos (manter últimos 5)
          ls -t /var/www/sisgead/ | grep "frontend.backup" | tail -n +6 | xargs -I {} sudo rm -rf /var/www/sisgead/{}
        EOF
    
    - name: Notify success
      if: success()
      run: echo "✅ Deploy realizado com sucesso!"
    
    - name: Notify failure
      if: failure()
      run: echo "❌ Deploy falhou!"
```

---

## 📊 Monitoramento e Manutenção

### Logs
```bash
# Nginx
sudo tail -f /var/log/nginx/sisgead_access.log
sudo tail -f /var/log/nginx/sisgead_error.log

# API (PM2)
pm2 logs sisgead-api

# PostgreSQL (no painel DigitalOcean)
Dashboard → Databases → sisgead-db → Metrics
```

### Backups
```bash
# PostgreSQL: Automático diário (DigitalOcean)
# Droplet: Snapshots semanais (DigitalOcean)

# Backup manual banco
pg_dump -h <DB_HOST> -U doadmin -d sisgead-db --set=sslmode=require > backup_$(date +%Y%m%d).sql
```

### Monitoramento
```bash
# CPU/RAM/Disk
htop
df -h

# PM2 Dashboard
pm2 monit

# Uptime Robot (externo - gratuito)
https://uptimerobot.com/
→ Monitor HTTPS + /health endpoint
```

---

## 🎯 Checklist de Deploy

```
Setup Inicial:
 ✅ Criar conta DigitalOcean
 ✅ Provisionar Droplet 4GB
 ✅ Provisionar PostgreSQL Managed
 ✅ Configurar firewall
 ✅ Configurar domínio (DNS)

Servidor:
 ✅ Conectar via SSH
 ✅ Instalar Node.js 20
 ✅ Instalar PM2
 ✅ Instalar Nginx
 ✅ Instalar Certbot

Backend:
 ✅ Estrutura de pastas
 ✅ Instalar dependências
 ✅ Configurar Prisma
 ✅ Criar migrations
 ✅ Configurar .env
 ✅ Build TypeScript
 ✅ Iniciar PM2

Nginx:
 ✅ Configurar reverse proxy
 ✅ Gerar SSL (Let's Encrypt)
 ✅ Testar HTTPS

Frontend:
 ✅ Build local
 ✅ Upload para servidor
 ✅ Testar acesso

CI/CD:
 ✅ Configurar secrets GitHub
 ✅ Criar workflow
 ✅ Testar deploy automático

Segurança:
 ✅ SSH com chave
 ✅ Firewall configurado
 ✅ SSL ativo
 ✅ Rate limiting
 ✅ Headers de segurança

Monitoramento:
 ✅ PM2 logs
 ✅ Nginx logs
 ✅ Uptime monitoring
 ✅ Backups automáticos
```

---

## 💡 Próximos Passos

1. ✅ **Aprovar arquitetura** DigitalOcean
2. 🚀 **Criar estrutura backend** (Fase 1-3)
3. 🔧 **Desenvolver API** (Fase 4-6)
4. 📱 **Migrar frontend** (consumir API)
5. 🚀 **Deploy produção**

**Quer que eu comece criando a estrutura do backend?** 🎯
