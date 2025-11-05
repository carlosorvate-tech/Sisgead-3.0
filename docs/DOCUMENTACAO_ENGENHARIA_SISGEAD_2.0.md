# DOCUMENTAÇÃO DE ENGENHARIA DE SOFTWARE
## Sistema de Gestão de Equipes de Alto Desempenho (SISGEAD 2.0)

---

**Versão:** 2.0 (Revolução Tecnológica com IA Integrada)  
**Data:** 3 de novembro de 2025  
**Stack:** React 19 + TypeScript + Vite + Google Gemini AI  
**Arquitetura:** Serverless + AI-First + Modern CSS + PWA  

---

## SUMÁRIO

1. [Visão Geral da Engenharia](#1-visão-geral-da-engenharia)
2. [Arquitetura de Projeto 2.0](#2-arquitetura-de-projeto-20)
3. [Arquitetura de Dados e Persistência](#3-arquitetura-de-dados-e-persistência)
4. [Arquitetura de Componentes e Fluxo de Dados](#4-arquitetura-de-componentes-e-fluxo-de-dados)
5. [Sistema de Integração IA](#5-sistema-de-integração-ia)
6. [Qualidade e Segurança](#6-qualidade-e-segurança)
7. [Performance e Otimização](#7-performance-e-otimização)
8. [Deploy e CI/CD](#8-deploy-e-cicd)
9. [Padrões e Convenções](#9-padrões-e-convenções)
10. [Guia do Desenvolvedor](#10-guia-do-desenvolvedor)
11. [Troubleshooting e Manutenção](#11-troubleshooting-e-manutenção)

---

## 1. VISÃO GERAL DA ENGENHARIA

### 1.1 Filosofia de Design 2.0: AI-First Architecture

O **SISGEAD 2.0** foi arquitetado com base em **cinco pilares revolucionários**:

#### 🤖 **AI-First Design Principles:**
- **Inteligência Nativa**: IA integrada organicamente em todos os workflows, não como addon
- **Contextual Awareness**: Sistema compreende contexto organizacional e aprende continuamente  
- **Predictive Intelligence**: Antecipa necessidades e sugere ações proativas
- **Human-AI Collaboration**: IA amplifica capacidades humanas sem substituí-las

#### 🔒 **Privacy & Security by Design:**
- **Zero-Trust Architecture**: Dados nunca deixam o ambiente controlado do usuário
- **Cryptographic Integrity**: SHA-256 para validação de integridade em todas as operações
- **Hybrid Storage**: IndexedDB + File System API para máximo controle e segurança
- **Compliance-Ready**: Arquitetura preparada para LGPD, GDPR e regulamentações futuras

#### ⚡ **Performance & Scalability:**
- **Modern Stack**: React 19 + TypeScript + Vite para máxima performance
- **Bundle Optimization**: Code splitting e lazy loading automáticos
- **Progressive Enhancement**: Funciona perfeitamente em qualquer dispositivo
- **Offline-First PWA**: Experiência completa sem conectividade

#### 🎨 **User-Centric Experience:**
- **Design System Holístico**: Componentes consistentes e reutilizáveis
- **Cognitive Load Reduction**: Interface que reduz complexidade mental
- **Accessibility First**: Compatível com tecnologias assistivas
- **Responsive by Default**: Layout fluido para qualquer viewport

#### 🔄 **Evolutionary Architecture:**
- **Modular Components**: Facilita manutenção e evolução contínua
- **API-Ready**: Preparado para integrações futuras
- **Version Control**: Sistema de versionamento para dados e funcionalidades
- **Backward Compatibility**: Migração automática de versões anteriores

---

## 2. ARQUITETURA DE PROJETO 2.0

### 2.1 Estrutura Avançada do Projeto

```
sisgead-2.0/
├── 📱 Frontend (React 19 + TypeScript)
│   ├── components/           # Componentes UI modernos
│   │   ├── AdminDashboard.tsx    # Dashboard executivo
│   │   ├── AdminLogin.tsx        # Autenticação administrativa  
│   │   ├── AdminPortal.tsx       # Portal principal admin
│   │   ├── AiAssistant.tsx       # Assistente IA integrado
│   │   ├── TeamBuilder.tsx       # Construtor de equipes IA
│   │   ├── UserPortal.tsx        # Portal do colaborador
│   │   ├── ErrorBoundary.tsx     # Tratamento de erros React
│   │   ├── Modal.tsx             # Sistema de modais reutilizável
│   │   └── icons.tsx             # Biblioteca de ícones SVG
│   │
│   ├── layouts/              # Layouts de página
│   │   └── MainLayout.tsx        # Layout principal responsivo
│   │
│   ├── services/             # Camada de serviços
│   │   └── geminiService.ts      # Integração Google Gemini AI
│   │
│   ├── utils/                # Utilitários puros
│   │   ├── db.ts                 # IndexedDB service layer
│   │   ├── fileSystem.ts         # File System API integration
│   │   ├── crypto.ts             # Funções criptográficas
│   │   ├── helpers.ts            # Helpers gerais
│   │   ├── sanitize.ts           # Sanitização de dados
│   │   └── storage.ts            # Abstração de storage
│   │
│   ├── assets/               # Recursos estáticos
│   │   ├── infinitusLogo.ts      # Logo da empresa
│   │   └── logo.tsx              # Componente de logo
│   │
│   ├── 🎨 Styling
│   │   └── index.css             # Design system completo
│   │
│   └── 📄 Core Files
│       ├── App.tsx               # Orquestrador principal
│       ├── index.tsx             # Entry point
│       ├── types.ts              # Definições TypeScript
│       ├── constants.ts          # Constantes do sistema
│       └── documents.ts          # Documentação integrada
│
├── 🤖 AI Proxy (Cloudflare Worker)
│   ├── api-gemini/
│   │   ├── src/
│   │   │   └── index.ts          # Worker proxy seguro
│   │   └── wrangler.toml         # Configuração Cloudflare
│
├── ⚙️ Configuration
│   ├── vite.config.ts            # Build configuration
│   ├── tsconfig.json             # TypeScript config
│   ├── package.json              # Dependencies & scripts
│   └── .gitignore                # Git exclusions
│
├── 📚 Documentation
│   ├── README.md                 # Documentação principal
│   ├── GEMINI_CONFIG.md          # Configuração da IA
│   └── metadata.json             # Metadados do projeto
│
└── 🚀 Deploy
    └── .github/workflows/        # CI/CD automatizado
```

### 2.2 Padrões Arquiteturais Implementados

#### 🏗️ **Design Patterns:**
- **Component-Driven Development**: Componentes reutilizáveis e testáveis
- **Service Layer Pattern**: Separação clara entre UI e lógica de negócio  
- **Repository Pattern**: Abstração da camada de persistência
- **Proxy Pattern**: Cloudflare Worker para segurança da API
- **Observer Pattern**: Estado reativo com React hooks
- **Factory Pattern**: Criação de instâncias de serviços
- **Singleton Pattern**: Gerenciamento de conexões únicas

#### 📐 **Architectural Principles:**
- **Single Responsibility**: Cada módulo tem uma responsabilidade clara
- **Open/Closed**: Aberto para extensão, fechado para modificação
- **Dependency Inversion**: Dependências abstratas, não concretas
- **Interface Segregation**: Interfaces específicas e coesas
- **DRY (Don't Repeat Yourself)**: Reutilização máxima de código
- **KISS (Keep It Simple, Stupid)**: Simplicidade na implementação

---

## 3. ARQUITETURA DE DADOS E PERSISTÊNCIA

### 3.1 Orquestração Central em App.tsx

O **App.tsx** funciona como o **orquestrador principal** do sistema, gerenciando estado global e persistência:

```typescript
interface AppState {
  // Dados Principais
  auditLog: AuditRecord[];
  teams: TeamComposition[];
  proposalLog: TeamProposal[];
  
  // Estado do Sistema
  storageMode: 'loading' | 'indexedDB' | 'fileSystem';
  directoryHandle: FileSystemDirectoryHandle | null;
  
  // Configurações
  aiProvider: AiProvider;
  aiStatus: AiStatus;
}
```

#### 🔄 **Fluxo de Inicialização:**
1. **Migração Legacy**: Transfere dados do localStorage para IndexedDB
2. **Verificação FileSystem**: Tenta carregar handle de diretório salvo
3. **Teste de Permissões**: Verifica acesso ao diretório selecionado
4. **Carregamento de Dados**: Carrega de arquivo local ou IndexedDB
5. **Configuração IA**: Determina modo de operação (real/simulação)

#### 💾 **Sistema de Persistência Unificado:**
```typescript
const saveAllData = async (
  auditLog: AuditRecord[],
  teams: TeamComposition[],
  proposalLog: TeamProposal[]
) => {
  if (storageMode === 'fileSystem' && directoryHandle) {
    await saveToFileSystem(directoryHandle, { auditLog, teams, proposalLog });
  } else {
    await saveToIndexedDB({ auditLog, teams, proposalLog });
  }
};
```

### 3.2 Camada IndexedDB (utils/db.ts)

#### 🏦 **Estrutura do Banco:**
```typescript
interface SisgeadDB extends DBSchema {
  auditLog: {
    key: string;
    value: AuditRecord;
  };
  teams: {
    key: string;
    value: TeamComposition;
  };
  proposalLog: {
    key: string;
    value: TeamProposal;
  };
  settings: {
    key: string;
    value: any;
  };
}
```

#### 🔒 **Operações Transacionais:**
```typescript
export const saveAllData = async (data: AllData): Promise<void> => {
  const db = await openDB<SisgeadDB>('sisgead-db', 1, {
    upgrade(db) {
      // Schema creation and migrations
    },
  });
  
  const tx = db.transaction(['auditLog', 'teams', 'proposalLog'], 'readwrite');
  
  // Atomic operations
  await Promise.all([
    tx.objectStore('auditLog').clear(),
    tx.objectStore('teams').clear(),
    tx.objectStore('proposalLog').clear(),
  ]);
  
  // Bulk insert
  await Promise.all([
    ...data.auditLog.map(record => tx.objectStore('auditLog').add(record)),
    ...data.teams.map(team => tx.objectStore('teams').add(team)),
    ...data.proposalLog.map(proposal => tx.objectStore('proposalLog').add(proposal)),
  ]);
  
  await tx.done;
};
```

### 3.3 Camada File System API (utils/fileSystem.ts)

#### 📁 **Integração com Sistema de Arquivos:**
```typescript
export const connectToFileSystem = async (): Promise<FileSystemDirectoryHandle | null> => {
  try {
    // Check for File System Access API support
    if (!('showDirectoryPicker' in window)) {
      return null;
    }
    
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite'
    });
    
    // Test permissions
    const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      await dirHandle.requestPermission({ mode: 'readwrite' });
    }
    
    return dirHandle;
  } catch (error) {
    console.warn('File System Access denied:', error);
    return null;
  }
};
```

#### 💾 **Operações de Arquivo:**
```typescript
export const saveToFileSystem = async (
  dirHandle: FileSystemDirectoryHandle,
  data: AllData
): Promise<boolean> => {
  try {
    const fileHandle = await dirHandle.getFileHandle('sisgead-database.json', {
      create: true
    });
    
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    
    return true;
  } catch (error) {
    console.error('Error saving to file system:', error);
    return false;
  }
};
```

### 3.4 Migração e Versionamento

#### 🔄 **Migração Automática:**
```typescript
const migrateFromLocalStorage = async (): Promise<void> => {
  const legacyData = localStorage.getItem('sisgead-data');
  if (!legacyData) return;
  
  try {
    const parsedData = JSON.parse(legacyData);
    
    // Data transformation and validation
    const migratedData = transformLegacyData(parsedData);
    
    // Save to IndexedDB
    await saveToIndexedDB(migratedData);
    
    // Clear legacy storage
    localStorage.removeItem('sisgead-data');
    
    console.log('✅ Legacy data migrated successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};
```

#### 🏷️ **Controle de Versão:**
```typescript
interface DataVersion {
  version: string;
  timestamp: string;
  format: 'v1' | 'v2' | 'v2.1';
  checksum: string;
}

const validateDataVersion = (data: any): boolean => {
  const currentVersion = '2.0';
  if (data.version !== currentVersion) {
    return migrateToCurrentVersion(data);
  }
  return true;
};
```

---

## 4. ARQUITETURA DE COMPONENTES E FLUXO DE DADOS

### 4.1 Hierarquia de Componentes

```
App.tsx (State Container)
├── ErrorBoundary.tsx (Error Handling)
├── MainLayout.tsx (Layout Provider)
│   ├── Header Component (Navigation)
│   ├── Sidebar Component (Optional)
│   └── Main Content Area
│       ├── WelcomeScreen.tsx (Landing)
│       ├── UserPortal.tsx (Self-Assessment)
│       │   ├── IdentityContextScreen.tsx
│       │   ├── Questionnaire.tsx
│       │   ├── ResultsScreen.tsx
│       │   └── ProfileExpansionScreen.tsx
│       │
│       └── AdminPortal.tsx (Management)
│           ├── AdminDashboard.tsx (Overview)
│           ├── TeamBuilder.tsx (AI Team Creation)
│           │   └── AiAssistant.tsx (AI Integration)
│           ├── PortfolioView.tsx (Portfolio Management)
│           ├── TeamReportView.tsx (Analytics)
│           └── Modal.tsx (Reusable Modals)
```

### 4.2 Fluxo de Dados Assíncrono

#### 📊 **Padrão de Estado Global:**
```typescript
// App.tsx - Estado Central
const [auditLog, setAuditLog] = useState<AuditRecord[]>([]);
const [teams, setTeams] = useState<TeamComposition[]>([]);
const [proposalLog, setProposalLog] = useState<TeamProposal[]>([]);

// Funções de Atualização Assíncrona
const updateAuditLog = useCallback(async (newLog: AuditRecord[]) => {
  setAuditLog(newLog);
  await saveAllData(newLog, teams, proposalLog);
}, [teams, proposalLog]);

const updateTeams = useCallback(async (newTeams: TeamComposition[]) => {
  setTeams(newTeams);
  await saveAllData(auditLog, newTeams, proposalLog);
}, [auditLog, proposalLog]);
```

#### 🔄 **Exemplo de Fluxo Completo:**
1. **Ação do Usuário**: Clique em "Excluir Registro" no AdminDashboard
2. **Validação Local**: Componente valida permissões e confirma ação
3. **Atualização de Estado**: Chama `updateAuditLog` com nova lista
4. **Persistência**: `saveAllData` persiste automaticamente
5. **Reatividade**: React re-renderiza componentes afetados
6. **Feedback**: Interface confirma operação com animação

### 4.3 Gestão de Estado Complexo

#### 🎯 **Context API para Configurações:**
```typescript
interface ConfigContext {
  aiProvider: AiProvider;
  storageMode: StorageMode;
  theme: ThemeConfig;
  updateConfig: (config: Partial<ConfigContext>) => Promise<void>;
}

const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ConfigContext>();
  
  const updateConfig = async (updates: Partial<ConfigContext>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    await persistConfig(newConfig);
  };
  
  return (
    <ConfigContext.Provider value={{ ...config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
```

#### ⚡ **Custom Hooks para Lógica Compartilhada:**
```typescript
export const useDataPersistence = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const save = useCallback(async (data: AllData) => {
    setIsSaving(true);
    try {
      await saveAllData(data);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  return { isSaving, lastSaved, save };
};
```

---

## 5. SISTEMA DE INTEGRAÇÃO IA

### 5.1 Arquitetura do Gemini Service

#### 🤖 **Camada de Abstração IA:**
```typescript
interface AiProvider {
  name: 'gemini' | 'openai' | 'mock';
  generateResponse(prompt: string, context?: any): Promise<AiResponse>;
  analyzeTeam(team: AuditRecord[], objective: string): Promise<TeamAnalysis>;
  searchWeb(query: string): Promise<WebSearchResult[]>;
}

class GeminiProvider implements AiProvider {
  private client: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }
  
  async generateResponse(prompt: string, context?: any): Promise<AiResponse> {
    const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
    
    const enhancedPrompt = this.buildContextualPrompt(prompt, context);
    const result = await model.generateContent(enhancedPrompt);
    
    return {
      text: result.response.text(),
      confidence: this.calculateConfidence(result),
      sources: this.extractSources(result),
      timestamp: new Date().toISOString()
    };
  }
}
```

### 5.2 Cloudflare Worker Proxy

#### 🔒 **Proxy Seguro para API:**
```typescript
// api-gemini/src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS handling
    const origin = request.headers.get("Origin") || "";
    const allowOrigin = env.ALLOWED_ORIGIN && origin.startsWith(env.ALLOWED_ORIGIN) 
      ? origin : "*";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": allowOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        },
      });
    }

    // Request processing
    try {
      const body = await request.json();
      const { prompt, model = "gemini-1.5-flash" } = body;

      if (!prompt) {
        return json({ error: "Missing prompt" }, 400, allowOrigin);
      }

      // Gemini API call
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return json({ error: data }, response.status, allowOrigin);
      }

      const text = data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text || "").join("") || "";
        
      return json({ text }, 200, allowOrigin);
      
    } catch (error) {
      return json({ error: error.message }, 500, allowOrigin);
    }
  }
};
```

### 5.3 Sistema de Prompts Contextuais

#### 📝 **Template Engine para Prompts:**
```typescript
class PromptBuilder {
  private templates: Map<string, string> = new Map();
  
  constructor() {
    this.loadTemplates();
  }
  
  buildTeamAnalysisPrompt(
    members: AuditRecord[], 
    objective: string,
    context: OrganizationalContext
  ): string {
    const template = this.templates.get('team-analysis');
    
    return template
      .replace('{{OBJECTIVE}}', objective)
      .replace('{{MEMBERS}}', this.formatMembers(members))
      .replace('{{CONTEXT}}', JSON.stringify(context))
      .replace('{{TIMESTAMP}}', new Date().toISOString());
  }
  
  private formatMembers(members: AuditRecord[]): string {
    return members.map(member => {
      const disc = this.formatDiscProfile(member.discProfile);
      const technical = this.formatTechnicalProfile(member.technicalProfile);
      
      return `
        Nome: ${member.name}
        Perfil DISC: ${disc}
        Competências: ${technical}
        Experiência: ${member.methodologicalProfile?.experience || 'N/A'}
      `.trim();
    }).join('\n\n');
  }
}
```

### 5.4 Sistema de Cache e Rate Limiting

#### ⚡ **Cache Inteligente:**
```typescript
class AiResponseCache {
  private cache: Map<string, CachedResponse> = new Map();
  private readonly TTL = 1000 * 60 * 30; // 30 minutes
  
  private generateKey(prompt: string, context: any): string {
    return btoa(JSON.stringify({ prompt, context })).substring(0, 32);
  }
  
  async get(prompt: string, context?: any): Promise<AiResponse | null> {
    const key = this.generateKey(prompt, context);
    const cached = this.cache.get(key);
    
    if (!cached || Date.now() - cached.timestamp > this.TTL) {
      return null;
    }
    
    return cached.response;
  }
  
  set(prompt: string, context: any, response: AiResponse): void {
    const key = this.generateKey(prompt, context);
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }
}
```

#### 🚦 **Rate Limiting:**
```typescript
class RateLimit {
  private requests: number[] = [];
  private readonly MAX_REQUESTS = 10;
  private readonly WINDOW_MS = 60000; // 1 minute
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.WINDOW_MS);
    
    if (this.requests.length >= this.MAX_REQUESTS) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
  
  getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const resetTime = oldestRequest + this.WINDOW_MS;
    
    return Math.max(0, resetTime - Date.now());
  }
}
```

---

## 6. QUALIDADE E SEGURANÇA

### 6.1 Sistema de Validação e Integridade

#### 🔐 **Validação Criptográfica:**
```typescript
// utils/crypto.ts
export const generateDataHash = (data: any): string => {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  return btoa(new TextEncoder().encode(jsonString)
    .reduce((hash, byte) => {
      hash = ((hash << 5) - hash) + byte;
      return hash & hash; // Convert to 32-bit integer
    }, 0).toString(16));
};

export const validateDataIntegrity = (
  data: AuditRecord, 
  expectedHash: string
): boolean => {
  const { dataHash, ...dataWithoutHash } = data;
  const calculatedHash = generateDataHash(dataWithoutHash);
  
  return calculatedHash === expectedHash;
};
```

#### 🛡️ **Sanitização de Dados:**
```typescript
// utils/sanitize.ts
export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove JS protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) {
    return false;
  }
  
  // CPF validation algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  return remainder === parseInt(cleanCPF.charAt(10));
};
```

### 6.2 Error Boundary e Tratamento de Erros

#### 🚨 **Error Boundary Avançado:**
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId()
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error details
    console.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    });
    
    // Send to monitoring service (if available)
    this.reportError(error, errorInfo);
  }
  
  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Implementation for error reporting
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Could send to external service or store locally
    localStorage.setItem(`error-${this.state.errorId}`, JSON.stringify(errorReport));
  }
}
```

### 6.3 Auditoria e Logging

#### 📊 **Sistema de Auditoria:**
```typescript
interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  action: AuditAction;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent: string;
}

class AuditLogger {
  private events: AuditEvent[] = [];
  
  log(action: AuditAction, resource: string, details: Record<string, any>) {
    const event: AuditEvent = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      action,
      resource,
      details,
      userAgent: navigator.userAgent
    };
    
    this.events.push(event);
    
    // Persist to storage
    this.persistAuditLog();
    
    console.info(`[AUDIT] ${action} on ${resource}`, details);
  }
  
  async exportAuditLog(): Promise<string> {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      events: this.events
    }, null, 2);
  }
  
  private async persistAuditLog() {
    try {
      await saveToIndexedDB('audit-log', this.events);
    } catch (error) {
      console.error('Failed to persist audit log:', error);
    }
  }
}
```

---

## 7. PERFORMANCE E OTIMIZAÇÃO

### 7.1 Bundle Optimization

#### 📦 **Vite Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ai: ['@google/genai'],
          charts: ['recharts'],
          utils: ['idb']
        }
      }
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false, // Disable in production
    minify: 'esbuild',
    target: 'es2020'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'idb'],
    exclude: ['@google/genai'] // External dependency
  }
});
```

#### ⚡ **Code Splitting Strategy:**
```typescript
// Lazy loading for major components
const AdminPortal = lazy(() => import('./components/AdminPortal'));
const TeamBuilder = lazy(() => import('./components/TeamBuilder'));
const PortfolioView = lazy(() => import('./components/PortfolioView'));

// Loading wrapper with suspense
const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);
```

### 7.2 Otimização de Renderização

#### 🎯 **Memoization Strategy:**
```typescript
// Heavy computation memoization
const ExpensiveChart = React.memo<ChartProps>(({ data }) => {
  const processedData = useMemo(() => {
    return processChartData(data);
  }, [data]);
  
  return <Chart data={processedData} />;
});

// Callback memoization
const TeamList: React.FC<TeamListProps> = ({ teams, onTeamSelect }) => {
  const handleTeamClick = useCallback((teamId: string) => {
    onTeamSelect(teamId);
  }, [onTeamSelect]);
  
  return (
    <>
      {teams.map(team => (
        <TeamCard 
          key={team.id} 
          team={team} 
          onClick={handleTeamClick}
        />
      ))}
    </>
  );
};
```

#### 🔄 **Virtual Scrolling for Large Lists:**
```typescript
const VirtualizedList: React.FC<VirtualListProps> = ({ 
  items, 
  renderItem, 
  itemHeight = 60 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return (
    <div
      ref={containerRef}
      style={{ height: '100%', overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {items.slice(visibleStart, visibleEnd).map((item, index) =>
            renderItem(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  );
};
```

### 7.3 Otimização de Storage

#### 💾 **Compression and Batching:**
```typescript
class OptimizedStorage {
  private batchQueue: StorageOperation[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  
  queueOperation(operation: StorageOperation) {
    this.batchQueue.push(operation);
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, 100); // Batch operations for 100ms
  }
  
  private async processBatch() {
    if (this.batchQueue.length === 0) return;
    
    const operations = [...this.batchQueue];
    this.batchQueue = [];
    
    try {
      await this.executeBatchOperations(operations);
    } catch (error) {
      console.error('Batch storage operations failed:', error);
      // Retry individual operations
      for (const op of operations) {
        await this.retryOperation(op);
      }
    }
  }
  
  private compressData(data: any): string {
    // Simple compression using JSON.stringify optimizations
    return JSON.stringify(data, (key, value) => {
      // Remove undefined values
      if (value === undefined) return null;
      // Truncate long strings
      if (typeof value === 'string' && value.length > 10000) {
        return value.substring(0, 10000) + '...';
      }
      return value;
    });
  }
}
```

---

## 8. DEPLOY E CI/CD

### 8.1 GitHub Actions Workflow

#### 🚀 **Automated Deployment:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Type check
      run: npm run type-check
      
    - name: Lint
      run: npm run lint
      
    - name: Test
      run: npm run test
      
    - name: Build
      run: npm run build
      env:
        NODE_ENV: production
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        cname: sisgead.carlosorvate.tech
```

### 8.2 Build Optimization

#### ⚙️ **Production Build Configuration:**
```typescript
// vite.config.ts (Production)
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    base: mode === 'production' ? '/sisgead-2.0/' : '/',
    
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
      __DEV__: mode === 'development'
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js'
        }
      },
      
      // Production optimizations
      minify: 'esbuild',
      cssCodeSplit: true,
      sourcemap: false,
      reportCompressedSize: true
    }
  };
});
```

### 8.3 Environment Management

#### 🔧 **Multi-Environment Setup:**
```typescript
// config/env.ts
interface EnvironmentConfig {
  apiBaseUrl: string;
  geminiApiKey?: string;
  enableDebug: boolean;
  enableAnalytics: boolean;
  storageMode: 'indexedDB' | 'fileSystem' | 'hybrid';
}

const configs: Record<string, EnvironmentConfig> = {
  development: {
    apiBaseUrl: 'http://localhost:3000',
    enableDebug: true,
    enableAnalytics: false,
    storageMode: 'hybrid'
  },
  
  production: {
    apiBaseUrl: 'https://sisgead-gemini-proxy.carlosorvate-tech.workers.dev',
    enableDebug: false,
    enableAnalytics: true,
    storageMode: 'hybrid'
  },
  
  testing: {
    apiBaseUrl: 'https://api-test.sisgead.com',
    enableDebug: true,
    enableAnalytics: false,
    storageMode: 'indexedDB'
  }
};

export const getConfig = (): EnvironmentConfig => {
  const env = process.env.NODE_ENV || 'development';
  return configs[env] || configs.development;
};
```

---

## 9. PADRÕES E CONVENÇÕES

### 9.1 Naming Conventions

#### 📝 **TypeScript/JavaScript:**
```typescript
// Interfaces: PascalCase with descriptive names
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
}

// Types: PascalCase with 'Type' suffix for union types
type StorageMode = 'indexedDB' | 'fileSystem' | 'hybrid';
type ComponentProps<T> = T & { className?: string };

// Components: PascalCase
const TeamBuilderWizard: React.FC<TeamBuilderProps> = ({ onComplete }) => {
  return <div>...</div>;
};

// Functions: camelCase with verb prefix
const calculateDiscScore = (answers: Answer[]): DiscScores => {
  // implementation
};

// Constants: SCREAMING_SNAKE_CASE
const DEFAULT_TIMEOUT = 5000;
const API_ENDPOINTS = {
  GEMINI: '/api/gemini',
  BACKUP: '/api/backup'
} as const;

// Files: kebab-case for components, camelCase for utilities
// team-builder.component.tsx
// discCalculator.utils.ts
```

#### 🎨 **CSS Classes:**
```css
/* BEM Methodology */
.team-builder { /* Block */ }
.team-builder__header { /* Element */ }
.team-builder__header--highlighted { /* Modifier */ }

/* Utility Classes */
.u-text-center { text-align: center; }
.u-margin-top-lg { margin-top: 2rem; }

/* Component-specific */
.c-modal { /* Component prefix */ }
.c-button { /* Component prefix */ }
.c-button--primary { /* Component variant */ }
```

### 9.2 Code Organization

#### 📁 **File Structure Patterns:**
```
components/
├── ui/                 # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   └── Modal/
│       ├── Modal.tsx
│       ├── Modal.types.ts
│       └── index.ts
│
├── business/           # Business logic components
│   ├── TeamBuilder/
│   ├── UserProfile/
│   └── Dashboard/
│
└── layout/            # Layout components
    ├── Header/
    ├── Sidebar/
    └── Footer/
```

#### 🔧 **Import/Export Patterns:**
```typescript
// Preferred: Named exports for utilities
export const calculateAge = (birthDate: Date): number => {
  return Math.floor((Date.now() - birthDate.getTime()) / 31557600000);
};

// Preferred: Default exports for components
const TeamBuilder: React.FC<TeamBuilderProps> = (props) => {
  return <div>...</div>;
};

export default TeamBuilder;

// Index files for clean imports
// components/ui/index.ts
export { default as Button } from './Button';
export { default as Modal } from './Modal';
export { default as Input } from './Input';

// Usage
import { Button, Modal, Input } from '../ui';
```

### 9.3 Error Handling Patterns

#### 🚨 **Standardized Error Types:**
```typescript
// Base error classes
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(message: string, public readonly context?: any) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 500;
}

// Error handling utility
const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new NetworkError(error.message, { originalError: error });
  }
  
  return new NetworkError('Unknown error occurred', { originalError: error });
};
```

---

## 10. GUIA DO DESENVOLVEDOR

### 10.1 Setup do Ambiente de Desenvolvimento

#### 🛠️ **Pré-requisitos:**
- Node.js 18+ (recomendado: 20+)
- npm 8+ ou yarn 1.22+
- Git 2.30+
- VS Code (recomendado) com extensões:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Prettier - Code formatter
  - ESLint

#### 📦 **Instalação:**
```bash
# Clone do repositório
git clone https://github.com/carlosorvate-tech/sisgead-2.0.git
cd sisgead-2.0

# Instalação de dependências
npm install

# Setup de ambiente local
cp .env.example .env.local
# Edite .env.local com suas configurações

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview da build
npm run preview
```

### 10.2 Comandos de Desenvolvimento

#### ⚡ **Scripts Disponíveis:**
```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 3000",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### 10.3 Debugging e Profiling

#### 🔍 **Chrome DevTools Integration:**
```typescript
// React DevTools Profiler
const ProfiledComponent: React.FC = () => {
  return (
    <Profiler id="TeamBuilder" onRender={onRenderCallback}>
      <TeamBuilder />
    </Profiler>
  );
};

const onRenderCallback = (
  id: string,
  phase: "mount" | "update",
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  console.log('Profile:', { id, phase, actualDuration });
};

// Performance monitoring
const measurePerformance = (fn: Function, label: string) => {
  return async (...args: any[]) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    console.log(`${label} took ${end - start} milliseconds`);
    return result;
  };
};
```

### 10.4 Testing Strategy

#### 🧪 **Unit Testing:**
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamBuilder } from './TeamBuilder';

describe('TeamBuilder', () => {
  it('should render team builder form', () => {
    render(<TeamBuilder onSubmit={jest.fn()} />);
    
    expect(screen.getByText('Create New Team')).toBeInTheDocument();
    expect(screen.getByLabelText('Team Name')).toBeInTheDocument();
  });
  
  it('should call onSubmit when form is submitted', () => {
    const mockSubmit = jest.fn();
    render(<TeamBuilder onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Team Name'), {
      target: { value: 'Test Team' }
    });
    
    fireEvent.click(screen.getByText('Create Team'));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'Test Team'
    });
  });
});
```

#### 🔧 **Integration Testing:**
```typescript
// Service testing
import { geminiService } from './geminiService';

describe('GeminiService', () => {
  it('should analyze team composition', async () => {
    const mockTeam = [
      { name: 'John', discProfile: { primary: 'D' } },
      { name: 'Jane', discProfile: { primary: 'I' } }
    ];
    
    const analysis = await geminiService.analyzeTeam(
      mockTeam, 
      'Develop mobile app'
    );
    
    expect(analysis).toHaveProperty('complementarity');
    expect(analysis).toHaveProperty('recommendations');
  });
});
```

---

## 11. TROUBLESHOOTING E MANUTENÇÃO

### 11.1 Problemas Comuns e Soluções

#### ❌ **Build Failures:**
```bash
# Error: Cannot resolve module
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Error: TypeScript compilation errors
# Solution: Check types and fix
npm run type-check
```

#### 🔄 **Performance Issues:**
```typescript
// Bundle size analysis
npm run build -- --analyze

// Memory leaks detection
const ComponentWithCleanup: React.FC = () => {
  useEffect(() => {
    const timer = setInterval(() => {
      // Some work
    }, 1000);
    
    return () => {
      clearInterval(timer); // Always cleanup
    };
  }, []);
  
  return <div>...</div>;
};
```

#### 📱 **Browser Compatibility:**
```typescript
// Feature detection
const supportsFileSystemAPI = 'showDirectoryPicker' in window;
const supportsIndexedDB = 'indexedDB' in window;

if (!supportsIndexedDB) {
  console.warn('IndexedDB not supported, falling back to localStorage');
  // Implement fallback
}
```

### 11.2 Monitoring e Alertas

#### 📊 **Performance Monitoring:**
```typescript
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  
  measureComponentRender(componentName: string, renderTime: number) {
    this.metrics.push({
      type: 'component-render',
      name: componentName,
      value: renderTime,
      timestamp: Date.now()
    });
    
    if (renderTime > 16) { // > 60fps threshold
      console.warn(`Slow render: ${componentName} took ${renderTime}ms`);
    }
  }
  
  measureAPICall(endpoint: string, duration: number, success: boolean) {
    this.metrics.push({
      type: 'api-call',
      name: endpoint,
      value: duration,
      success,
      timestamp: Date.now()
    });
  }
  
  generateReport(): PerformanceReport {
    return {
      averageRenderTime: this.calculateAverage('component-render'),
      slowestComponents: this.getSlowestComponents(5),
      apiCallStats: this.getAPIStats(),
      timestamp: new Date().toISOString()
    };
  }
}
```

### 11.3 Manutenção Preventiva

#### 🔧 **Rotinas de Manutenção:**
```typescript
class MaintenanceManager {
  async performDailyMaintenance() {
    await this.cleanupOldLogs();
    await this.compactDatabase();
    await this.validateDataIntegrity();
    await this.updateCacheEntries();
  }
  
  private async cleanupOldLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days
    
    // Remove old audit logs
    await this.removeLogsOlderThan(cutoffDate);
  }
  
  private async validateDataIntegrity() {
    const records = await this.loadAllRecords();
    
    for (const record of records) {
      if (!this.validateRecordIntegrity(record)) {
        console.error(`Data integrity issue found: ${record.id}`);
        await this.flagForRepair(record);
      }
    }
  }
}
```

### 11.4 Backup e Recuperação

#### 💾 **Estratégia de Backup:**
```typescript
class BackupManager {
  async createFullBackup(): Promise<BackupFile> {
    const timestamp = new Date().toISOString();
    
    const backup: BackupFile = {
      metadata: {
        version: '2.0',
        timestamp,
        checksum: ''
      },
      data: {
        auditLog: await this.exportAuditLog(),
        teams: await this.exportTeams(),
        proposalLog: await this.exportProposals(),
        settings: await this.exportSettings()
      }
    };
    
    backup.metadata.checksum = generateChecksum(backup.data);
    
    return backup;
  }
  
  async restoreFromBackup(backupFile: BackupFile): Promise<boolean> {
    try {
      // Validate backup integrity
      const calculatedChecksum = generateChecksum(backupFile.data);
      if (calculatedChecksum !== backupFile.metadata.checksum) {
        throw new Error('Backup integrity check failed');
      }
      
      // Create current backup before restore
      await this.createFullBackup();
      
      // Restore data
      await this.importData(backupFile.data);
      
      return true;
    } catch (error) {
      console.error('Backup restoration failed:', error);
      return false;
    }
  }
}
```

---

## APÊNDICES

### A. Glossário Técnico

**AI-First Architecture**: Arquitetura onde IA é integrada nativamente em todos os workflows
**Bundle Splitting**: Divisão do código em chunks menores para carregamento otimizado
**Client-Side**: Processamento que ocorre no navegador do usuário
**IndexedDB**: API de banco de dados NoSQL do navegador
**PWA**: Progressive Web App - aplicação web com características nativas
**Serverless**: Arquitetura sem servidor tradicional
**TypeScript**: Superset do JavaScript com tipagem estática

### B. Referências e Recursos

- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Guide**: https://vitejs.dev/guide/
- **Google Gemini API**: https://ai.google.dev/docs
- **IndexedDB API**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **File System Access API**: https://web.dev/file-system-access/

### C. Changelog e Versionamento

**v2.0.0** (2025-11-03)
- 🚀 Lançamento da versão 2.0 com IA integrada
- 🎨 Interface completamente redesenhada
- ⚡ Migração para React 19 + TypeScript + Vite
- 🤖 Integração Google Gemini AI
- 🔒 Sistema de segurança aprimorado
- 📱 PWA compliance completa
- 🖨️ **Sistema de impressão multi-página implementado** ✅
- 🔧 **Correções de File System API permissions** ✅
- 📄 **Suporte completo para documentos longos em PDF** ✅

---

**© 2025 SISGEAD 2.0 - Documentação de Engenharia de Software**  
**Desenvolvido com tecnologias de ponta para máxima qualidade e performance**