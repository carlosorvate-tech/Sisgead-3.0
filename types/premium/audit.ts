/**
 * SISGEAD Premium 3.0 - Audit Types
 * Sistema de tipos para auditoria e logs
 */

/**
 * Tipo de ação auditada
 */
export enum AuditActionType {
  // Ações de autenticação
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',
  
  // Ações de usuário
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ACTIVATED = 'user_activated',
  USER_DEACTIVATED = 'user_deactivated',
  USER_LOCKED = 'user_locked',
  USER_UNLOCKED = 'user_unlocked',
  
  // Ações de instituição
  INSTITUTION_CREATED = 'institution_created',
  INSTITUTION_UPDATED = 'institution_updated',
  INSTITUTION_SETTINGS_CHANGED = 'institution_settings_changed',
  
  // Ações de organização
  ORGANIZATION_CREATED = 'organization_created',
  ORGANIZATION_UPDATED = 'organization_updated',
  ORGANIZATION_DELETED = 'organization_deleted',
  ORGANIZATION_MOVED = 'organization_moved',
  
  // Ações de avaliação
  ASSESSMENT_CREATED = 'assessment_created',
  ASSESSMENT_UPDATED = 'assessment_updated',
  ASSESSMENT_DELETED = 'assessment_deleted',
  ASSESSMENT_COMPLETED = 'assessment_completed',
  ASSESSMENT_EXPORTED = 'assessment_exported',
  
  // Ações de privilégios
  PRIVILEGES_GRANTED = 'privileges_granted',
  PRIVILEGES_REVOKED = 'privileges_revoked',
  ROLE_CHANGED = 'role_changed',
  
  // Ações de dados
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',
  DATA_DELETED = 'data_deleted',
  BACKUP_CREATED = 'backup_created',
  BACKUP_RESTORED = 'backup_restored',
  
  // Ações de configuração
  SETTINGS_CHANGED = 'settings_changed',
  FEATURE_ENABLED = 'feature_enabled',
  FEATURE_DISABLED = 'feature_disabled',
  
  // Ações de sistema
  MIGRATION_STARTED = 'migration_started',
  MIGRATION_COMPLETED = 'migration_completed',
  VERSION_CHANGED = 'version_changed',
  
  // Outros
  OTHER = 'other'
}

/**
 * Nível de severidade do log
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Contexto da ação auditada
 */
export interface AuditContext {
  /** IP do usuário */
  ipAddress?: string;
  
  /** User Agent */
  userAgent?: string;
  
  /** Navegador */
  browser?: string;
  
  /** Sistema operacional */
  os?: string;
  
  /** Dispositivo */
  device?: string;
  
  /** Localização (cidade, país) */
  location?: string;
  
  /** ID da sessão */
  sessionId?: string;
}

/**
 * Detalhes da alteração (antes/depois)
 */
export interface AuditChange {
  /** Campo alterado */
  field: string;
  
  /** Valor anterior */
  oldValue: any;
  
  /** Novo valor */
  newValue: any;
}

/**
 * Entrada de auditoria completa
 */
export interface AuditEntry {
  /** ID único do log (UUID) */
  id: string;
  
  /** ID da instituição */
  institutionId: string;
  
  /** ID da organização (se aplicável) */
  organizationId?: string;
  
  /** Tipo de ação */
  actionType: AuditActionType;
  
  /** Descrição detalhada da ação */
  description: string;
  
  /** ID do usuário que executou a ação */
  userId: string;
  
  /** Nome do usuário (snapshot) */
  userName: string;
  
  /** Papel do usuário na época da ação */
  userRole: string;
  
  /** ID do recurso afetado */
  resourceId?: string;
  
  /** Tipo do recurso afetado */
  resourceType?: string;
  
  /** Severidade */
  severity: AuditSeverity;
  
  /** Contexto da ação */
  context: AuditContext;
  
  /** Mudanças específicas (para updates) */
  changes?: AuditChange[];
  
  /** Dados adicionais */
  metadata?: Record<string, any>;
  
  /** Ação foi bem sucedida */
  success: boolean;
  
  /** Mensagem de erro (se falhou) */
  errorMessage?: string;
  
  /** Timestamp da ação */
  timestamp: string;
  
  /** Data de expiração do log (para limpeza automática) */
  expiresAt?: string;
}

/**
 * Dados para criação de novo log de auditoria
 */
export interface CreateAuditEntryData {
  institutionId: string;
  organizationId?: string;
  actionType: AuditActionType;
  description: string;
  userId: string;
  userName: string;
  userRole: string;
  resourceId?: string;
  resourceType?: string;
  severity?: AuditSeverity;
  context?: Partial<AuditContext>;
  changes?: AuditChange[];
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Filtros para busca de logs
 */
export interface AuditFilters {
  institutionId?: string;
  organizationId?: string;
  userId?: string;
  actionType?: AuditActionType | AuditActionType[];
  severity?: AuditSeverity | AuditSeverity[];
  resourceType?: string;
  resourceId?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

/**
 * Resultado paginado de logs
 */
export interface AuditListResult {
  entries: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Estatísticas de auditoria
 */
export interface AuditStats {
  /** Total de logs */
  totalEntries: number;
  
  /** Logs por tipo de ação */
  byActionType: Record<AuditActionType, number>;
  
  /** Logs por severidade */
  bySeverity: Record<AuditSeverity, number>;
  
  /** Logs por usuário (top 10) */
  byUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  
  /** Ações falhadas */
  failedActions: number;
  
  /** Taxa de sucesso (%) */
  successRate: number;
  
  /** Período dos dados */
  period: {
    startDate: string;
    endDate: string;
  };
  
  /** Última atualização */
  lastUpdated: string;
}

/**
 * Configuração de retenção de logs
 */
export interface AuditRetentionPolicy {
  /** Ações que devem ser mantidas indefinidamente */
  keepForever: AuditActionType[];
  
  /** Dias de retenção por severidade */
  retentionDays: Record<AuditSeverity, number>;
  
  /** Auto-limpeza habilitada */
  autoCleanup: boolean;
  
  /** Frequência de limpeza */
  cleanupFrequency: 'daily' | 'weekly' | 'monthly';
}

/**
 * Política de retenção padrão
 */
export const DEFAULT_RETENTION_POLICY: AuditRetentionPolicy = {
  keepForever: [
    AuditActionType.INSTITUTION_CREATED,
    AuditActionType.USER_CREATED,
    AuditActionType.ORGANIZATION_CREATED,
    AuditActionType.DATA_DELETED,
    AuditActionType.PRIVILEGES_GRANTED,
    AuditActionType.PRIVILEGES_REVOKED
  ],
  retentionDays: {
    [AuditSeverity.INFO]: 90,
    [AuditSeverity.WARNING]: 180,
    [AuditSeverity.ERROR]: 365,
    [AuditSeverity.CRITICAL]: 730 // 2 anos
  },
  autoCleanup: true,
  cleanupFrequency: 'weekly'
};

/**
 * Helper para criar descrições de ações
 */
export const AuditActionDescriptions: Record<AuditActionType, (data: any) => string> = {
  [AuditActionType.LOGIN]: (data) => `Usuário realizou login`,
  [AuditActionType.LOGOUT]: (data) => `Usuário realizou logout`,
  [AuditActionType.LOGIN_FAILED]: (data) => `Tentativa de login falhou`,
  [AuditActionType.PASSWORD_CHANGED]: (data) => `Senha foi alterada`,
  [AuditActionType.PASSWORD_RESET]: (data) => `Senha foi redefinida`,
  
  [AuditActionType.USER_CREATED]: (data) => `Novo usuário criado: ${data.userName}`,
  [AuditActionType.USER_UPDATED]: (data) => `Usuário atualizado: ${data.userName}`,
  [AuditActionType.USER_DELETED]: (data) => `Usuário removido: ${data.userName}`,
  [AuditActionType.USER_ACTIVATED]: (data) => `Usuário ativado: ${data.userName}`,
  [AuditActionType.USER_DEACTIVATED]: (data) => `Usuário desativado: ${data.userName}`,
  [AuditActionType.USER_LOCKED]: (data) => `Usuário bloqueado: ${data.userName}`,
  [AuditActionType.USER_UNLOCKED]: (data) => `Usuário desbloqueado: ${data.userName}`,
  
  [AuditActionType.INSTITUTION_CREATED]: (data) => `Instituição criada: ${data.name}`,
  [AuditActionType.INSTITUTION_UPDATED]: (data) => `Instituição atualizada: ${data.name}`,
  [AuditActionType.INSTITUTION_SETTINGS_CHANGED]: (data) => `Configurações da instituição alteradas`,
  
  [AuditActionType.ORGANIZATION_CREATED]: (data) => `Organização criada: ${data.name}`,
  [AuditActionType.ORGANIZATION_UPDATED]: (data) => `Organização atualizada: ${data.name}`,
  [AuditActionType.ORGANIZATION_DELETED]: (data) => `Organização removida: ${data.name}`,
  [AuditActionType.ORGANIZATION_MOVED]: (data) => `Organização movida na hierarquia`,
  
  [AuditActionType.ASSESSMENT_CREATED]: (data) => `Avaliação criada`,
  [AuditActionType.ASSESSMENT_UPDATED]: (data) => `Avaliação atualizada`,
  [AuditActionType.ASSESSMENT_DELETED]: (data) => `Avaliação removida`,
  [AuditActionType.ASSESSMENT_COMPLETED]: (data) => `Avaliação concluída`,
  [AuditActionType.ASSESSMENT_EXPORTED]: (data) => `Avaliação exportada`,
  
  [AuditActionType.PRIVILEGES_GRANTED]: (data) => `Privilégios concedidos a ${data.targetUser}`,
  [AuditActionType.PRIVILEGES_REVOKED]: (data) => `Privilégios revogados de ${data.targetUser}`,
  [AuditActionType.ROLE_CHANGED]: (data) => `Papel alterado: ${data.oldRole} → ${data.newRole}`,
  
  [AuditActionType.DATA_EXPORTED]: (data) => `Dados exportados: ${data.type}`,
  [AuditActionType.DATA_IMPORTED]: (data) => `Dados importados: ${data.type}`,
  [AuditActionType.DATA_DELETED]: (data) => `Dados removidos: ${data.type}`,
  [AuditActionType.BACKUP_CREATED]: (data) => `Backup criado`,
  [AuditActionType.BACKUP_RESTORED]: (data) => `Backup restaurado`,
  
  [AuditActionType.SETTINGS_CHANGED]: (data) => `Configurações alteradas`,
  [AuditActionType.FEATURE_ENABLED]: (data) => `Feature ativada: ${data.feature}`,
  [AuditActionType.FEATURE_DISABLED]: (data) => `Feature desativada: ${data.feature}`,
  
  [AuditActionType.MIGRATION_STARTED]: (data) => `Migração iniciada: ${data.from} → ${data.to}`,
  [AuditActionType.MIGRATION_COMPLETED]: (data) => `Migração concluída: ${data.from} → ${data.to}`,
  [AuditActionType.VERSION_CHANGED]: (data) => `Versão alterada: ${data.from} → ${data.to}`,
  
  [AuditActionType.OTHER]: (data) => data.description || 'Ação customizada'
};
