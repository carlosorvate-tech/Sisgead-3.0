/**
 * SISGEAD 3.0 Premium - Team Member Types
 * Sistema de Membros de Equipe com Soft Delete e Transferências
 * 
 * Decisões Aprovadas (05/11/2025):
 * - Transferências inter-org SEM aprovação de ambas
 * - Mantém histórico DISC com opção de reavaliação
 * - Soft delete com retenção de 1 ano
 * - Auditoria completa de movimentações
 */

export enum MemberStatus {
  ACTIVE = 'active',                  // Ativo na equipe
  INACTIVE = 'inactive',              // Temporariamente inativo
  TRANSFERRED = 'transferred',        // Transferido para outra equipe/org
  REMOVED = 'removed',                // Removido da equipe
  ARCHIVED = 'archived'               // Arquivado (soft delete após 1 ano)
}

export enum MemberRole {
  LEADER = 'leader',                  // Líder da equipe
  MEMBER = 'member',                  // Membro regular
  CONSULTANT = 'consultant',          // Consultor temporário
  TRAINEE = 'trainee'                 // Estagiário/trainee
}

export enum RemovalReason {
  PROJECT_ENDED = 'project_ended',    // Término de projeto
  CONTRACT_ENDED = 'contract_ended',  // Término de vínculo
  RESIGNATION = 'resignation',        // Desistência pessoal
  TRANSFER = 'transfer',              // Transferência para outra equipe/org
  PERFORMANCE = 'performance',        // Questões de desempenho
  RESTRUCTURING = 'restructuring',    // Reestruturação organizacional
  OTHER = 'other'
}

export interface TeamMember {
  // Identificação
  id: string;
  institutionId: string;              // Multi-tenant: Institution
  organizationId: string;             // Multi-tenant: Organization
  teamId: string;                     // Equipe atual
  userId: string;                     // Usuário do SISGEAD
  
  // Status e Função
  status: MemberStatus;
  role: MemberRole;
  
  // Datas
  joinedAt: Date;                     // Data de entrada na equipe
  leftAt?: Date;                      // Data de saída da equipe
  createdAt: Date;
  updatedAt: Date;
  
  // Avaliação DISC (DECISÃO: Mantém histórico)
  currentAssessmentId?: string;       // Avaliação DISC atual
  assessmentHistory: string[];        // IDs de todas avaliações
  allowReassessment: boolean;         // DECISÃO: Permite refazer DISC
  lastReassessmentAt?: Date;
  
  // Soft Delete (DECISÃO: 1 ano retenção)
  deletedAt?: Date;                   // Quando foi removido
  expiresAt?: Date;                   // deletedAt + 1 ano (expurgo automático)
  deletedBy?: string;                 // Quem removeu
  removalReason?: RemovalReason;
  removalDetails?: string;
  
  // Transferências (DECISÃO: Sem aprovação de ambas orgs)
  transferHistory: TransferEvent[];
  
  // Permissões Especiais
  canApproveAssessments: boolean;     // Pode aprovar avaliações (gestor)
  canManageTeam: boolean;             // Pode gerenciar equipe
  
  // Metadados
  notes?: string;                     // Observações sobre o membro
  tags?: string[];                    // Tags para categorização
  
  // Auditoria
  version: number;
  lastModifiedBy: string;
}

export interface TransferEvent {
  // Identificação
  id: string;
  memberId: string;
  
  // Origem e Destino (DECISÃO: Ação unilateral do gestor)
  fromOrganizationId: string;
  fromTeamId: string;
  toOrganizationId: string;
  toTeamId: string;
  
  // Metadados
  transferredAt: Date;
  transferredBy: string;              // Gestor que iniciou transferência
  reason: string;
  notes?: string;
  
  // DISC (DECISÃO: Mantém histórico)
  keptAssessmentId?: string;          // Avaliação DISC mantida
  newAssessmentId?: string;           // Nova avaliação (se solicitada)
  
  // Aprovação (DECISÃO: NÃO requer aprovação)
  requiresApproval: false;            // Sempre false
  
  // Auditoria
  auditLogId: string;                 // Referência ao audit log
}

export interface MemberStats {
  // Métricas do Membro
  totalProjects: number;
  completedProjects: number;
  currentProjects: number;
  
  // Tempo
  daysInCurrentTeam: number;
  daysInOrganization: number;
  daysInInstitution: number;
  
  // Avaliações
  totalAssessments: number;
  lastAssessmentDate?: Date;
  assessmentFrequencyDays?: number;
  
  // Transferências
  totalTransfers: number;
  lastTransferDate?: Date;
  
  // Performance (se disponível)
  averageRating?: number;
  completionRate?: number;
}

export interface TeamMemberSummary {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
  currentDiscProfile?: string;
  canApproveAssessments: boolean;
}

export interface TeamMemberFilters {
  institutionId: string;              // Obrigatório (multi-tenant)
  organizationId?: string;            // Filtrar por organização
  teamId?: string;                    // Filtrar por equipe
  userId?: string;                    // Filtrar por usuário
  status?: MemberStatus[];            // Filtrar por status
  role?: MemberRole[];                // Filtrar por função
  hasCurrentAssessment?: boolean;     // Tem avaliação DISC válida
  joinedFrom?: Date;
  joinedTo?: Date;
  includeArchived?: boolean;          // DECISÃO: Soft delete
}

export interface AddMemberRequest {
  teamId: string;
  userId: string;
  role: MemberRole;
  allowReassessment?: boolean;        // DECISÃO: Default true
  notes?: string;
  tags?: string[];
}

export interface RemoveMemberRequest {
  memberId: string;
  reason: RemovalReason;
  details?: string;
  removedBy: string;
}

export interface TransferMemberRequest {
  memberId: string;
  toTeamId: string;
  toOrganizationId: string;
  reason: string;
  notes?: string;
  transferredBy: string;
  keepAssessment: boolean;            // DECISÃO: Default true
  requestReassessment?: boolean;      // Usuário pode solicitar nova avaliação
}

export interface UpdateMemberRequest {
  role?: MemberRole;
  status?: MemberStatus;
  allowReassessment?: boolean;
  canApproveAssessments?: boolean;
  canManageTeam?: boolean;
  notes?: string;
  tags?: string[];
}

// Constantes
export const MEMBER_RETENTION_DAYS = 365; // 1 ano (DECISÃO)

export const DEFAULT_MEMBER_PERMISSIONS = {
  canApproveAssessments: false,
  canManageTeam: false,
  allowReassessment: true               // DECISÃO: Permite reavaliação
};
