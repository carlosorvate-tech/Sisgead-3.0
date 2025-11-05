/**
 * SISGEAD Premium 3.0 - User Types
 * Sistema de tipos para usuários multi-tenant
 */

/**
 * Papéis de usuário no sistema hierárquico
 * HIERARQUIA SIMPLIFICADA (4 níveis):
 * MASTER → ORG_ADMIN → USER → VIEWER
 */
export enum UserRole {
  /** Acesso total à instituição - usuário master que organiza as verticais */
  MASTER = 'master',
  
  /** Administrador organizacional - gestão completa da organização
   * Pode: enviar questionários, receber dados, gerar equipes, criar avaliações,
   * tomar decisões executivas baseadas nas análises geradas */
  ORG_ADMIN = 'org_admin',
  
  /** Usuário padrão - pode responder avaliações */
  USER = 'user',
  
  /** Visualizador - apenas leitura */
  VIEWER = 'viewer'
}

/**
 * Privilégios em nível institucional
 */
export interface InstitutionalPrivileges {
  /** Criar, editar, remover organizações */
  manageOrganizations: boolean;
  
  /** Criar, editar, remover usuários de qualquer organização */
  manageAllUsers: boolean;
  
  /** Visualizar relatórios consolidados de toda instituição */
  viewInstitutionalReports: boolean;
  
  /** Exportar dados institucionais completos */
  exportInstitutionalData: boolean;
  
  /** Alterar configurações globais da instituição */
  manageInstitutionSettings: boolean;
  
  /** Visualizar logs de auditoria institucional */
  viewAuditLogs: boolean;
  
  /** Gerenciar integrações e APIs */
  manageIntegrations: boolean;
}

/**
 * Privilégios em nível organizacional
 */
export interface OrganizationalPrivileges {
  /** Criar, editar, remover usuários da organização */
  manageOrgUsers: boolean;
  
  /** Criar e configurar avaliações */
  createAssessments: boolean;
  
  /** Editar avaliações existentes */
  editAssessments: boolean;
  
  /** Excluir avaliações */
  deleteAssessments: boolean;
  
  /** Visualizar relatórios da organização */
  viewOrgReports: boolean;
  
  /** Exportar dados da organização */
  exportOrgData: boolean;
  
  /** Alterar configurações da organização */
  manageOrgSettings: boolean;
  
  /** Criar sub-organizações */
  createSubOrganizations: boolean;
}

/**
 * Privilégios em nível de usuário
 */
export interface UserPrivileges {
  /** Visualizar próprias avaliações */
  viewOwnAssessments: boolean;
  
  /** Responder avaliações atribuídas */
  respondAssessments: boolean;
  
  /** Visualizar próprios relatórios */
  viewOwnReports: boolean;
  
  /** Exportar próprios dados */
  exportOwnData: boolean;
  
  /** Editar próprio perfil */
  editOwnProfile: boolean;
  
  /** Alterar própria senha */
  changePassword: boolean;
}

/**
 * Conjunto completo de privilégios de um usuário
 */
export interface UserPrivilegesSet {
  institutional: InstitutionalPrivileges;
  organizational: OrganizationalPrivileges;
  user: UserPrivileges;
}

/**
 * Informações de perfil do usuário
 */
export interface UserProfile {
  /** Nome completo */
  name: string;
  
  /** CPF (único no sistema) */
  cpf: string;
  
  /** Email */
  email: string;
  
  /** Telefone (opcional) */
  phone?: string;
  
  /** Avatar URL (opcional) */
  avatarUrl?: string;
  
  /** Cargo/função (opcional) */
  position?: string;
  
  /** Departamento (opcional) */
  department?: string;
}

/**
 * Configurações de segurança do usuário
 */
export interface UserSecurity {
  /** Hash da senha (bcrypt) */
  passwordHash: string;
  
  /** Data da última alteração de senha */
  lastPasswordChange: string;
  
  /** Requer alteração de senha no próximo login */
  requirePasswordChange: boolean;
  
  /** Autenticação de dois fatores habilitada */
  twoFactorEnabled: boolean;
  
  /** Tentativas de login falhadas */
  failedLoginAttempts: number;
  
  /** Data do último bloqueio (se houver) */
  lastLockoutDate?: string;
  
  /** Conta bloqueada */
  isLocked: boolean;
}

/**
 * Usuário completo do sistema
 */
export interface User {
  /** ID único do usuário (UUID) */
  id: string;
  
  /** ID da instituição à qual pertence */
  institutionId: string;
  
  /** IDs das organizações às quais pertence (pode ser múltiplas) */
  organizationIds: string[];
  
  /** Informações de perfil */
  profile: UserProfile;
  
  /** Papel/função no sistema */
  role: UserRole;
  
  /** Privilégios específicos */
  privileges: UserPrivilegesSet;
  
  /** Configurações de segurança */
  security: UserSecurity;
  
  /** Usuário está ativo */
  isActive: boolean;
  
  /** Data de criação */
  createdAt: string;
  
  /** ID do usuário que criou */
  createdBy: string;
  
  /** Data da última atualização */
  updatedAt?: string;
  
  /** ID do usuário que atualizou */
  updatedBy?: string;
  
  /** Data da última atividade */
  lastActivityAt?: string;
  
  /** Metadados adicionais */
  metadata?: Record<string, any>;
}

/**
 * Dados para criação de novo usuário
 */
export interface CreateUserData {
  institutionId: string;
  organizationIds: string[];
  profile: Omit<UserProfile, 'avatarUrl'>;
  password: string;
  role: UserRole;
  privileges?: Partial<UserPrivilegesSet>;
  createdBy: string;
}

/**
 * Dados para atualização de usuário
 */
export interface UpdateUserData {
  profile?: Partial<UserProfile>;
  organizationIds?: string[];
  role?: UserRole;
  privileges?: Partial<UserPrivilegesSet>;
  isActive?: boolean;
  updatedBy: string;
}

/**
 * Filtros para busca de usuários
 */
export interface UserFilters {
  institutionId?: string;
  organizationId?: string;
  role?: UserRole;
  isActive?: boolean;
  searchTerm?: string; // Busca por nome, email, CPF
}

/**
 * Resultado paginado de usuários
 */
export interface UserListResult {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Preset de privilégios por papel
 * HIERARQUIA SIMPLIFICADA (4 níveis)
 */
export const DEFAULT_PRIVILEGES: Record<UserRole, UserPrivilegesSet> = {
  [UserRole.MASTER]: {
    institutional: {
      manageOrganizations: true,
      manageAllUsers: true,
      viewInstitutionalReports: true,
      exportInstitutionalData: true,
      manageInstitutionSettings: true,
      viewAuditLogs: true,
      manageIntegrations: true
    },
    organizational: {
      manageOrgUsers: true,
      createAssessments: true,
      editAssessments: true,
      deleteAssessments: true,
      viewOrgReports: true,
      exportOrgData: true,
      manageOrgSettings: true,
      createSubOrganizations: true
    },
    user: {
      viewOwnAssessments: true,
      respondAssessments: true,
      viewOwnReports: true,
      exportOwnData: true,
      editOwnProfile: true,
      changePassword: true
    }
  },
  
  [UserRole.ORG_ADMIN]: {
    institutional: {
      manageOrganizations: false,
      manageAllUsers: false,
      viewInstitutionalReports: false,
      exportInstitutionalData: false,
      manageInstitutionSettings: false,
      viewAuditLogs: false,
      manageIntegrations: false
    },
    organizational: {
      manageOrgUsers: true,
      createAssessments: true,
      editAssessments: true,
      deleteAssessments: true,
      viewOrgReports: true,
      exportOrgData: true,
      manageOrgSettings: true,
      createSubOrganizations: false
    },
    user: {
      viewOwnAssessments: true,
      respondAssessments: true,
      viewOwnReports: true,
      exportOwnData: true,
      editOwnProfile: true,
      changePassword: true
    }
  },
  
  [UserRole.USER]: {
    institutional: {
      manageOrganizations: false,
      manageAllUsers: false,
      viewInstitutionalReports: false,
      exportInstitutionalData: false,
      manageInstitutionSettings: false,
      viewAuditLogs: false,
      manageIntegrations: false
    },
    organizational: {
      manageOrgUsers: false,
      createAssessments: false,
      editAssessments: false,
      deleteAssessments: false,
      viewOrgReports: false,
      exportOrgData: false,
      manageOrgSettings: false,
      createSubOrganizations: false
    },
    user: {
      viewOwnAssessments: true,
      respondAssessments: true,
      viewOwnReports: true,
      exportOwnData: true,
      editOwnProfile: true,
      changePassword: true
    }
  },
  
  [UserRole.VIEWER]: {
    institutional: {
      manageOrganizations: false,
      manageAllUsers: false,
      viewInstitutionalReports: false,
      exportInstitutionalData: false,
      manageInstitutionSettings: false,
      viewAuditLogs: false,
      manageIntegrations: false
    },
    organizational: {
      manageOrgUsers: false,
      createAssessments: false,
      editAssessments: false,
      deleteAssessments: false,
      viewOrgReports: true,
      exportOrgData: false,
      manageOrgSettings: false,
      createSubOrganizations: false
    },
    user: {
      viewOwnAssessments: true,
      respondAssessments: false,
      viewOwnReports: true,
      exportOwnData: false,
      editOwnProfile: true,
      changePassword: true
    }
  }
};
