# SISGEAD 3.0 - Suite Híbrida SPA (Single Page Application)
## Aproveitamento Total do v2.0 + Arquitetura Web/Local

**Data:** 06/11/2025  
**Objetivo:** Pivotar para SPA híbrida que funcione hospedada (DigitalOcean) OU instalada localmente  
**Estratégia:** Reutilizar 100% da lógica DISC, UI e componentes do v2.0

---

## 🎯 ANÁLISE DO SISGEAD 2.0 - O que já temos

### ✅ COMPONENTES REUTILIZÁVEIS 100%

#### 1. **Lógica de Negócio DISC (CORE)**
```typescript
// Já implementados e funcionais:
- Cálculo de perfil DISC ✅
- Questionário de 24 perguntas ✅
- Algoritmo de pontuação ✅
- Geração de relatórios ✅
- Análise de compatibilidade de equipes ✅
- Sugestões baseadas em perfis ✅
```

**Arquivos:** 
- Componentes de avaliação
- Lógica de cálculo embutida
- Sistema de scoring

#### 2. **Componentes UI Modernos (REACT)**
```typescript
Componentes prontos:
├── AdminDashboard.tsx        ✅ Dashboard executivo
├── AdminPortal.tsx           ✅ Portal principal
├── TeamBuilder.tsx           ✅ Construtor de equipes
├── UserPortal.tsx            ✅ Portal colaborador
├── ResultsScreen.tsx         ✅ Exibição de resultados
├── SmartHints.tsx            ✅ Sistema de dicas UX
├── AiAssistant.tsx           ✅ Assistente IA
├── Modal.tsx                 ✅ Sistema de modais
└── ErrorBoundary.tsx         ✅ Error handling
```

**Status:** Todos funcionais, testados, responsivos

#### 3. **Services (Integração IA + Storage)**
```typescript
Services existentes:
├── geminiService.ts          ✅ Integração Google Gemini
├── auditService.ts           ✅ Logs e auditoria
├── complianceService.ts      ✅ LGPD compliance
├── securityMonitor.ts        ✅ Segurança
├── tenantManager.ts          ✅ Multi-tenant
└── assessmentService.ts      ✅ Gestão de avaliações
```

#### 4. **Storage Layer (Utils)**
```typescript
Camada de persistência:
├── db.ts                     ✅ IndexedDB abstraction
├── fileSystem.ts             ✅ File System API
├── storage.ts                ✅ localStorage utils
└── tenantStorage.ts          ✅ Multi-tenant storage
```

**Capacidade:** Já gerencia dados localmente com IndexedDB + File System API

#### 5. **Tipos TypeScript Completos**
```typescript
Types definidos:
├── types.ts                  ✅ Tipos base DISC
├── institutional.ts          ✅ Tipos multi-tenant
├── security.ts               ✅ Tipos segurança/LGPD
└── premium/*.ts              ✅ Tipos v3.0 Premium
```

---

## 🔄 ESTRATÉGIA DE PIVOTAGEM - Arquitetura Híbrida

### Conceito: **Um Código, Dois Modos**

```
┌─────────────────────────────────────────────────────────────┐
│                  SISGEAD 3.0 CORE                           │
│          (Lógica DISC + UI + Componentes)                   │
│                    100% Reuso v2.0                          │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
┌───────────────────┐   ┌───────────────────┐
│   MODO WEB        │   │   MODO LOCAL      │
│   (Hospedado)     │   │   (Instalado)     │
├───────────────────┤   ├───────────────────┤
│ Storage:          │   │ Storage:          │
│ └─ PostgreSQL     │   │ └─ SQLite         │
│ Auth:             │   │ Auth:             │
│ └─ JWT/API        │   │ └─ Local          │
│ Deploy:           │   │ Deploy:           │
│ └─ DigitalOcean   │   │ └─ Electron/Tauri │
│ Multi-tenant: ✅  │   │ Multi-tenant: ❌  │
│ Backend: Node.js  │   │ Backend: N/A      │
└───────────────────┘   └───────────────────┘
```

---

## 🏗️ ARQUITETURA PROPOSTA

### 1. **Storage Adapter Pattern** (Chave da Solução)

```typescript
// src/storage/StorageAdapter.ts
export interface StorageAdapter {
  // CRUD operations
  save<T>(key: string, data: T): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  list(pattern?: string): Promise<string[]>;
  
  // Queries
  query<T>(collection: string, filter: Filter): Promise<T[]>;
  
  // Transactions
  transaction(operations: Operation[]): Promise<void>;
}

// Implementações:

// 1. Para modo LOCAL (SQLite)
export class LocalStorageAdapter implements StorageAdapter {
  private db: SQLite.Database;
  
  constructor() {
    // SQLite embarcado via better-sqlite3 ou sql.js
    this.db = new SQLite('sisgead-local.db');
  }
  
  async save<T>(key: string, data: T): Promise<void> {
    // INSERT INTO storage (key, value, timestamp)
    const sql = `INSERT OR REPLACE INTO storage 
                 VALUES (?, ?, ?)`;
    this.db.run(sql, [key, JSON.stringify(data), Date.now()]);
  }
  
  async get<T>(key: string): Promise<T | null> {
    const row = this.db.get('SELECT value FROM storage WHERE key = ?', key);
    return row ? JSON.parse(row.value) : null;
  }
}

// 2. Para modo WEB (API REST)
export class APIStorageAdapter implements StorageAdapter {
  private baseURL: string;
  private token?: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }
  
  async save<T>(key: string, data: T): Promise<void> {
    await axios.post(`${this.baseURL}/api/v1/storage`, {
      key,
      data
    }, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    const response = await axios.get(`${this.baseURL}/api/v1/storage/${key}`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }
}

// 3. Factory que decide qual usar
export class StorageFactory {
  static create(): StorageAdapter {
    const mode = process.env.REACT_APP_MODE; // 'web' | 'local'
    
    if (mode === 'local' || window.electron) {
      return new LocalStorageAdapter();
    } else {
      const apiURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      return new APIStorageAdapter(apiURL);
    }
  }
}

// Uso nos services (transparente!):
const storage = StorageFactory.create();
await storage.save('documents', documents);
const docs = await storage.get('documents');
```

### 2. **Estrutura de Código Unificada**

```
sisgead-3.0-repo/
├── src/
│   ├── core/                    # ✅ 100% REUSO v2.0
│   │   ├── disc/               # Lógica DISC
│   │   │   ├── calculator.ts
│   │   │   ├── questionnaire.ts
│   │   │   ├── profiles.ts
│   │   │   └── compatibility.ts
│   │   ├── team/               # Lógica de equipes
│   │   └── reports/            # Geração de relatórios
│   │
│   ├── ui/                     # ✅ 100% REUSO v2.0
│   │   ├── components/        # Componentes React
│   │   ├── layouts/           # Layouts
│   │   └── styles/            # CSS/Tailwind
│   │
│   ├── storage/               # 🆕 NOVO - Camada abstrata
│   │   ├── StorageAdapter.ts
│   │   ├── LocalAdapter.ts    # SQLite (Electron)
│   │   ├── APIAdapter.ts      # REST API (Web)
│   │   └── Factory.ts
│   │
│   ├── auth/                  # 🔄 REFATORAR
│   │   ├── AuthAdapter.ts
│   │   ├── LocalAuth.ts       # Simples (local)
│   │   └── JWTAuth.ts         # JWT (web)
│   │
│   ├── services/              # ✅ MANTER mas usar adapters
│   │   ├── geminiService.ts
│   │   ├── auditService.ts
│   │   └── ...
│   │
│   └── App.tsx                # 🔄 Detectar modo
│
├── backend/                   # 🆕 NOVO - Só para modo WEB
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── electron/                  # 🆕 NOVO - Só para modo LOCAL
│   ├── main.js               # Electron main process
│   ├── preload.js
│   └── package.json
│
├── public/
├── package.json              # Frontend comum
└── vite.config.ts
```

### 3. **Detecção Automática de Modo**

```typescript
// src/config/environment.ts
export const AppEnvironment = {
  mode: detectMode(),
  isWeb: detectMode() === 'web',
  isLocal: detectMode() === 'local',
  apiURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  features: {
    multiTenant: detectMode() === 'web', // Só web
    offline: true, // Ambos
    ai: true, // Ambos (API key configurável)
  }
};

function detectMode(): 'web' | 'local' {
  // 1. Se rodando em Electron
  if (window.electron) return 'local';
  
  // 2. Se tem variável de ambiente
  if (process.env.REACT_APP_MODE) return process.env.REACT_APP_MODE as any;
  
  // 3. Se está em domínio conhecido
  if (window.location.hostname.includes('sisgead.com')) return 'web';
  
  // 4. Padrão: web
  return 'web';
}
```

```typescript
// src/App.tsx (modificado)
import { AppEnvironment } from './config/environment';
import { StorageFactory } from './storage/Factory';

function App() {
  const [storage] = useState(() => StorageFactory.create());
  
  useEffect(() => {
    console.log(`🚀 SISGEAD 3.0 iniciando em modo: ${AppEnvironment.mode}`);
    
    if (AppEnvironment.isLocal) {
      console.log('📦 Usando SQLite local');
    } else {
      console.log(`🌐 Conectando à API: ${AppEnvironment.apiURL}`);
    }
  }, []);
  
  return (
    <StorageContext.Provider value={storage}>
      {/* Resto da aplicação igual ao v2.0 */}
      <Router>
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/user" element={<UserPortal />} />
        </Routes>
      </Router>
    </StorageContext.Provider>
  );
}
```

---

## 📦 DISTRIBUIÇÃO

### Modo WEB (Hospedado)

```bash
# Build para web
npm run build:web

# Deploy DigitalOcean
npm run deploy:web

# Resultado:
https://sisgead.com.br (frontend)
https://api.sisgead.com.br (backend)
```

**Características:**
- ✅ Multi-tenant (várias instituições)
- ✅ Backend Node.js + PostgreSQL
- ✅ Autenticação JWT
- ✅ Escalável
- ✅ Acessível de qualquer lugar

### Modo LOCAL (Instalado)

```bash
# Build para desktop
npm run build:electron

# Resultado:
dist/
├── SISGEAD-3.0-Setup-1.0.0.exe  (Windows)
├── SISGEAD-3.0-1.0.0.dmg        (macOS)
└── sisgead-3.0_1.0.0_amd64.deb  (Linux)
```

**Características:**
- ✅ Instalação local (.exe/.dmg/.deb)
- ✅ SQLite embarcado
- ✅ Funciona 100% offline
- ✅ Sem necessidade de servidor
- ✅ Dados ficam na máquina
- ✅ Auto-updater integrado

---

## 🔧 IMPLEMENTAÇÃO PRÁTICA

### Fase 1: Preparação (1 semana)

#### Task 1.1: Extrair Core DISC
```bash
# Criar módulo independente com lógica DISC
src/core/disc/
├── calculator.ts      # Cálculo de perfil
├── questionnaire.ts   # Questionário
├── profiles.ts        # Definições DISC
├── compatibility.ts   # Análise de equipes
└── index.ts          # Exports públicos
```

**Código:**
```typescript
// src/core/disc/calculator.ts
export interface DISCAnswers {
  [key: string]: 'A' | 'B' | 'C' | 'D';
}

export interface DISCProfile {
  D: number; // Dominância
  I: number; // Influência
  S: number; // Estabilidade
  C: number; // Conformidade
  primaryProfile: string;
  graph: number[];
}

export class DISCCalculator {
  static calculate(answers: DISCAnswers): DISCProfile {
    // Lógica atual do v2.0
    // Copiar de AdminPortal.tsx / UserPortal.tsx
    const scores = this.calculateScores(answers);
    const profile = this.determineProfile(scores);
    return profile;
  }
  
  private static calculateScores(answers: DISCAnswers) {
    // Algoritmo DISC do v2.0
  }
  
  private static determineProfile(scores: any): DISCProfile {
    // Lógica de determinação do perfil
  }
}
```

#### Task 1.2: Criar Storage Adapters
```bash
# Implementar camada de abstração
src/storage/
├── StorageAdapter.ts      # Interface
├── LocalStorageAdapter.ts # IndexedDB (atual)
├── SQLiteAdapter.ts       # SQLite (Electron)
├── APIAdapter.ts          # REST API (Web)
└── Factory.ts             # Factory pattern
```

#### Task 1.3: Refatorar Services
```typescript
// Antes (v2.0):
const docs = JSON.parse(localStorage.getItem('documents') || '[]');

// Depois (v3.0):
import { useStorage } from './storage/Factory';

const storage = useStorage();
const docs = await storage.get<Document[]>('documents') || [];
```

### Fase 2: Backend Minimalista (1 semana)

#### Task 2.1: Setup Express + Prisma
```bash
cd backend
npm init -y
npm install express @prisma/client bcryptjs jsonwebtoken
npm install -D typescript @types/express prisma
npx prisma init
```

#### Task 2.2: Schema PostgreSQL Simplificado
```prisma
// backend/prisma/schema.prisma
model Institution {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  
  organizations Organization[]
  users         User[]
}

model Organization {
  id            String   @id @default(uuid())
  institutionId String
  name          String
  
  institution Institution @relation(fields: [institutionId], references: [id])
  users       User[]
  documents   Document[]
  assessments Assessment[]
}

model User {
  id             String   @id @default(uuid())
  institutionId  String
  organizationId String?
  email          String   @unique
  passwordHash   String
  name           String
  role           String   // master, admin-org, user
  
  institution  Institution  @relation(fields: [institutionId], references: [id])
  organization Organization? @relation(fields: [organizationId], references: [id])
}

model Document {
  id             String   @id @default(uuid())
  organizationId String
  title          String
  content        Json     // Dados DISC flexíveis
  createdAt      DateTime @default(now())
  
  organization Organization @relation(fields: [organizationId], references: [id])
}

model Assessment {
  id             String   @id @default(uuid())
  organizationId String
  answers        Json     // Respostas DISC
  results        Json     // Perfil calculado
  completedAt    DateTime @default(now())
  
  organization Organization @relation(fields: [organizationId], references: [id])
}
```

#### Task 2.3: API Endpoints Essenciais
```typescript
// backend/src/routes/api.ts
POST   /api/v1/auth/login          # Login
POST   /api/v1/auth/register       # Registro instituição

GET    /api/v1/documents           # Listar documentos
POST   /api/v1/documents           # Criar documento
GET    /api/v1/documents/:id       # Ver documento
PUT    /api/v1/documents/:id       # Atualizar
DELETE /api/v1/documents/:id       # Deletar

POST   /api/v1/assessments         # Criar avaliação
GET    /api/v1/assessments         # Listar avaliações

// Storage genérico (key-value)
GET    /api/v1/storage/:key        # Pegar qualquer dado
POST   /api/v1/storage             # Salvar qualquer dado
```

### Fase 3: Electron Packaging (1 semana)

#### Task 3.1: Setup Electron
```bash
npm install -D electron electron-builder
npm install better-sqlite3  # SQLite para Node.js
```

```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  
  // Modo dev: Vite
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // Modo produção: build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'sisgead.db');
  db = new Database(dbPath);
  
  // Criar tabelas
  db.exec(`
    CREATE TABLE IF NOT EXISTS storage (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `);
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();
});
```

```javascript
// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');
const Database = require('better-sqlite3');

// Expor API segura para frontend
contextBridge.exposeInMainWorld('electron', {
  // Identificador de modo
  isElectron: true,
  
  // Storage SQLite
  storage: {
    save: (key, value) => ipcRenderer.invoke('storage:save', key, value),
    get: (key) => ipcRenderer.invoke('storage:get', key),
    delete: (key) => ipcRenderer.invoke('storage:delete', key),
    list: () => ipcRenderer.invoke('storage:list')
  },
  
  // File operations
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
  saveFile: (content) => ipcRenderer.invoke('dialog:saveFile', content)
});
```

#### Task 3.2: Build Scripts
```json
// package.json
{
  "name": "sisgead-3.0",
  "version": "3.0.0",
  "scripts": {
    "dev": "vite",
    "build:web": "vite build",
    "build:electron": "vite build && electron-builder",
    "electron:dev": "concurrently \"vite\" \"electron electron/main.js\"",
    "deploy:web": "npm run build:web && ./deploy.sh"
  },
  "build": {
    "appId": "com.infinitus.sisgead",
    "productName": "SISGEAD 3.0",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "public/icon.icns"
    },
    "linux": {
      "target": ["deb", "rpm"],
      "icon": "public/icon.png"
    }
  }
}
```

### Fase 4: Migração de Dados v2.0 → v3.0 (3 dias)

```typescript
// src/utils/migratev2tov3.ts
export async function migrateFromV2() {
  console.log('🔄 Migrando dados SISGEAD 2.0 → 3.0...');
  
  const storage = StorageFactory.create();
  
  // 1. Ler dados v2.0 do localStorage
  const v2Documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const v2Metadata = JSON.parse(localStorage.getItem('metadata') || '[]');
  
  // 2. Converter para formato v3.0
  const v3Documents = v2Documents.map(doc => ({
    id: doc.id || uuidv4(),
    organizationId: 'default-org', // Primeira organização
    title: doc.timestamp,
    content: doc,
    createdAt: doc.timestamp
  }));
  
  // 3. Salvar no novo storage (SQLite ou API)
  await storage.save('documents', v3Documents);
  
  // 4. Criar backup do v2.0
  const backup = {
    version: '2.0',
    timestamp: new Date().toISOString(),
    data: { documents: v2Documents, metadata: v2Metadata }
  };
  await storage.save('backup_v2', backup);
  
  console.log('✅ Migração concluída!');
  console.log(`📊 Migrados: ${v3Documents.length} documentos`);
}
```

---

## 📊 COMPARAÇÃO: Antes vs Depois

### SISGEAD 2.0 (Atual)
```
Arquitetura:
├── Frontend: React 19 + TypeScript ✅
├── Storage: localStorage + IndexedDB ⚠️
├── Deploy: GitHub Pages (estático) ✅
├── Multi-user: Não ❌
├── Backend: Nenhum ❌
└── Instalável: Não ❌

Limitações:
- Dados presos no navegador
- Sem multi-tenant
- Sem colaboração em tempo real
```

### SISGEAD 3.0 Híbrido (Novo)
```
Modo WEB:
├── Frontend: React 19 + TypeScript ✅
├── Storage: PostgreSQL (API) ✅
├── Deploy: DigitalOcean ✅
├── Multi-user: Sim ✅
├── Backend: Node.js + Express ✅
└── Colaborativo: Sim ✅

Modo LOCAL:
├── Frontend: React 19 + TypeScript ✅
├── Storage: SQLite embarcado ✅
├── Deploy: Instalador (.exe/.dmg) ✅
├── Multi-user: Não (single-user) ✅
├── Backend: Nenhum (standalone) ✅
└── Offline: 100% ✅

Reutilização v2.0:
✅ 100% Lógica DISC
✅ 100% Componentes UI
✅ 100% Services (com adapters)
✅ 100% Design/UX
```

---

## 🎯 CRONOGRAMA REALISTA

### Sprint 1: Preparação (1 semana)
- ✅ Extrair core DISC em módulo independente
- ✅ Criar Storage Adapter pattern
- ✅ Implementar LocalStorageAdapter (IndexedDB - atual)
- ✅ Refatorar services para usar adapters
- ✅ Testes unitários da lógica DISC

### Sprint 2: Backend Web (1 semana)
- ✅ Setup Express + TypeScript + Prisma
- ✅ Schema PostgreSQL simplificado
- ✅ Endpoints essenciais (auth + CRUD)
- ✅ Implementar APIStorageAdapter
- ✅ Deploy DigitalOcean (teste)

### Sprint 3: Frontend Híbrido (1 semana)
- ✅ Detecção automática de modo (web/local)
- ✅ Refatorar App.tsx para suportar ambos
- ✅ Implementar SQLiteAdapter (Electron)
- ✅ Testes integração (ambos os modos)

### Sprint 4: Electron Desktop (1 semana)
- ✅ Setup Electron + builder
- ✅ Main process + preload script
- ✅ Integração SQLite
- ✅ Build instaladores (Windows/Mac/Linux)
- ✅ Auto-updater

### Sprint 5: Migração e Testes (1 semana)
- ✅ Script migração v2.0 → v3.0
- ✅ Testes end-to-end (web + local)
- ✅ Performance optimization
- ✅ Documentação completa

### Sprint 6: Deploy Final (3 dias)
- ✅ Deploy produção DigitalOcean
- ✅ Releases instaladores (GitHub Releases)
- ✅ Monitoramento + logs
- ✅ Guias de uso

**Total: ~6 semanas**

---

## 💰 CUSTO

### Modo WEB (Hospedado)
```
DigitalOcean:
├── Droplet 4GB     $24/mês
├── PostgreSQL 1GB  $15/mês
├── Backups         $5/mês
└── Domain          $1/mês
─────────────────────────
TOTAL:              $45/mês
```

### Modo LOCAL (Instalado)
```
Desenvolvimento:
└── $0 (uso de ferramentas gratuitas)

Distribuição:
└── GitHub Releases (gratuito)
```

---

## 🚀 VANTAGENS DA ARQUITETURA HÍBRIDA

### Para Usuários
✅ **Flexibilidade:** Escolhe entre web ou local  
✅ **Offline:** Modo local funciona sem internet  
✅ **Dados seguros:** Local = dados na máquina, Web = backup na nuvem  
✅ **Performance:** Local é mais rápido  
✅ **Colaboração:** Modo web permite múltiplos usuários  

### Para Negócio
✅ **Mais mercado:** Atende clientes web E desktop  
✅ **Receita recorrente:** Modo web (SaaS)  
✅ **Licença perpétua:** Modo local (venda única)  
✅ **Diferencial:** Poucos concorrentes têm ambos  

### Para Desenvolvimento
✅ **Código único:** DRY (Don't Repeat Yourself)  
✅ **Manutenção simples:** Bug fix em um lugar  
✅ **Evolução rápida:** Features em ambos simultaneamente  
✅ **Testável:** Mesma lógica, contextos diferentes  

---

## 📋 PRÓXIMOS PASSOS

### Opção A: Começar Sprint 1 AGORA
```bash
# 1. Criar branch nova
git checkout -b feature/hybrid-spa

# 2. Extrair core DISC
mkdir -p src/core/disc
# Copiar lógica de cálculo para módulo isolado

# 3. Implementar Storage Adapters
mkdir -p src/storage
# Criar interfaces e adapters
```

### Opção B: Validar Arquitetura
- Revisar detalhes técnicos
- Ajustar cronograma
- Definir prioridades

### Opção C: Protótipo Rápido
- Criar POC (Proof of Concept) em 2 dias
- Testar viabilidade Storage Adapters
- Validar Electron + SQLite

---

## ❓ DECISÕES PENDENTES

1. **SQLite vs IndexedDB no Electron?**
   - SQLite: Mais robusto, queries SQL
   - IndexedDB: Mesmo código do navegador
   - **Recomendação:** SQLite (melhor para desktop)

2. **Electron vs Tauri?**
   - Electron: Mais maduro, grande comunidade
   - Tauri: Mais leve, Rust-based
   - **Recomendação:** Electron (estabilidade)

3. **Manter v2.0 em paralelo?**
   - Sim: Garantir rollback
   - Não: Focar no v3.0
   - **Recomendação:** Sim (branch separada)

---

## 🎯 CONCLUSÃO

A **arquitetura híbrida SPA** permite:

✅ **Reutilizar 100%** do SISGEAD 2.0  
✅ **Dois produtos** em um código  
✅ **Flexibilidade** para clientes  
✅ **Escalabilidade** (web) + **Performance** (local)  
✅ **Manutenção simplificada**  

**Pronto para começar?** 🚀

Escolha uma opção:
- **"sprint1"** → Começar desenvolvimento AGORA
- **"revisar"** → Discutir detalhes técnicos
- **"poc"** → Criar protótipo de validação
