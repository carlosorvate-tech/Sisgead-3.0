/**
 * SISGEAD Premium 3.0 - Institution Types
 * Sistema de tipos para instituições
 */

/**
 * Tipo de instituição
 */
export enum InstitutionType {
  /** Instituição pública (governo, prefeituras, etc) */
  PUBLIC = 'public',
  
  /** Empresa privada */
  PRIVATE = 'private',
  
  /** Organização não governamental */
  NGO = 'ngo',
  
  /** Instituição educacional */
  EDUCATIONAL = 'educational',
  
  /** Instituição de saúde */
  HEALTHCARE = 'healthcare',
  
  /** Outro tipo */
  OTHER = 'other'
}

/**
 * Endereço da instituição
 */
export interface InstitutionAddress {
  /** Logradouro */
  street: string;
  
  /** Número */
  number?: string;
  
  /** Complemento */
  complement?: string;
  
  /** Bairro */
  neighborhood?: string;
  
  /** Cidade */
  city: string;
  
  /** Estado (UF) */
  state: string;
  
  /** CEP */
  zipCode: string;
  
  /** País */
  country: string;
}

/**
 * Configurações da instituição
 */
export interface InstitutionSettings {
  /** Número máximo de organizações permitidas */
  maxOrganizations: number;
  
  /** Número máximo de usuários por organização */
  maxUsersPerOrg: number;
  
  /** Número máximo de usuários totais */
  maxTotalUsers: number;
  
  /** Features ativas para esta instituição */
  features: string[];
  
  /** Permitir criação de sub-organizações */
  allowSubOrganizations: boolean;
  
  /** Profundidade máxima de hierarquia de organizações */
  maxOrgHierarchyDepth: number;
  
  /** Requer aprovação para criação de usuários */
  requireUserApproval: boolean;
  
  /** Dias para expiração de senha */
  passwordExpirationDays: number;
  
  /** Comprimento mínimo de senha */
  minPasswordLength: number;
  
  /** Habilitar autenticação de dois fatores */
  enableTwoFactor: boolean;
  
  /** Tempo de sessão em horas */
  sessionTimeoutHours: number;
  
  /** Permitir login simultâneo */
  allowConcurrentSessions: boolean;
  
  /** Configurações de backup */
  backup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number; // dias
  };
  
  /** Configurações de auditoria */
  audit: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'basic' | 'detailed' | 'verbose';
  };
}

/**
 * Contato da instituição
 */
export interface InstitutionContact {
  /** Email principal */
  email: string;
  
  /** Telefone */
  phone?: string;
  
  /** Website */
  website?: string;
  
  /** Nome do contato principal */
  contactName?: string;
  
  /** Cargo do contato */
  contactTitle?: string;
}

/**
 * Estatísticas da instituição
 */
export interface InstitutionStats {
  /** Total de organizações */
  totalOrganizations: number;
  
  /** Total de usuários ativos */
  totalActiveUsers: number;
  
  /** Total de usuários inativos */
  totalInactiveUsers: number;
  
  /** Total de avaliações realizadas */
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
 * Informações de billing/cobrança (para futuro)
 */
export interface InstitutionBilling {
  /** Plano contratado */
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  
  /** Status da assinatura */
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  
  /** Data de início do plano */
  startDate: string;
  
  /** Data de renovação */
  renewalDate?: string;
  
  /** Data de término (se cancelado) */
  endDate?: string;
  
  /** ID de cobrança externo (Stripe, etc) */
  billingId?: string;
}

/**
 * Instituição completa
 */
export interface Institution {
  /** ID único da instituição (UUID) */
  id: string;
  
  /** Nome da instituição */
  name: string;
  
  /** Slug único (URL-friendly) */
  slug: string;
  
  /** CNPJ (opcional) */
  cnpj?: string;
  
  /** Tipo de instituição */
  type: InstitutionType;
  
  /** Descrição/sobre */
  description?: string;
  
  /** Endereço */
  address?: InstitutionAddress;
  
  /** Informações de contato */
  contact: InstitutionContact;
  
  /** Logo URL */
  logoUrl?: string;
  
  /** Configurações */
  settings: InstitutionSettings;
  
  /** Estatísticas */
  stats: InstitutionStats;
  
  /** Informações de cobrança (futuro) */
  billing?: InstitutionBilling;
  
  /** Instituição está ativa */
  isActive: boolean;
  
  /** Data de criação */
  createdAt: string;
  
  /** ID do usuário master que criou */
  createdBy: string;
  
  /** Data da última atualização */
  updatedAt?: string;
  
  /** ID do usuário que atualizou */
  updatedBy?: string;
  
  /** Metadados adicionais */
  metadata?: Record<string, any>;
}

/**
 * Dados para criação de nova instituição
 */
export interface CreateInstitutionData {
  name: string;
  cnpj?: string;
  type: InstitutionType;
  description?: string;
  address?: InstitutionAddress;
  contact: InstitutionContact;
  settings?: Partial<InstitutionSettings>;
  createdBy: string;
}

/**
 * Dados para atualização de instituição
 */
export interface UpdateInstitutionData {
  name?: string;
  cnpj?: string;
  type?: InstitutionType;
  description?: string;
  address?: Partial<InstitutionAddress>;
  contact?: Partial<InstitutionContact>;
  logoUrl?: string;
  settings?: Partial<InstitutionSettings>;
  isActive?: boolean;
  updatedBy: string;
}

/**
 * Configurações padrão para nova instituição
 */
export const DEFAULT_INSTITUTION_SETTINGS: InstitutionSettings = {
  maxOrganizations: 50,
  maxUsersPerOrg: 100,
  maxTotalUsers: 1000,
  features: [
    'assessments',
    'reports',
    'analytics',
    'audit',
    'backup',
    'export'
  ],
  allowSubOrganizations: true,
  maxOrgHierarchyDepth: 5,
  requireUserApproval: false,
  passwordExpirationDays: 90,
  minPasswordLength: 8,
  enableTwoFactor: false,
  sessionTimeoutHours: 8,
  allowConcurrentSessions: false,
  backup: {
    enabled: true,
    frequency: 'weekly',
    retention: 30
  },
  audit: {
    enabled: true,
    retentionDays: 365,
    logLevel: 'detailed'
  }
};

/**
 * Estatísticas iniciais para nova instituição
 */
export const INITIAL_INSTITUTION_STATS: InstitutionStats = {
  totalOrganizations: 0,
  totalActiveUsers: 1, // Master user
  totalInactiveUsers: 0,
  totalAssessments: 0,
  totalCompletedAssessments: 0,
  completionRate: 0,
  lastUpdated: new Date().toISOString()
};
