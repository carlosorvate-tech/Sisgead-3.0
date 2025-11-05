/**
 * SISGEAD Premium 3.0 - Organization Types
 * Sistema de tipos para organizações
 */

/**
 * Status da organização
 */
export enum OrganizationStatus {
  /** Organização ativa */
  ACTIVE = 'active',
  
  /** Organização inativa */
  INACTIVE = 'inactive',
  
  /** Organização em configuração */
  SETUP = 'setup',
  
  /** Organização suspensa */
  SUSPENDED = 'suspended',
  
  /** Organização arquivada */
  ARCHIVED = 'archived'
}

/**
 * Configurações da organização
 */
export interface OrganizationSettings {
  /** Número máximo de usuários permitidos */
  maxUsers: number;
  
  /** Features permitidas para esta organização */
  allowedFeatures: string[];
  
  /** Permitir criação de sub-organizações */
  allowSubOrganizations: boolean;
  
  /** Requer aprovação para criar avaliações */
  requireAssessmentApproval: boolean;
  
  /** Permitir que usuários vejam resultados de outros */
  allowCrossUserView: boolean;
  
  /** Permitir exportação de dados */
  allowDataExport: boolean;
  
  /** Notificações habilitadas */
  notificationsEnabled: boolean;
  
  /** Configurações customizadas adicionais */
  customSettings?: Record<string, any>;
}

/**
 * Estatísticas da organização
 */
export interface OrganizationStats {
  /** Total de usuários ativos */
  totalActiveUsers: number;
  
  /** Total de usuários inativos */
  totalInactiveUsers: number;
  
  /** Total de sub-organizações */
  totalSubOrganizations: number;
  
  /** Total de avaliações criadas */
  totalAssessments: number;
  
  /** Total de avaliações concluídas */
  totalCompletedAssessments: number;
  
  /** Taxa de completude (%) */
  completionRate: number;
  
  /** Última atividade */
  lastActivityAt?: string;
  
  /** Data da última atualização das estatísticas */
  lastUpdated: string;
}

/**
 * Organização completa
 */
export interface Organization {
  /** ID único da organização (UUID) */
  id: string;
  
  /** ID da instituição à qual pertence */
  institutionId: string;
  
  /** ID da organização pai (se for sub-organização) */
  parentOrgId?: string;
  
  /** Nome da organização */
  name: string;
  
  /** Código/sigla da organização */
  code?: string;
  
  /** Descrição */
  description?: string;
  
  /** Nível na hierarquia (0 = raiz, 1 = primeiro nível, etc) */
  hierarchyLevel: number;
  
  /** Caminho completo na hierarquia (IDs separados por /) */
  hierarchyPath: string;
  
  /** Configurações */
  settings: OrganizationSettings;
  
  /** Estatísticas */
  stats: OrganizationStats;
  
  /** Status */
  status: OrganizationStatus;
  
  /** Cor de identificação (hex) */
  color?: string;
  
  /** Ícone/emoji de identificação */
  icon?: string;
  
  /** Data de criação */
  createdAt: string;
  
  /** ID do usuário que criou */
  createdBy: string;
  
  /** Data da última atualização */
  updatedAt?: string;
  
  /** ID do usuário que atualizou */
  updatedBy?: string;
  
  /** Ordem de exibição */
  displayOrder?: number;
  
  /** Metadados adicionais */
  metadata?: Record<string, any>;
}

/**
 * Dados para criação de nova organização
 */
export interface CreateOrganizationData {
  institutionId: string;
  parentOrgId?: string;
  name: string;
  code?: string;
  description?: string;
  settings?: Partial<OrganizationSettings>;
  color?: string;
  icon?: string;
  createdBy: string;
}

/**
 * Dados para atualização de organização
 */
export interface UpdateOrganizationData {
  name?: string;
  code?: string;
  description?: string;
  settings?: Partial<OrganizationSettings>;
  status?: OrganizationStatus;
  color?: string;
  icon?: string;
  displayOrder?: number;
  updatedBy: string;
}

/**
 * Filtros para busca de organizações
 */
export interface OrganizationFilters {
  institutionId?: string;
  parentOrgId?: string | null; // null para raiz
  status?: OrganizationStatus;
  searchTerm?: string; // Busca por nome ou código
  hierarchyLevel?: number;
}

/**
 * Resultado paginado de organizações
 */
export interface OrganizationListResult {
  organizations: Organization[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Nó da árvore hierárquica de organizações
 */
export interface OrganizationTreeNode {
  organization: Organization;
  children: OrganizationTreeNode[];
  parent?: OrganizationTreeNode;
  depth: number;
  isExpanded?: boolean;
}

/**
 * Configurações padrão para nova organização
 */
export const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
  maxUsers: 100,
  allowedFeatures: [
    'assessments',
    'reports',
    'analytics',
    'export'
  ],
  allowSubOrganizations: true,
  requireAssessmentApproval: false,
  allowCrossUserView: false,
  allowDataExport: true,
  notificationsEnabled: true
};

/**
 * Estatísticas iniciais para nova organização
 */
export const INITIAL_ORGANIZATION_STATS: OrganizationStats = {
  totalActiveUsers: 0,
  totalInactiveUsers: 0,
  totalSubOrganizations: 0,
  totalAssessments: 0,
  totalCompletedAssessments: 0,
  completionRate: 0,
  lastUpdated: new Date().toISOString()
};

/**
 * Cores pré-definidas para organizações
 */
export const ORGANIZATION_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
];

/**
 * Ícones/emojis pré-definidos para organizações
 */
export const ORGANIZATION_ICONS = [
  '🏢', // Edifício
  '🏛️', // Instituição
  '🏫', // Escola
  '🏥', // Hospital
  '🏭', // Fábrica
  '💼', // Negócios
  '📊', // Gráfico
  '🎯', // Alvo
  '⚙️', // Configuração
  '🌟', // Estrela
  '🚀', // Foguete
  '💡', // Ideia
  '🔧', // Ferramenta
  '📚', // Livros
  '🎓', // Graduação
];
