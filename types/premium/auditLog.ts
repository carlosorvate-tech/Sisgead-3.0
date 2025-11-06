/**
 * SISGEAD 3.0 Premium - Audit Log Types
 * Sistema de Auditoria Completa para Rastreabilidade e KPIs
 * 
 * Decisões Aprovadas (05/11/2025):
 * - Auditoria completa de todos eventos de equipe
 * - Rastreamento de transferências, remoções, desistências
 * - Base para cálculo de KPIs (turnover, retention, etc)
 * - Retenção permanente para compliance
 */

export enum AuditEventType {
  // Eventos de Avaliação
  ASSESSMENT_CREATED = 'assessment_created',
  ASSESSMENT_STARTED = 'assessment_started',
  ASSESSMENT_COMPLETED = 'assessment_completed',
  ASSESSMENT_APPROVED = 'assessment_approved',
  ASSESSMENT_REJECTED = 'assessment_rejected',
  ASSESSMENT_ARCHIVED = 'assessment_archived',
  
  // Eventos de Equipe
  TEAM_CREATED = 'team_created',
  TEAM_UPDATED = 'team_updated',
  TEAM_ARCHIVED = 'team_archived',
  
  // Eventos de Membro (KPIs críticos)
  MEMBER_ADDED = 'member_added',
  MEMBER_UPDATED = 'member_updated',
  MEMBER_REMOVED = 'member_removed',              // Remoção geral
  MEMBER_TRANSFERRED = 'member_transferred',      // Transferência inter-org
  MEMBER_PROJECT_ENDED = 'member_project_ended',  // Término de projeto
  MEMBER_CONTRACT_ENDED = 'member_contract_ended',// Término de vínculo
  MEMBER_RESIGNATION = 'member_resignation',      // Desistência pessoal
  MEMBER_ARCHIVED = 'member_archived',            // Soft delete
  
  // Eventos de Aprovação
  APPROVAL_REQUESTED = 'approval_requested',
  APPROVAL_GRANTED = 'approval_granted',
  APPROVAL_DENIED = 'approval_denied',
  
  // Eventos de Organização
  ORGANIZATION_CREATED = 'organization_created',
  ORGANIZATION_UPDATED = 'organization_updated',
  ORGANIZATION_SETTINGS_CHANGED = 'organization_settings_changed',
  
  // Eventos de Dados
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  DATA_PURGE = 'data_purge',                      // Expurgo automático
  
  // Eventos de Segurança
  ACCESS_GRANTED = 'access_granted',
  ACCESS_REVOKED = 'access_revoked',
  PERMISSION_CHANGED = 'permission_changed'
}

export enum AuditSeverity {
  INFO = 'info',                      // Informação geral
  WARNING = 'warning',                // Atenção necessária
  CRITICAL = 'critical',              // Evento crítico para KPIs
  SECURITY = 'security'               // Evento de segurança
}

export interface TeamAuditLog {
  // Identificação
  id: string;
  institutionId: string;              // Multi-tenant: Institution
  organizationId: string;             // Multi-tenant: Organization
  teamId?: string;                    // Equipe relacionada (opcional)
  
  // Evento
  eventType: AuditEventType;
  severity: AuditSeverity;
  timestamp: Date;
  
  // Atores
  actorId: string;                    // Quem executou a ação
  actorRole?: string;                 // Papel do ator no momento
  targetUserId?: string;              // Usuário alvo da ação (se aplicável)
  targetResourceId?: string;          // ID do recurso afetado
  targetResourceType?: string;        // Tipo do recurso (team, assessment, member)
  
  // Detalhes do Evento
  details: AuditEventDetails;
  
  // Contexto Adicional
  metadata?: Record<string, any>;
  
  // Rastreabilidade
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  
  // Impacto em KPIs
  affectsKPIs: boolean;               // Se deve recalcular KPIs
  kpiCategories?: KPICategory[];      // Quais KPIs são afetados
}

export interface AuditEventDetails {
  // Descrição
  description: string;
  action: string;                     // Ex: "added", "removed", "transferred"
  
  // Dados Antes/Depois (para tracking de mudanças)
  before?: Record<string, any>;
  after?: Record<string, any>;
  changes?: ChangeDetail[];
  
  // Razão/Justificativa
  reason?: string;
  notes?: string;
  
  // Transferências (KPI crítico)
  transferDetails?: {
    fromOrganizationId: string;
    fromTeamId: string;
    toOrganizationId: string;
    toTeamId: string;
    keptAssessment: boolean;
  };
  
  // Remoções (KPI crítico)
  removalDetails?: {
    reason: string;                   // RemovalReason enum
    details?: string;
    finalStatus: string;
    daysInTeam: number;
    daysInOrganization: number;
  };
  
  // Aprovações
  approvalDetails?: {
    approverId: string;
    approved: boolean;
    notes?: string;
  };
}

export interface ChangeDetail {
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
}

export enum KPICategory {
  TURNOVER = 'turnover',              // Taxa de rotatividade
  RETENTION = 'retention',            // Taxa de retenção
  TRANSFER = 'transfer',              // Transferências inter-org
  ASSESSMENT = 'assessment',          // Avaliações realizadas
  PERFORMANCE = 'performance',        // Performance geral
  ENGAGEMENT = 'engagement'           // Engajamento
}

export interface AuditLogSummary {
  id: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  timestamp: Date;
  actorName: string;
  targetUserName?: string;
  description: string;
  affectsKPIs: boolean;
}

export interface AuditLogFilters {
  institutionId: string;              // Obrigatório (multi-tenant)
  organizationId?: string;            // Filtrar por organização
  teamId?: string;                    // Filtrar por equipe
  eventType?: AuditEventType[];       // Filtrar por tipo de evento
  severity?: AuditSeverity[];         // Filtrar por severidade
  actorId?: string;                   // Filtrar por ator
  targetUserId?: string;              // Filtrar por usuário alvo
  affectsKPIs?: boolean;              // Apenas eventos que afetam KPIs
  kpiCategory?: KPICategory[];        // Filtrar por categoria de KPI
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface CreateAuditLogRequest {
  eventType: AuditEventType;
  severity: AuditSeverity;
  actorId: string;
  details: AuditEventDetails;
  teamId?: string;
  targetUserId?: string;
  targetResourceId?: string;
  targetResourceType?: string;
  metadata?: Record<string, any>;
  affectsKPIs?: boolean;
  kpiCategories?: KPICategory[];
}

export interface AuditReport {
  // Período
  dateFrom: Date;
  dateTo: Date;
  
  // Totais
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  
  // KPIs Críticos
  totalMembersAdded: number;
  totalMembersRemoved: number;
  totalTransfers: number;
  totalResignations: number;
  totalContractEnds: number;
  totalProjectEnds: number;
  
  // Taxas Calculadas
  turnoverRate?: number;              // (removidos / total) * 100
  retentionRate?: number;             // 100 - turnoverRate
  transferRate?: number;              // (transferidos / total) * 100
  
  // Top Eventos
  topActors: Array<{ actorId: string; actorName: string; eventCount: number }>;
  topTeams: Array<{ teamId: string; teamName: string; eventCount: number }>;
  
  // Timeline
  eventsOverTime: Array<{ date: Date; count: number }>;
}

// Helpers para Criação de Audit Logs

export const createMemberAddedLog = (
  memberId: string,
  teamId: string,
  actorId: string,
  organizationId: string,
  institutionId: string,
  role: string
): CreateAuditLogRequest => ({
  eventType: AuditEventType.MEMBER_ADDED,
  severity: AuditSeverity.INFO,
  actorId,
  teamId,
  targetUserId: memberId,
  targetResourceId: memberId,
  targetResourceType: 'team_member',
  details: {
    description: `Member added to team with role ${role}`,
    action: 'added',
    after: { role, status: 'active' }
  },
  affectsKPIs: true,
  kpiCategories: [KPICategory.RETENTION]
});

export const createMemberRemovedLog = (
  memberId: string,
  teamId: string,
  actorId: string,
  organizationId: string,
  institutionId: string,
  reason: string,
  details: string,
  daysInTeam: number,
  daysInOrganization: number
): CreateAuditLogRequest => ({
  eventType: AuditEventType.MEMBER_REMOVED,
  severity: AuditSeverity.CRITICAL,
  actorId,
  teamId,
  targetUserId: memberId,
  targetResourceId: memberId,
  targetResourceType: 'team_member',
  details: {
    description: `Member removed: ${reason}`,
    action: 'removed',
    reason,
    notes: details,
    removalDetails: {
      reason,
      details,
      finalStatus: 'removed',
      daysInTeam,
      daysInOrganization
    }
  },
  affectsKPIs: true,
  kpiCategories: [KPICategory.TURNOVER, KPICategory.RETENTION]
});

export const createMemberTransferredLog = (
  memberId: string,
  fromTeamId: string,
  toTeamId: string,
  fromOrgId: string,
  toOrgId: string,
  actorId: string,
  institutionId: string,
  reason: string,
  keptAssessment: boolean
): CreateAuditLogRequest => ({
  eventType: AuditEventType.MEMBER_TRANSFERRED,
  severity: AuditSeverity.CRITICAL,
  actorId,
  teamId: fromTeamId,
  targetUserId: memberId,
  targetResourceId: memberId,
  targetResourceType: 'team_member',
  details: {
    description: `Member transferred from org ${fromOrgId} to org ${toOrgId}`,
    action: 'transferred',
    reason,
    transferDetails: {
      fromOrganizationId: fromOrgId,
      fromTeamId,
      toOrganizationId: toOrgId,
      toTeamId,
      keptAssessment
    }
  },
  affectsKPIs: true,
  kpiCategories: [KPICategory.TRANSFER, KPICategory.RETENTION]
});
