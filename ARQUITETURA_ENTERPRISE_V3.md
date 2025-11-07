# SISGEAD 3.0 - Arquitetura Enterprise
## Suite de Gestão de Pessoas para Instituições de P&D&I

**Data:** 06/11/2025  
**Versão:** 3.0 Enterprise  
**Status:** Planejamento Arquitetural

---

## 🎯 Visão Geral

Transformar o SISGEAD 3.0 em uma **suite profissional** de gestão de talentos para instituições de pesquisa, desenvolvimento e inovação, com:

- ✅ Backend próprio (sem dependências de terceiros)
- ✅ Banco de dados relacional robusto
- ✅ Multi-tenancy (instituições → organizações → usuários)
- ✅ Segurança enterprise (LGPD compliant)
- ✅ Inteligência artificial embarcada
- ✅ Melhores práticas de engenharia de software

---

## 🏛️ Stack Tecnológico

### Backend
```
Framework:      Node.js 20 LTS + Express 4.18
Linguagem:      TypeScript 5.3
ORM:            Prisma 5.7 (type-safe, migrations)
Validação:      Zod (schema validation)
Autenticação:   JWT + Refresh Tokens
Criptografia:   bcrypt (senhas) + crypto (AES-256 dados)
```

### Banco de Dados
```
SGBD:           PostgreSQL 16
Backup:         pg_dump + AWS S3 / Azure Blob
Migrations:     Prisma Migrate
Replicação:     Master-Slave (alta disponibilidade)
```

### Frontend (Atual)
```
Framework:      React 18 + TypeScript
Build:          Vite 6.4
Estado Global:  Zustand (leve, simples)
API Client:     Axios + React Query (cache)
UI:             Tailwind CSS
```

### Infraestrutura
```
Containerização: Docker + Docker Compose
Orquestração:    Kubernetes (produção)
CI/CD:           GitHub Actions
Monitoramento:   Prometheus + Grafana
Logs:            Winston + ELK Stack
Hospedagem:      AWS / Azure / Google Cloud
```

---

## 🗄️ Modelagem do Banco de Dados

### Schema PostgreSQL

```sql
-- ============================================
-- HIERARQUIA: Institution → Organization → User → Talent
-- ============================================

-- 1. INSTITUIÇÕES (Nível mais alto)
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    segment VARCHAR(100), -- P&D, Inovação, Educação
    address JSONB, -- {street, city, state, country, zip}
    contact JSONB, -- {phone, email, website}
    subscription_plan VARCHAR(50), -- Free, Professional, Enterprise
    max_organizations INT DEFAULT 5,
    max_users INT DEFAULT 100,
    features JSONB, -- {ai_enabled, advanced_reports, etc}
    
    -- LGPD
    data_controller VARCHAR(255), -- Responsável pelos dados
    dpo_name VARCHAR(255), -- Data Protection Officer
    dpo_email VARCHAR(255),
    privacy_policy_url TEXT,
    terms_accepted_at TIMESTAMP,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    deactivated_at TIMESTAMP,
    deactivation_reason TEXT
);

-- 2. ORGANIZAÇÕES (Departamentos/Áreas)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50) UNIQUE, -- Código interno
    manager_id UUID REFERENCES users(id),
    parent_org_id UUID REFERENCES organizations(id), -- Hierarquia de orgs
    
    -- Configurações
    settings JSONB, -- {allow_self_assessment, require_approval, etc}
    budget DECIMAL(15,2),
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. USUÁRIOS DO SISTEMA
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Identificação
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE, -- Opcional, criptografado
    
    -- Papel e Permissões
    role VARCHAR(50) NOT NULL, -- master, admin-org, user, viewer
    permissions JSONB, -- {can_create_org, can_delete_users, etc}
    
    -- Contato
    phone VARCHAR(20),
    department VARCHAR(100),
    job_title VARCHAR(100),
    
    -- Autenticação
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login_at TIMESTAMP,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Sessão
    refresh_token TEXT,
    refresh_token_expires TIMESTAMP,
    
    -- LGPD - Consentimentos
    consent_data_processing BOOLEAN DEFAULT FALSE,
    consent_data_sharing BOOLEAN DEFAULT FALSE,
    consent_given_at TIMESTAMP,
    data_retention_date DATE, -- Data de exclusão automática
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_modified_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    deactivated_at TIMESTAMP
);

-- 4. TALENTOS (Pessoas Avaliadas)
CREATE TABLE talents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Identificação
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    cpf VARCHAR(14), -- Criptografado
    employee_id VARCHAR(50), -- Matrícula
    
    -- Profissional
    job_title VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    contract_type VARCHAR(50), -- CLT, PJ, Estágio, etc
    seniority_level VARCHAR(50), -- Júnior, Pleno, Sênior, etc
    
    -- Contato
    phone VARCHAR(20),
    address JSONB,
    
    -- Perfil DISC
    current_profile VARCHAR(10), -- D-I-S-C
    profile_history JSONB[], -- [{date, profile, assessment_id}]
    
    -- Competências
    skills JSONB[], -- [{skill, level, validated_at}]
    certifications JSONB[], -- [{name, issuer, date, expiry}]
    languages JSONB[], -- [{language, level}]
    
    -- Performance
    performance_score DECIMAL(3,2), -- 0.00 a 5.00
    potential_rating VARCHAR(20), -- Alto, Médio, Baixo
    flight_risk VARCHAR(20), -- Alto, Médio, Baixo
    
    -- Desenvolvimento
    development_plan JSONB, -- {goals, actions, timeline}
    training_history JSONB[], -- [{course, date, duration, result}]
    
    -- LGPD
    consent_data_processing BOOLEAN DEFAULT FALSE,
    consent_given_at TIMESTAMP,
    data_anonymized BOOLEAN DEFAULT FALSE,
    data_retention_date DATE,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. EQUIPES
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Identificação
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_type VARCHAR(50), -- Projeto, Permanente, Temporária
    
    -- Gestão
    leader_id UUID REFERENCES talents(id),
    start_date DATE,
    end_date DATE,
    
    -- Objetivos
    objectives JSONB[], -- [{description, deadline, status}]
    kpis JSONB[], -- [{name, target, current, unit}]
    
    -- Análise
    disc_balance JSONB, -- {D: 25%, I: 30%, S: 20%, C: 25%}
    complementarity_score DECIMAL(3,2), -- 0.00 a 5.00
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. MEMBROS DE EQUIPES (Relacionamento N:N)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
    
    -- Papel na Equipe
    role VARCHAR(100), -- Desenvolvedor, Pesquisador, Analista, etc
    responsibilities TEXT,
    allocation_percentage INT DEFAULT 100, -- % de dedicação
    
    -- Período
    joined_at DATE NOT NULL,
    left_at DATE,
    
    -- Avaliação
    performance_rating DECIMAL(3,2),
    peer_feedback JSONB[],
    
    UNIQUE(team_id, talent_id, joined_at)
);

-- 7. AVALIAÇÕES DISC
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    talent_id UUID REFERENCES talents(id) ON DELETE CASCADE,
    
    -- Tipo
    assessment_type VARCHAR(50), -- DISC, 360, Performance
    status VARCHAR(50), -- Pending, InProgress, Completed, Cancelled
    
    -- Responsáveis
    evaluator_id UUID REFERENCES users(id),
    approver_id UUID REFERENCES users(id),
    
    -- Prazos
    scheduled_date DATE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    approved_at TIMESTAMP,
    
    -- Respostas e Resultados
    questions JSONB[], -- [{id, text, type}]
    answers JSONB[], -- [{question_id, value, timestamp}]
    results JSONB, -- {D: 35, I: 25, S: 20, C: 20, profile: "D-I"}
    
    -- Observações
    notes TEXT,
    recommendations TEXT,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- 8. DOCUMENTOS (Mantendo compatibilidade v2.0)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Identificação
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(50), -- DISC, Relatório, Certificado
    
    -- Conteúdo
    content JSONB, -- Estrutura flexível
    metadata JSONB, -- {version, template, etc}
    
    -- Relacionamentos
    talent_id UUID REFERENCES talents(id),
    assessment_id UUID REFERENCES assessments(id),
    
    -- Arquivos
    file_url TEXT,
    file_size INT,
    file_type VARCHAR(50),
    
    -- Status
    status VARCHAR(50), -- Draft, Published, Archived
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- 9. LOGS DE AUDITORIA (LGPD Compliance)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Quem
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    user_ip VARCHAR(45), -- IPv4/IPv6
    user_agent TEXT,
    
    -- O quê
    action VARCHAR(100) NOT NULL, -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
    entity_type VARCHAR(50), -- users, talents, assessments, etc
    entity_id UUID,
    
    -- Onde
    institution_id UUID REFERENCES institutions(id),
    organization_id UUID REFERENCES organizations(id),
    
    -- Quando
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
    
    -- Detalhes
    changes JSONB, -- {before: {...}, after: {...}}
    metadata JSONB, -- {browser, device, location, etc}
    
    -- Classificação
    severity VARCHAR(20), -- INFO, WARNING, ERROR, CRITICAL
    category VARCHAR(50), -- AUTH, DATA_ACCESS, DATA_MODIFICATION, ADMIN
    
    -- LGPD
    data_subject_id UUID, -- ID da pessoa afetada
    legal_basis VARCHAR(100), -- Base legal da ação
    
    -- Imutabilidade
    hash VARCHAR(64) NOT NULL, -- SHA-256 do log
    previous_hash VARCHAR(64) -- Blockchain-like
);

-- 10. CONSENTIMENTOS LGPD
CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Titular dos dados
    data_subject_type VARCHAR(50), -- user, talent
    data_subject_id UUID NOT NULL,
    
    -- Consentimento
    purpose VARCHAR(255) NOT NULL, -- Finalidade do tratamento
    consent_given BOOLEAN NOT NULL,
    consent_method VARCHAR(50), -- Web, Email, Presencial
    
    -- Detalhes
    description TEXT,
    legal_basis VARCHAR(100), -- Art. 7º LGPD
    data_categories TEXT[], -- {personal_data, sensitive_data, etc}
    retention_period VARCHAR(50), -- 5 anos, Até término do contrato, etc
    
    -- Rastreamento
    given_at TIMESTAMP,
    revoked_at TIMESTAMP,
    revocation_reason TEXT,
    
    -- Versão do termo
    terms_version VARCHAR(20),
    terms_url TEXT,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- 11. NOTIFICAÇÕES
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Destinatário
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Conteúdo
    type VARCHAR(50), -- INFO, WARNING, ERROR, SUCCESS
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    
    -- Metadata
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE,
    
    -- Prioridade
    priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    
    -- Expiração
    expires_at TIMESTAMP,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES (Performance)
-- ============================================

-- Instituições
CREATE INDEX idx_institutions_cnpj ON institutions(cnpj);
CREATE INDEX idx_institutions_active ON institutions(is_active);

-- Organizações
CREATE INDEX idx_organizations_institution ON organizations(institution_id);
CREATE INDEX idx_organizations_active ON organizations(is_active);

-- Usuários
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Talentos
CREATE INDEX idx_talents_organization ON talents(organization_id);
CREATE INDEX idx_talents_email ON talents(email);
CREATE INDEX idx_talents_active ON talents(is_active);

-- Equipes
CREATE INDEX idx_teams_organization ON teams(organization_id);
CREATE INDEX idx_teams_active ON teams(is_active);

-- Avaliações
CREATE INDEX idx_assessments_organization ON assessments(organization_id);
CREATE INDEX idx_assessments_talent ON assessments(talent_id);
CREATE INDEX idx_assessments_status ON assessments(status);

-- Auditoria
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- Notificações
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- TRIGGERS (Automação)
-- ============================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_talents_updated_at BEFORE UPDATE ON talents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Hash de auditoria (imutabilidade)
CREATE OR REPLACE FUNCTION generate_audit_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.hash = encode(
        digest(
            NEW.user_id::text || 
            NEW.action || 
            NEW.entity_type || 
            NEW.timestamp::text ||
            COALESCE(NEW.changes::text, ''),
            'sha256'
        ),
        'hex'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_hash BEFORE INSERT ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION generate_audit_hash();

-- ============================================
-- VIEWS (Consultas otimizadas)
-- ============================================

-- Visão consolidada de usuários com organização
CREATE VIEW v_users_complete AS
SELECT 
    u.*,
    o.name as organization_name,
    i.name as institution_name
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
LEFT JOIN institutions i ON u.institution_id = i.id;

-- Visão de talentos com perfil atual
CREATE VIEW v_talents_profile AS
SELECT 
    t.*,
    o.name as organization_name,
    COUNT(a.id) as total_assessments,
    MAX(a.completed_at) as last_assessment_date
FROM talents t
LEFT JOIN organizations o ON t.organization_id = o.id
LEFT JOIN assessments a ON t.id = a.talent_id AND a.status = 'Completed'
GROUP BY t.id, o.name;

-- Estatísticas por organização
CREATE VIEW v_organization_stats AS
SELECT 
    o.id,
    o.name,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT t.id) as total_talents,
    COUNT(DISTINCT tm.team_id) as total_teams,
    COUNT(DISTINCT a.id) as total_assessments,
    AVG(t.performance_score) as avg_performance
FROM organizations o
LEFT JOIN users u ON o.id = u.organization_id AND u.is_active = TRUE
LEFT JOIN talents t ON o.id = t.organization_id AND t.is_active = TRUE
LEFT JOIN teams tm ON o.id = tm.organization_id
LEFT JOIN assessments a ON o.id = a.organization_id
GROUP BY o.id, o.name;
```

---

## 🔒 Segurança e LGPD

### 1. Autenticação e Autorização

#### JWT (JSON Web Tokens)
```typescript
// Access Token (curta duração: 15min)
{
  userId: "uuid",
  email: "user@email.com",
  role: "admin-org",
  institutionId: "uuid",
  organizationId: "uuid",
  permissions: ["read:users", "create:talents"],
  exp: 1699999999
}

// Refresh Token (longa duração: 7 dias)
{
  userId: "uuid",
  tokenFamily: "uuid", // Detectar roubo de token
  exp: 1700999999
}
```

#### RBAC (Role-Based Access Control)
```typescript
const permissions = {
  master: [
    "all:institutions",
    "all:organizations",
    "all:users",
    "all:talents",
    "all:teams",
    "all:reports",
    "read:audit_logs"
  ],
  "admin-org": [
    "read:own_organization",
    "update:own_organization",
    "all:users:own_org",
    "all:talents:own_org",
    "all:teams:own_org",
    "all:assessments:own_org",
    "read:reports:own_org"
  ],
  user: [
    "read:own_profile",
    "update:own_profile",
    "create:assessments",
    "read:talents:own_org",
    "read:teams:own_org"
  ],
  viewer: [
    "read:own_profile",
    "read:reports:own_org"
  ]
};
```

### 2. Criptografia

```typescript
// Senhas - bcrypt (cost factor 12)
const hash = await bcrypt.hash(password, 12);

// Dados sensíveis - AES-256-GCM
const encrypted = crypto.encrypt({
  algorithm: 'aes-256-gcm',
  key: process.env.ENCRYPTION_KEY,
  data: cpf
});

// Comunicação - HTTPS obrigatório
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

### 3. LGPD Compliance

#### Princípios Implementados

**1. Finalidade:** Cada coleta de dados tem propósito específico
```typescript
const consent = {
  purpose: "Avaliação de perfil comportamental DISC",
  legalBasis: "Consentimento expresso (Art. 7º, I)",
  dataCategories: ["nome", "email", "respostas_questionário"],
  retentionPeriod: "5 anos após término do contrato"
};
```

**2. Adequação:** Dados compatíveis com a finalidade
```typescript
// ❌ Não coletamos dados desnecessários
// Apenas o necessário para avaliação DISC

// ✅ Justificativa para cada campo
const dataMapping = {
  cpf: "Identificação única (opcional, criptografado)",
  email: "Comunicação de resultados",
  respostas: "Cálculo do perfil DISC"
};
```

**3. Necessidade:** Mínimo de dados possível
```typescript
// Campos obrigatórios vs opcionais claramente definidos
const talentSchema = {
  required: ["name", "email"],
  optional: ["cpf", "phone", "address"]
};
```

**4. Livre acesso:** Titular pode consultar dados
```typescript
// Endpoint para titular acessar próprios dados
GET /api/v1/me/data
// Retorna todos os dados armazenados sobre o usuário
```

**5. Qualidade dos dados:** Mantidos atualizados
```typescript
// Notificação para atualização periódica
if (daysSince(user.last_update) > 180) {
  sendNotification("Por favor, atualize seus dados");
}
```

**6. Transparência:** Informações claras
```typescript
// Página de privacidade acessível
GET /privacy-policy
GET /terms-of-service
GET /data-processing-agreement
```

**7. Segurança:** Proteção contra incidentes
```typescript
// Múltiplas camadas de segurança
- Criptografia em trânsito (HTTPS)
- Criptografia em repouso (AES-256)
- Backup diário criptografado
- Firewall + WAF
- Rate limiting
- Auditoria completa
```

**8. Prevenção:** Boas práticas
```typescript
// Validação de entrada
- Sanitização de dados
- Escape de SQL injection
- CORS configurado
- CSP headers
- XSS protection
```

**9. Não discriminação:** Uso ético
```typescript
// Avaliação DISC é ferramenta de desenvolvimento
// NÃO usada para discriminação
// Consentimento informado obrigatório
```

**10. Responsabilização:** Demonstração de compliance
```typescript
// Relatório LGPD gerado automaticamente
GET /api/v1/admin/lgpd-report
{
  consents: 1250,
  dataSubjects: 1000,
  dataProcessing: [...],
  incidentReports: 0,
  auditTrail: "completo"
}
```

#### Direitos dos Titulares

```typescript
// 1. Confirmação da existência de tratamento
GET /api/v1/me/data-processing-confirmation

// 2. Acesso aos dados
GET /api/v1/me/data

// 3. Correção de dados
PATCH /api/v1/me/data

// 4. Anonimização/bloqueio
POST /api/v1/me/anonymize
POST /api/v1/me/block

// 5. Eliminação (direito ao esquecimento)
DELETE /api/v1/me/data
// Mantém apenas dados obrigatórios por lei

// 6. Portabilidade
GET /api/v1/me/data/export?format=json
GET /api/v1/me/data/export?format=csv

// 7. Informações sobre compartilhamento
GET /api/v1/me/data-sharing

// 8. Revogação de consentimento
DELETE /api/v1/me/consent/:consentId

// 9. Oposição a tratamento
POST /api/v1/me/object-processing
```

### 4. Sistema de Auditoria

```typescript
// Toda ação crítica gera log imutável
async function auditLog(action: AuditAction) {
  const log = await db.audit_logs.create({
    user_id: action.userId,
    action: action.type, // CREATE, READ, UPDATE, DELETE
    entity_type: action.entityType,
    entity_id: action.entityId,
    changes: action.changes, // Before/After
    user_ip: action.ip,
    user_agent: action.userAgent,
    timestamp: new Date(),
    severity: calculateSeverity(action),
    category: categorizeAction(action),
    legal_basis: determineLegalBasis(action)
  });
  
  // Hash encadeado (blockchain-like) para imutabilidade
  const previousLog = await db.audit_logs.findFirst({
    orderBy: { timestamp: 'desc' },
    take: 1
  });
  
  log.previous_hash = previousLog?.hash;
  await log.save();
  
  return log;
}
```

---

## 🚀 API RESTful - Endpoints Principais

### Autenticação
```
POST   /api/v1/auth/register          # Cadastro inicial (Master)
POST   /api/v1/auth/login             # Login
POST   /api/v1/auth/refresh           # Renovar token
POST   /api/v1/auth/logout            # Logout
POST   /api/v1/auth/forgot-password   # Recuperar senha
POST   /api/v1/auth/reset-password    # Resetar senha
GET    /api/v1/auth/verify-email      # Verificar email
```

### Instituições (Master only)
```
GET    /api/v1/institutions           # Listar
POST   /api/v1/institutions           # Criar
GET    /api/v1/institutions/:id       # Detalhes
PATCH  /api/v1/institutions/:id       # Atualizar
DELETE /api/v1/institutions/:id       # Desativar
GET    /api/v1/institutions/:id/stats # Estatísticas
```

### Organizações
```
GET    /api/v1/organizations          # Listar (filtrado por permissão)
POST   /api/v1/organizations          # Criar (Master)
GET    /api/v1/organizations/:id      # Detalhes
PATCH  /api/v1/organizations/:id      # Atualizar
DELETE /api/v1/organizations/:id      # Desativar
GET    /api/v1/organizations/:id/users    # Usuários da org
GET    /api/v1/organizations/:id/talents  # Talentos da org
GET    /api/v1/organizations/:id/teams    # Equipes da org
```

### Usuários
```
GET    /api/v1/users                  # Listar
POST   /api/v1/users                  # Criar
GET    /api/v1/users/:id              # Detalhes
PATCH  /api/v1/users/:id              # Atualizar
DELETE /api/v1/users/:id              # Desativar
POST   /api/v1/users/:id/activate     # Ativar
GET    /api/v1/users/me               # Perfil próprio
PATCH  /api/v1/users/me               # Atualizar próprio perfil
```

### Talentos (Banco de Talentos)
```
GET    /api/v1/talents                # Listar (paginado, filtros)
POST   /api/v1/talents                # Criar
GET    /api/v1/talents/:id            # Detalhes completos
PATCH  /api/v1/talents/:id            # Atualizar
DELETE /api/v1/talents/:id            # Desativar
GET    /api/v1/talents/:id/assessments     # Avaliações do talento
GET    /api/v1/talents/:id/profile-history # Histórico de perfis
GET    /api/v1/talents/search?q=...        # Busca avançada
GET    /api/v1/talents/filters              # Filtros disponíveis
```

### Equipes
```
GET    /api/v1/teams                  # Listar
POST   /api/v1/teams                  # Criar
GET    /api/v1/teams/:id              # Detalhes
PATCH  /api/v1/teams/:id              # Atualizar
DELETE /api/v1/teams/:id              # Desativar
POST   /api/v1/teams/:id/members      # Adicionar membro
DELETE /api/v1/teams/:id/members/:talentId  # Remover membro
GET    /api/v1/teams/:id/analysis     # Análise de complementaridade
GET    /api/v1/teams/suggestions?talents=[ids]  # Sugerir formação
```

### Avaliações DISC
```
GET    /api/v1/assessments            # Listar
POST   /api/v1/assessments            # Criar avaliação
GET    /api/v1/assessments/:id        # Detalhes
PATCH  /api/v1/assessments/:id        # Atualizar
DELETE /api/v1/assessments/:id        # Cancelar
POST   /api/v1/assessments/:id/start  # Iniciar
POST   /api/v1/assessments/:id/submit # Submeter respostas
POST   /api/v1/assessments/:id/approve # Aprovar (Admin)
GET    /api/v1/assessments/:id/results # Resultados
GET    /api/v1/assessments/:id/report  # Relatório PDF
```

### Relatórios
```
GET    /api/v1/reports/organization/:id  # Relatório da organização
GET    /api/v1/reports/institution/:id   # Consolidado institucional
GET    /api/v1/reports/talent/:id        # Relatório individual
GET    /api/v1/reports/team/:id          # Relatório de equipe
POST   /api/v1/reports/custom            # Relatório personalizado
GET    /api/v1/reports/export?format=... # Exportar (PDF/Excel)
```

### Auditoria (Master/Admin)
```
GET    /api/v1/audit/logs             # Logs de auditoria
GET    /api/v1/audit/logs/:id         # Detalhes do log
GET    /api/v1/audit/user/:userId     # Logs de um usuário
GET    /api/v1/audit/entity/:type/:id # Logs de uma entidade
GET    /api/v1/audit/export           # Exportar logs
```

### LGPD
```
GET    /api/v1/lgpd/consents          # Listar consentimentos
POST   /api/v1/lgpd/consents          # Registrar consentimento
DELETE /api/v1/lgpd/consents/:id      # Revogar consentimento
GET    /api/v1/lgpd/data-subject/:id  # Dados do titular
POST   /api/v1/lgpd/anonymize/:id     # Anonimizar dados
DELETE /api/v1/lgpd/delete/:id        # Direito ao esquecimento
GET    /api/v1/lgpd/report            # Relatório LGPD
```

### IA/Assistente (Premium)
```
POST   /api/v1/ai/analyze-talent      # Análise de talento
POST   /api/v1/ai/recommend-team      # Recomendar formação de equipe
POST   /api/v1/ai/predict-performance # Prever performance
POST   /api/v1/ai/gap-analysis        # Análise de gaps
POST   /api/v1/ai/development-plan    # Sugerir plano de desenvolvimento
POST   /api/v1/ai/chat                # Chat com assistente
```

### Notificações
```
GET    /api/v1/notifications          # Listar notificações
GET    /api/v1/notifications/:id      # Detalhes
PATCH  /api/v1/notifications/:id/read # Marcar como lida
DELETE /api/v1/notifications/:id      # Arquivar
POST   /api/v1/notifications/mark-all-read # Marcar todas
```

---

## 🧠 Inteligência Artificial Embarcada

### Funcionalidades IA

#### 1. Análise Preditiva de Talentos
```typescript
interface TalentAnalysis {
  talent: Talent;
  predictions: {
    performanceTrend: 'ascending' | 'stable' | 'descending';
    flightRisk: number; // 0-100
    promotionReadiness: number; // 0-100
    recommendedActions: Action[];
  };
  insights: {
    strengths: string[];
    developmentAreas: string[];
    careerPath: CareerSuggestion[];
  };
}
```

#### 2. Formação Inteligente de Equipes
```typescript
interface TeamRecommendation {
  suggestedMembers: Talent[];
  complementarityScore: number;
  discBalance: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  synergy: {
    strongPoints: string[];
    potentialConflicts: string[];
    mitigationStrategies: string[];
  };
  alternativeCompositions: TeamComposition[];
}
```

#### 3. Detecção Automática de Gaps
```typescript
interface GapAnalysis {
  organization: Organization;
  gaps: {
    type: 'skill' | 'competency' | 'leadership' | 'technical';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    recommendedActions: Action[];
    talentsToAddress: Talent[];
  }[];
  recommendations: {
    hiring: HiringRecommendation[];
    training: TrainingRecommendation[];
    reorganization: ReorganizationSuggestion[];
  };
}
```

#### 4. Assistente Conversacional Avançado
```typescript
// Contexto ampliado com histórico e aprendizado
interface AIAssistantContext {
  user: User;
  organization: Organization;
  conversationHistory: Message[];
  institutionalData: {
    totalTalents: number;
    totalTeams: number;
    avgPerformance: number;
    recentAssessments: Assessment[];
  };
  userPreferences: {
    preferredAnalysis: string[];
    lastQueries: string[];
  };
}

// Capacidades expandidas
const aiCapabilities = [
  "Análise de tendências de desempenho",
  "Previsão de turnover",
  "Sugestões de reorganização",
  "Identificação de líderes emergentes",
  "Análise de clima organizacional",
  "Benchmarking entre organizações",
  "Alertas proativos de riscos",
  "Planos de sucessão",
  "ROI de treinamentos"
];
```

### Integração com APIs de IA

```typescript
// Google Gemini Pro
const geminiService = {
  model: 'gemini-pro',
  features: [
    'Análise de texto longo',
    'Geração de insights',
    'Resumo de avaliações',
    'Recomendações personalizadas'
  ]
};

// OpenAI GPT-4 (alternativa/complemento)
const openAIService = {
  model: 'gpt-4-turbo',
  features: [
    'Análise preditiva',
    'Processamento de linguagem natural',
    'Geração de relatórios'
  ]
};

// Modelos próprios (futuro)
const customModels = {
  disc_predictor: 'Prevê perfil DISC baseado em comportamentos',
  team_optimizer: 'Otimiza formação de equipes',
  performance_forecaster: 'Prevê performance futura'
};
```

---

## 📊 Painel de Controle e Analytics

### Dashboards por Papel

#### Master Dashboard
```typescript
interface MasterDashboard {
  overview: {
    totalInstitutions: number;
    totalOrganizations: number;
    totalUsers: number;
    totalTalents: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  
  charts: {
    organizationGrowth: TimeSeriesChart;
    userActivity: HeatMap;
    assessmentCompletion: ProgressChart;
    topPerformingOrgs: RankingChart;
  };
  
  alerts: {
    systemAlerts: Alert[];
    securityAlerts: Alert[];
    lgpdCompliance: ComplianceStatus;
  };
  
  quickActions: Action[];
}
```

#### Admin Org Dashboard
```typescript
interface AdminOrgDashboard {
  overview: {
    totalTalents: number;
    totalTeams: number;
    completedAssessments: number;
    avgPerformance: number;
  };
  
  charts: {
    discDistribution: PieChart;
    performanceTrend: LineChart;
    teamComposition: StackedBarChart;
    skillMatrix: HeatMap;
  };
  
  insights: {
    topPerformers: Talent[];
    atRiskTalents: Talent[];
    skillGaps: Gap[];
    trainingRecommendations: Training[];
  };
  
  quickActions: Action[];
}
```

### Relatórios Avançados

```typescript
interface AdvancedReport {
  type: 'executive' | 'detailed' | 'comparative' | 'predictive';
  
  sections: {
    summary: ExecutiveSummary;
    demographics: DemographicAnalysis;
    performance: PerformanceMetrics;
    disc: DISCAnalysis;
    teams: TeamAnalysis;
    development: DevelopmentPlans;
    predictions: Predictions;
    recommendations: Recommendations;
  };
  
  exportFormats: ['PDF', 'Excel', 'PowerPoint'];
  scheduling: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: User[];
  };
}
```

---

## 🔧 Melhores Práticas de Engenharia

### 1. Clean Architecture

```
src/
├── domain/               # Regras de negócio
│   ├── entities/        # Entidades
│   ├── value-objects/   # Objetos de valor
│   └── interfaces/      # Contratos
│
├── application/         # Casos de uso
│   ├── use-cases/
│   ├── dtos/
│   └── validators/
│
├── infrastructure/      # Detalhes técnicos
│   ├── database/       # Prisma, repositories
│   ├── http/           # Express, controllers
│   ├── auth/           # JWT, bcrypt
│   ├── cache/          # Redis
│   └── external/       # APIs externas
│
└── presentation/        # Interface
    ├── routes/
    ├── middlewares/
    └── validators/
```

### 2. Design Patterns

```typescript
// Repository Pattern
interface ITalentRepository {
  findById(id: string): Promise<Talent>;
  findAll(filters: TalentFilters): Promise<Talent[]>;
  create(talent: CreateTalentDTO): Promise<Talent>;
  update(id: string, data: UpdateTalentDTO): Promise<Talent>;
  delete(id: string): Promise<void>;
}

// Factory Pattern
class AssessmentFactory {
  create(type: AssessmentType): IAssessment {
    switch(type) {
      case 'DISC': return new DISCAssessment();
      case '360': return new Review360Assessment();
      case 'Performance': return new PerformanceAssessment();
    }
  }
}

// Observer Pattern (Notificações)
class NotificationObserver {
  notify(event: DomainEvent): void {
    switch(event.type) {
      case 'AssessmentCompleted':
        this.sendNotification(event.data);
        break;
      case 'TalentAtRisk':
        this.alertManagers(event.data);
        break;
    }
  }
}

// Strategy Pattern (Cálculo de perfil)
interface ProfileCalculationStrategy {
  calculate(answers: Answer[]): Profile;
}

class DISCCalculationStrategy implements ProfileCalculationStrategy {
  calculate(answers: Answer[]): DISCProfile {
    // Lógica específica DISC
  }
}
```

### 3. SOLID Principles

```typescript
// S - Single Responsibility
class UserPasswordService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// O - Open/Closed
abstract class ReportGenerator {
  abstract generate(data: any): Report;
}

class PDFReportGenerator extends ReportGenerator {
  generate(data: any): Report {
    // Gerar PDF
  }
}

// L - Liskov Substitution
interface IAuthenticator {
  authenticate(credentials: Credentials): Promise<User>;
}

class JWTAuthenticator implements IAuthenticator {
  async authenticate(credentials: Credentials): Promise<User> {
    // Implementação JWT
  }
}

// I - Interface Segregation
interface IUserReader {
  findById(id: string): Promise<User>;
}

interface IUserWriter {
  create(user: CreateUserDTO): Promise<User>;
}

// D - Dependency Inversion
class CreateTalentUseCase {
  constructor(
    private talentRepository: ITalentRepository,
    private auditLogger: IAuditLogger,
    private validator: IValidator
  ) {}
}
```

### 4. Testing Strategy

```typescript
// Unit Tests (Jest)
describe('TalentService', () => {
  it('should create talent with valid data', async () => {
    const talent = await talentService.create(validData);
    expect(talent).toBeDefined();
    expect(talent.name).toBe(validData.name);
  });
  
  it('should throw error with invalid data', async () => {
    await expect(talentService.create(invalidData))
      .rejects.toThrow('Validation failed');
  });
});

// Integration Tests
describe('POST /api/v1/talents', () => {
  it('should create talent and return 201', async () => {
    const response = await request(app)
      .post('/api/v1/talents')
      .set('Authorization', `Bearer ${token}`)
      .send(talentData);
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});

// E2E Tests (Playwright)
test('Admin should create new talent', async ({ page }) => {
  await page.goto('/talents');
  await page.click('button:has-text("Novo Talento")');
  await page.fill('input[name="name"]', 'João Silva');
  await page.click('button:has-text("Salvar")');
  await expect(page.locator('text=Talento criado')).toBeVisible();
});
```

### 5. Error Handling

```typescript
// Custom Error Classes
class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
  }
}

class ValidationError extends DomainError {
  constructor(message: string, public fields: string[]) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        fields: (err as ValidationError).fields
      }
    });
  }
  
  // Log erro não tratado
  logger.error('Unhandled error', err);
  
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

### 6. Performance Optimization

```typescript
// Caching (Redis)
class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl: number): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
}

// Query Optimization
const talents = await prisma.talent.findMany({
  where: { organizationId },
  include: {
    assessments: {
      orderBy: { completedAt: 'desc' },
      take: 5
    }
  },
  skip: (page - 1) * pageSize,
  take: pageSize
});

// Database Indexing
@@index([organizationId, isActive])
@@index([email])
@@index([createdAt DESC])

// Pagination
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Rate Limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: 'Too many requests'
});
```

---

## 🚀 Plano de Implementação

### Fase 1: Fundação (Semanas 1-2)
- [x] Setup projeto backend (Node + TypeScript + Prisma)
- [x] Configurar PostgreSQL + Docker
- [x] Modelagem banco de dados
- [x] Migrations iniciais
- [x] Setup CI/CD básico

### Fase 2: Autenticação e Core (Semanas 3-4)
- [ ] Sistema de autenticação JWT
- [ ] CRUD Institutions
- [ ] CRUD Organizations
- [ ] CRUD Users
- [ ] Sistema de permissões RBAC

### Fase 3: Talentos e Avaliações (Semanas 5-6)
- [ ] CRUD Talents
- [ ] CRUD Assessments
- [ ] Cálculo de perfil DISC
- [ ] Sistema de aprovação

### Fase 4: Equipes e Analytics (Semanas 7-8)
- [ ] CRUD Teams
- [ ] Análise de complementaridade
- [ ] Dashboards
- [ ] Relatórios básicos

### Fase 5: Segurança e LGPD (Semanas 9-10)
- [ ] Sistema de auditoria
- [ ] Gestão de consentimentos
- [ ] Criptografia de dados sensíveis
- [ ] Direitos dos titulares
- [ ] Documentação LGPD

### Fase 6: IA e Features Avançadas (Semanas 11-12)
- [ ] Integração Gemini API
- [ ] Análise preditiva
- [ ] Recomendações inteligentes
- [ ] Assistente conversacional
- [ ] Notificações em tempo real

### Fase 7: Frontend Migration (Semanas 13-14)
- [ ] Refatorar services para consumir API
- [ ] Gestão de estado global
- [ ] Error handling
- [ ] Loading states
- [ ] Feedback visual

### Fase 8: Testes e Deploy (Semanas 15-16)
- [ ] Suite de testes (unit + integration + E2E)
- [ ] Load testing
- [ ] Security testing
- [ ] Deploy staging
- [ ] Deploy produção

### Fase 9: Documentação e Treinamento (Semana 17)
- [ ] Documentação API (Swagger)
- [ ] Guias de usuário
- [ ] Vídeos tutoriais
- [ ] Manual do administrador
- [ ] Documentação técnica

### Fase 10: Lançamento e Suporte (Semana 18+)
- [ ] Monitoramento
- [ ] Suporte aos usuários
- [ ] Correções de bugs
- [ ] Melhorias contínuas

---

## 📈 Métricas de Sucesso

### Performance
- ✅ Tempo de resposta API < 200ms (95 percentil)
- ✅ Uptime > 99.9%
- ✅ Capacidade: 10.000 usuários simultâneos
- ✅ Latência banco de dados < 50ms

### Segurança
- ✅ Zero vulnerabilidades críticas
- ✅ Compliance LGPD 100%
- ✅ Auditorias trimestrais passadas
- ✅ Backup diário testado

### Usabilidade
- ✅ NPS (Net Promoter Score) > 50
- ✅ Taxa de adoção > 80%
- ✅ Tempo médio de treinamento < 2h
- ✅ Satisfação usuários > 4.5/5

### Negócio
- ✅ ROI positivo em 12 meses
- ✅ Redução 50% tempo de avaliações
- ✅ Aumento 30% retenção de talentos
- ✅ Melhoria 25% formação de equipes

---

## 🎓 Conclusão

O SISGEAD 3.0 Enterprise será uma **plataforma completa** para gestão estratégica de pessoas em instituições de P&D&I, combinando:

✅ **Tecnologia robusta** (Node.js + PostgreSQL)  
✅ **Segurança enterprise** (LGPD compliant)  
✅ **Inteligência artificial** (análise preditiva)  
✅ **Usabilidade superior** (UX otimizada)  
✅ **Escalabilidade** (multi-tenancy)  
✅ **Melhores práticas** (Clean Architecture, SOLID, Testing)

Uma solução **100% própria**, sem dependências de terceiros críticas, com controle total sobre dados e funcionalidades.

---

**Próximos Passos:**
1. Aprovação da arquitetura
2. Setup do ambiente de desenvolvimento
3. Início da Fase 1 (Fundação)

**Quer que eu comece a implementação?** 🚀
