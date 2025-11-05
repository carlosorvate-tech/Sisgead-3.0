// 🏢 SISGEAD 2.0 - Multi-Tenant Institutional Types
// Estrutura completa para sistema institucional multi-tenant

export interface Tenant {
  id: string;
  name: string;
  displayName: string;
  cnpj?: string;
  domain?: string;
  isActive: boolean;
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
  metadata?: TenantMetadata;
}

export interface TenantSettings {
  // Configurações visuais
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    customCss?: string;
  };
  
  // Configurações funcionais
  features?: {
    smartHintsEnabled: boolean;
    auditLoggingLevel: 'basic' | 'detailed' | 'comprehensive';
    maxUsers?: number;
    dataRetentionDays?: number;
  };
  
  // Configurações de segurança
  security?: {
    requireTwoFactor: boolean;
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number; // minutes
    ipWhitelist?: string[];
  };
  
  // Configurações regionais
  locale?: {
    language: string;
    currency: string;
    timezone: string;
    dateFormat: string;
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays?: number;
}

export interface TenantMetadata {
  // Informações administrativas
  contactEmail?: string;
  contactPhone?: string;
  address?: Address;
  
  // Informações técnicas
  dataRegion?: 'br-south' | 'br-southeast' | 'br-northeast';
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  
  // Informações de compliance
  lgpdCompliant: boolean;
  dataProcessingAgreement?: string;
  privacyPolicyUrl?: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// 👤 User Multi-Tenant Extensions
export interface InstitutionalUser {
  id: string;
  tenantId: string;
  cpf: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  
  // Tenant-specific data
  tenantData?: Record<string, any>;
}

export type UserRole = 
  | 'super_admin'      // Acesso a todos os tenants
  | 'tenant_admin'     // Admin de um tenant específico
  | 'manager'          // Gestor dentro do tenant
  | 'evaluator'        // Avaliador padrão
  | 'viewer'           // Apenas visualização
  | 'guest';           // Acesso limitado temporário

export interface Permission {
  resource: string;     // 'users', 'assessments', 'reports', etc.
  actions: Action[];    // ['create', 'read', 'update', 'delete']
  scope?: 'own' | 'team' | 'tenant' | 'all';
}

export type Action = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import';

// 📊 Assessment Multi-Tenant Extensions  
export interface TenantAssessment {
  id: string;
  tenantId: string;
  assessmentData: any;  // Existing assessment structure
  
  // Multi-tenant specific fields
  visibility: 'private' | 'tenant' | 'cross_tenant';
  tags?: string[];
  customFields?: Record<string, any>;
  
  // Audit trail
  createdBy: string;
  createdAt: Date;
  modifiedBy?: string;
  modifiedAt?: Date;
  version: number;
}

// 🔍 Audit & Compliance
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  
  // Event details
  action: AuditAction;
  resource: string;
  resourceId?: string;
  
  // Context
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  
  // Data
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  
  // Classification
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: AuditCategory;
}

export type AuditAction = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'login' | 'logout' | 'login_failed'
  | 'export' | 'import'
  | 'permission_change' | 'config_change'
  | 'system_access' | 'data_breach_attempt';

export type AuditCategory =
  | 'authentication'
  | 'authorization' 
  | 'data_access'
  | 'configuration'
  | 'security'
  | 'compliance'
  | 'system';

// 📈 Analytics & Reporting
export interface TenantAnalytics {
  tenantId: string;
  period: AnalyticsPeriod;
  
  // Usage metrics
  activeUsers: number;
  totalAssessments: number;
  assessmentsCompleted: number;
  avgCompletionTime: number; // minutes
  
  // Performance metrics
  loginSuccessRate: number;  // percentage
  systemUptime: number;      // percentage
  avgResponseTime: number;   // milliseconds
  
  // Security metrics
  failedLoginAttempts: number;
  securityIncidents: number;
  complianceScore: number;   // percentage
  
  // Engagement metrics
  smartHintsUsage: number;
  featureAdoption: Record<string, number>;
  userSatisfaction?: number; // rating 1-5
  
  generatedAt: Date;
}

export interface AnalyticsPeriod {
  start: Date;
  end: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

// 🎛️ Configuration Types
export interface TenantConfiguration {
  tenantId: string;
  
  // Feature toggles
  features: {
    [featureName: string]: boolean;
  };
  
  // Integration settings
  integrations?: {
    [integrationName: string]: {
      enabled: boolean;
      config: Record<string, any>;
    };
  };
  
  // Notification settings
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    channels: NotificationChannel[];
  };
  
  // Backup & Recovery
  backup?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number; // days
    location: string;
  };
}

export interface NotificationChannel {
  type: 'email' | 'webhook' | 'slack' | 'teams';
  endpoint: string;
  events: string[];
  isActive: boolean;
}

// 🔄 Data Migration & Import/Export
export interface TenantDataExport {
  tenantId: string;
  exportType: 'full' | 'partial';
  format: 'json' | 'csv' | 'xlsx';
  
  // Data selection
  includeUsers: boolean;
  includeAssessments: boolean;
  includeAuditLogs: boolean;
  includeConfiguration: boolean;
  
  // Filters
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  // Export metadata
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  expiresAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface TenantDataImport {
  tenantId: string;
  importType: 'merge' | 'replace' | 'append';
  source: 'file' | 'another_tenant' | 'external_system';
  
  // Import options
  validateOnly: boolean;
  skipConflicts: boolean;
  
  // Import metadata
  uploadedBy: string;
  uploadedAt: Date;
  processedAt?: Date;
  status: 'uploaded' | 'validating' | 'processing' | 'completed' | 'failed';
  
  // Results
  totalRecords?: number;
  successfulRecords?: number;
  failedRecords?: number;
  errors?: ImportError[];
}

export interface ImportError {
  recordId?: string;
  line?: number;
  field?: string;
  error: string;
  severity: 'warning' | 'error';
}

// 🌐 Context & State Management
export interface TenantContext {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  userRole: UserRole;
  permissions: Permission[];
  
  // State flags  
  isLoading: boolean;
  isMultiTenant: boolean;
  isSuperAdmin: boolean;
}

export interface MultiTenantState {
  // Current context
  context: TenantContext;
  
  // Cached data
  tenants: Map<string, Tenant>;
  users: Map<string, InstitutionalUser>;
  configurations: Map<string, TenantConfiguration>;
  
  // UI state
  activePage: string;
  sidebarCollapsed: boolean;
  notifications: NotificationMessage[];
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  tenantId?: string;
  actionUrl?: string;
}

// 🔧 Utility Types
export type TenantId = string;
export type UserId = string;
export type AssessmentId = string;

export interface TenantOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  tenantId: string;
}

export interface BulkTenantOperation<T = any> {
  operations: Array<{
    tenantId: string;
    operation: T;
  }>;
  results?: TenantOperationResult[];
  overallSuccess: boolean;
}

// 🎯 Validation Schemas (for runtime validation)
export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'cpf' | 'cnpj' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message?: string;
}

export interface TenantValidation {
  rules: ValidationRule[];
  customValidators?: Record<string, (value: any) => boolean>;
}

// 🚀 API Response Types
export interface TenantApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata?: {
    requestId: string;
    timestamp: Date;
    version: string;
  };
}

export type TenantListResponse = TenantApiResponse<Tenant[]>;
export type TenantDetailResponse = TenantApiResponse<Tenant>;
export type UserListResponse = TenantApiResponse<InstitutionalUser[]>;
export type AnalyticsResponse = TenantApiResponse<TenantAnalytics>;

// 📱 Mobile & Responsive Types
export interface MobileConfig {
  enableOfflineMode: boolean;
  maxOfflineAssessments: number;
  syncFrequency: number; // minutes
  compressionLevel: 'low' | 'medium' | 'high';
}

export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  columns: number;
  fontSize: string;
}

// 🌍 Internationalization
export interface I18nConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
  dateFormats: Record<string, string>;
  numberFormats: Record<string, Intl.NumberFormatOptions>;
}

// 🎨 Theming & Customization
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Component overrides
  components?: {
    [componentName: string]: Record<string, any>;
  };
  
  // Custom CSS
  customStyles?: string;
}

// ✅ Complete Type Export
export type InstitutionalTypes = {
  // Core types
  Tenant,
  TenantSettings, 
  TenantMetadata,
  InstitutionalUser,
  TenantAssessment,
  
  // Audit & Security
  AuditLog,
  Permission,
  
  // Analytics & Reporting
  TenantAnalytics,
  AnalyticsPeriod,
  
  // Configuration
  TenantConfiguration,
  NotificationChannel,
  
  // Data Management
  TenantDataExport,
  TenantDataImport,
  
  // State Management
  TenantContext,
  MultiTenantState,
  
  // API & Responses
  TenantApiResponse,
  TenantOperationResult,
  
  // Enums & Unions
  UserRole,
  Action,
  AuditAction,
  AuditCategory
};