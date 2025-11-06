/**
 * SISGEAD 3.0 Premium - KPI Types
 * Sistema de Indicadores de Performance (ISO 30414 Compliant)
 * 
 * Decisões Aprovadas (05/11/2025):
 * - KPIs baseados em ISO 30414 (Human Capital Reporting)
 * - Cálculo automático baseado em audit logs
 * - Métricas de turnover, retention, transferências
 * - Dashboard por organização e instituição
 */

export enum KPIMetric {
  // Rotatividade (Turnover)
  TURNOVER_RATE = 'turnover_rate',                    // Taxa de rotatividade
  VOLUNTARY_TURNOVER_RATE = 'voluntary_turnover_rate',// Desistências
  INVOLUNTARY_TURNOVER_RATE = 'involuntary_turnover_rate', // Demissões
  
  // Retenção (Retention)
  RETENTION_RATE = 'retention_rate',                  // Taxa de retenção
  AVERAGE_TENURE = 'average_tenure',                  // Tempo médio na organização
  
  // Transferências
  TRANSFER_RATE = 'transfer_rate',                    // Taxa de transferências inter-org
  INTERNAL_MOBILITY_RATE = 'internal_mobility_rate',  // Mobilidade interna
  
  // Avaliações
  ASSESSMENT_COMPLETION_RATE = 'assessment_completion_rate', // Taxa de conclusão
  AVERAGE_ASSESSMENT_TIME = 'average_assessment_time',       // Tempo médio de conclusão
  REASSESSMENT_RATE = 'reassessment_rate',                  // Taxa de reavaliações
  
  // Performance
  TEAM_SIZE_AVERAGE = 'team_size_average',            // Tamanho médio de equipes
  ACTIVE_TEAMS = 'active_teams',                      // Equipes ativas
  ACTIVE_MEMBERS = 'active_members',                  // Membros ativos
  
  // Aprovações
  APPROVAL_RATE = 'approval_rate',                    // Taxa de aprovações
  AVERAGE_APPROVAL_TIME = 'average_approval_time',    // Tempo médio de aprovação
  REJECTION_RATE = 'rejection_rate'                   // Taxa de rejeições
}

export enum KPIPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  ALL_TIME = 'all_time'
}

export enum KPITrend {
  UP = 'up',                          // Aumentando
  DOWN = 'down',                      // Diminuindo
  STABLE = 'stable',                  // Estável
  UNKNOWN = 'unknown'                 // Sem dados para comparar
}

export interface OrganizationKPIs {
  // Identificação
  id: string;
  institutionId: string;              // Multi-tenant: Institution
  organizationId: string;             // Multi-tenant: Organization
  
  // Período
  period: KPIPeriod;
  periodStart: Date;
  periodEnd: Date;
  
  // Snapshot de Dados
  snapshot: {
    totalMembers: number;             // Total de membros no período
    activeMembers: number;            // Membros ativos
    archivedMembers: number;          // Membros arquivados
    totalTeams: number;               // Total de equipes
    activeTeams: number;              // Equipes ativas
  };
  
  // Métricas de Rotatividade (ISO 30414)
  turnover: {
    totalRate: number;                // Taxa total (%)
    voluntaryRate: number;            // Desistências (%)
    involuntaryRate: number;          // Demissões (%)
    totalExits: number;               // Total de saídas
    voluntaryExits: number;           // Desistências voluntárias
    involuntaryExits: number;         // Demissões
    projectEndExits: number;          // Fim de projeto
    contractEndExits: number;         // Fim de contrato
    trend: KPITrend;
  };
  
  // Métricas de Retenção (ISO 30414)
  retention: {
    rate: number;                     // Taxa de retenção (%)
    averageTenureDays: number;        // Tempo médio (dias)
    newHires: number;                 // Novas contratações
    retainedMembers: number;          // Membros retidos
    trend: KPITrend;
  };
  
  // Métricas de Transferência
  transfers: {
    totalRate: number;                // Taxa de transferências (%)
    internalTransfers: number;        // Transferências internas
    incomingTransfers: number;        // Recebidos de outras orgs
    outgoingTransfers: number;        // Enviados para outras orgs
    netTransfers: number;             // incoming - outgoing
    trend: KPITrend;
  };
  
  // Métricas de Avaliação
  assessments: {
    completionRate: number;           // Taxa de conclusão (%)
    totalCompleted: number;           // Total concluídas
    totalPending: number;             // Total pendentes
    averageCompletionDays: number;    // Tempo médio (dias)
    reassessmentRate: number;         // Taxa de reavaliações (%)
    totalReassessments: number;       // Total de reavaliações
    trend: KPITrend;
  };
  
  // Métricas de Aprovação
  approvals: {
    approvalRate: number;             // Taxa de aprovações (%)
    totalApproved: number;            // Total aprovadas
    totalRejected: number;            // Total rejeitadas
    totalPending: number;             // Total pendentes
    averageApprovalDays: number;      // Tempo médio (dias)
    trend: KPITrend;
  };
  
  // Distribuição DISC (se disponível)
  discDistribution?: {
    dominant: number;                 // % perfil D
    influential: number;              // % perfil I
    steady: number;                   // % perfil S
    conscientious: number;            // % perfil C
  };
  
  // Metadados
  calculatedAt: Date;
  calculatedBy: string;               // Sistema ou usuário
  version: number;
  
  // Comparação com Período Anterior
  previousPeriodId?: string;
  changesSincePrevious?: {
    turnoverChange: number;           // Diferença em %
    retentionChange: number;
    transferChange: number;
    assessmentChange: number;
  };
}

export interface KPIFilters {
  institutionId: string;              // Obrigatório (multi-tenant)
  organizationId?: string;            // Filtrar por organização
  period?: KPIPeriod;                 // Filtrar por período
  dateFrom?: Date;
  dateTo?: Date;
  metrics?: KPIMetric[];              // Métricas específicas
}

export interface KPICalculationRequest {
  organizationId: string;
  period: KPIPeriod;
  periodStart: Date;
  periodEnd: Date;
  recalculate?: boolean;              // Forçar recálculo
}

export interface KPIComparison {
  // Organizações sendo comparadas
  organizations: Array<{
    organizationId: string;
    organizationName: string;
    kpis: OrganizationKPIs;
  }>;
  
  // Período de comparação
  period: KPIPeriod;
  periodStart: Date;
  periodEnd: Date;
  
  // Métricas Agregadas
  averages: {
    turnoverRate: number;
    retentionRate: number;
    transferRate: number;
    assessmentCompletionRate: number;
  };
  
  // Rankings
  rankings: {
    bestRetention: string;            // organizationId com melhor retenção
    lowestTurnover: string;           // organizationId com menor turnover
    highestAssessmentCompletion: string;
  };
}

export interface KPIDashboard {
  // Identificação
  institutionId: string;
  organizationId?: string;            // null = dashboard institucional
  
  // Período Atual
  currentPeriod: OrganizationKPIs;
  
  // Período Anterior (para comparação)
  previousPeriod?: OrganizationKPIs;
  
  // Tendências (últimos 6 períodos)
  trends: Array<{
    period: string;
    turnoverRate: number;
    retentionRate: number;
    transferRate: number;
    assessmentCompletionRate: number;
  }>;
  
  // Alertas
  alerts: KPIAlert[];
  
  // Recomendações
  recommendations: KPIRecommendation[];
}

export interface KPIAlert {
  severity: 'info' | 'warning' | 'critical';
  metric: KPIMetric;
  message: string;
  currentValue: number;
  thresholdValue: number;
  trend: KPITrend;
  actionRequired: boolean;
}

export interface KPIRecommendation {
  priority: 'low' | 'medium' | 'high';
  category: string;
  title: string;
  description: string;
  impactedMetrics: KPIMetric[];
  suggestedActions: string[];
}

// Constantes e Thresholds (ISO 30414)

export const KPI_THRESHOLDS = {
  // Rotatividade (Turnover)
  TURNOVER_RATE: {
    excellent: 5,                     // < 5% excelente
    good: 10,                         // < 10% bom
    acceptable: 15,                   // < 15% aceitável
    critical: 20                      // > 20% crítico
  },
  
  // Retenção (Retention)
  RETENTION_RATE: {
    excellent: 95,                    // > 95% excelente
    good: 90,                         // > 90% bom
    acceptable: 85,                   // > 85% aceitável
    critical: 80                      // < 80% crítico
  },
  
  // Avaliações
  ASSESSMENT_COMPLETION_RATE: {
    excellent: 90,                    // > 90% excelente
    good: 80,                         // > 80% bom
    acceptable: 70,                   // > 70% aceitável
    critical: 60                      // < 60% crítico
  },
  
  // Aprovações
  APPROVAL_TIME_DAYS: {
    excellent: 2,                     // < 2 dias excelente
    good: 5,                          // < 5 dias bom
    acceptable: 7,                    // < 7 dias aceitável
    critical: 14                      // > 14 dias crítico
  }
};

export const DEFAULT_KPI_PERIOD = KPIPeriod.MONTHLY;

// Helper para cálculo de taxa de turnover (ISO 30414)
export const calculateTurnoverRate = (
  totalExits: number,
  averageHeadcount: number
): number => {
  if (averageHeadcount === 0) return 0;
  return (totalExits / averageHeadcount) * 100;
};

// Helper para cálculo de taxa de retenção
export const calculateRetentionRate = (
  turnoverRate: number
): number => {
  return 100 - turnoverRate;
};

// Helper para cálculo de taxa de transferência
export const calculateTransferRate = (
  totalTransfers: number,
  totalMembers: number
): number => {
  if (totalMembers === 0) return 0;
  return (totalTransfers / totalMembers) * 100;
};
