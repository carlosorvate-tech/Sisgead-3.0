/**
 * SISGEAD 3.0 Premium - Assessment Types
 * Sistema de Avaliação Multi-Tenant com Aprovação Opcional
 * 
 * Decisões Aprovadas (05/11/2025):
 * - Aprovação OPCIONAL por avaliação
 * - Aprovador: Gestor Imediato (managerId)
 * - Soft delete com retenção de 1 ano
 * - Sem limite de avaliações
 */

export enum AssessmentStatus {
  DRAFT = 'draft',                    // Rascunho
  PENDING_APPROVAL = 'pending_approval', // Aguardando aprovação do gestor
  APPROVED = 'approved',              // Aprovada pelo gestor
  REJECTED = 'rejected',              // Rejeitada pelo gestor
  COMPLETED = 'completed',            // Concluída (sem necessidade de aprovação)
  ARCHIVED = 'archived'               // Arquivada (soft delete)
}

export enum AssessmentType {
  DISC = 'disc',                      // Avaliação DISC (padrão v2.0)
  COMPETENCY = 'competency',          // Avaliação de competências
  PERFORMANCE = 'performance',        // Avaliação de desempenho
  ONBOARDING = 'onboarding',          // Avaliação de integração
  EXIT = 'exit'                       // Entrevista de desligamento
}

export interface AssessmentSettings {
  requireApproval: boolean;           // DECISÃO: Aprovação opcional
  approverId?: string;                // managerId do gestor imediato
  allowReassessment: boolean;         // Permite refazer avaliação
  expirationDays?: number;            // null = não expira (DECISÃO)
  notifyOnCompletion: boolean;        // Notificar gestor ao concluir
  notifyOnApproval: boolean;          // Notificar usuário após aprovação
}

export interface Assessment {
  // Identificação
  id: string;
  institutionId: string;              // Multi-tenant: Institution
  organizationId: string;             // Multi-tenant: Organization
  userId: string;                     // Usuário sendo avaliado
  
  // Tipo e Configuração
  type: AssessmentType;
  status: AssessmentStatus;
  settings: AssessmentSettings;
  
  // Metadados
  title: string;
  description?: string;
  
  // Datas
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;                   // Quando iniciou responder
  completedAt?: Date;                 // Quando finalizou respostas
  approvedAt?: Date;                  // Quando gestor aprovou
  rejectedAt?: Date;                  // Quando gestor rejeitou
  
  // Aprovação (DECISÃO: Gestor Imediato)
  approvedBy?: string;                // managerId que aprovou/rejeitou
  approvalNotes?: string;             // Observações do aprovador
  
  // Soft Delete (DECISÃO: 1 ano retenção)
  deletedAt?: Date;                   // Quando foi arquivada
  expiresAt?: Date;                   // deletedAt + 1 ano (expurgo automático)
  deletedBy?: string;                 // Quem arquivou
  deletionReason?: string;            // Motivo do arquivamento
  
  // Resultados (após conclusão)
  results?: AssessmentResults;
  
  // Auditoria
  version: number;                    // Versionamento de mudanças
  lastModifiedBy: string;             // Último usuário que modificou
}

export interface AssessmentResults {
  // Resultados DISC (v2.0 compatível)
  discProfile?: {
    dominant: number;
    influential: number;
    steady: number;
    conscientious: number;
    primaryProfile: string;           // D, I, S ou C
    secondaryProfile?: string;
  };
  
  // Expansão do Perfil (v2.0 compatível)
  profileExpansion?: {
    professional: string[];
    methodological: string[];
    contextual: string[];
  };
  
  // Contextos de Identidade (v2.0 compatível)
  identityContexts?: {
    personal: string;
    academic: string;
    professional: string;
  };
  
  // Resiliência e Colaboração (v2.0 compatível)
  resilience?: {
    level: string;
    score: number;
  };
  
  collaboration?: {
    level: string;
    score: number;
  };
  
  // Sugestões de Papel (AI Gemini)
  aiSuggestions?: {
    roles: string[];
    strengths: string[];
    developmentAreas: string[];
    teamFit: string;
    timestamp: Date;
  };
  
  // Score geral
  overallScore?: number;
  confidence?: number;                // Confiança do resultado (0-100)
  
  // Comparação com versões anteriores (reavaliação)
  previousAssessmentId?: string;
  changesSinceLastAssessment?: {
    significantChanges: boolean;
    changedDimensions: string[];
    improvementAreas: string[];
  };
}

export interface AssessmentSummary {
  id: string;
  userId: string;
  type: AssessmentType;
  status: AssessmentStatus;
  completedAt?: Date;
  approvedAt?: Date;
  primaryProfile?: string;
  requiresApproval: boolean;
  pendingApproval: boolean;
}

export interface AssessmentFilters {
  institutionId: string;              // Obrigatório (multi-tenant)
  organizationId?: string;            // Filtrar por organização
  userId?: string;                    // Filtrar por usuário
  type?: AssessmentType;              // Filtrar por tipo
  status?: AssessmentStatus[];        // Filtrar por status
  requiresApproval?: boolean;         // Apenas com aprovação pendente
  dateFrom?: Date;
  dateTo?: Date;
  includeArchived?: boolean;          // DECISÃO: Soft delete
}

export interface CreateAssessmentRequest {
  userId: string;
  organizationId: string;
  type: AssessmentType;
  settings: AssessmentSettings;
  title: string;
  description?: string;
}

export interface UpdateAssessmentRequest {
  status?: AssessmentStatus;
  results?: AssessmentResults;
  approvalNotes?: string;
}

export interface ApprovalRequest {
  assessmentId: string;
  approverId: string;                 // managerId do gestor
  approved: boolean;                  // true = aprovar, false = rejeitar
  notes?: string;
}

// Constantes
export const ASSESSMENT_RETENTION_DAYS = 365; // 1 ano (DECISÃO)

export const DEFAULT_ASSESSMENT_SETTINGS: AssessmentSettings = {
  requireApproval: false,             // DECISÃO: Opcional
  allowReassessment: true,            // DECISÃO: Permite reavaliação
  expirationDays: null,               // DECISÃO: Não expira
  notifyOnCompletion: true,
  notifyOnApproval: true
};
