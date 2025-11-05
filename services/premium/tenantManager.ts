/**
 * SISGEAD Premium 3.0 - Tenant Manager Service
 * Gerencia isolamento de dados e controle de acesso multi-tenant
 */

import {
  User,
  UserRole,
  Institution,
  Organization,
  TenantContext,
  PermissionCheckResult,
  UserPrivilegesSet
} from '../../types/premium';

/**
 * Tenant Manager - Responsável por isolamento de dados e validação de permissões
 */
export class TenantManager {
  private static instance: TenantManager;
  private currentContext: TenantContext | null = null;

  private constructor() {}

  /**
   * Singleton instance
   */
  public static getInstance(): TenantManager {
    if (!TenantManager.instance) {
      TenantManager.instance = new TenantManager();
    }
    return TenantManager.instance;
  }

  /**
   * Define o contexto atual do tenant
   */
  public setContext(context: TenantContext): void {
    this.currentContext = context;
  }

  /**
   * Obtém o contexto atual
   */
  public getContext(): TenantContext | null {
    return this.currentContext;
  }

  /**
   * Limpa o contexto (logout)
   */
  public clearContext(): void {
    this.currentContext = null;
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  public hasPermission(
    permission: keyof UserPrivilegesSet['institutional'] | 
                keyof UserPrivilegesSet['organizational'] |
                keyof UserPrivilegesSet['user'],
    scope: 'institutional' | 'organizational' | 'user'
  ): boolean {
    if (!this.currentContext) {
      return false;
    }

    const privileges = this.currentContext.privileges[scope];
    return privileges[permission as keyof typeof privileges] === true;
  }

  /**
   * Verifica se o usuário tem um papel específico ou superior
   */
  public hasRole(role: UserRole | UserRole[]): boolean {
    if (!this.currentContext) {
      return false;
    }

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(this.currentContext.userRole);
  }

  /**
   * Verifica se o usuário tem um papel mínimo (hierarquia)
   * HIERARQUIA SIMPLIFICADA (4 níveis):
   * MASTER (4) → ORG_ADMIN (3) → USER (2) → VIEWER (1)
   */
  public hasMinimumRole(minRole: UserRole): boolean {
    if (!this.currentContext) {
      return false;
    }

    const roleHierarchy = {
      [UserRole.MASTER]: 4,
      [UserRole.ORG_ADMIN]: 3,
      [UserRole.USER]: 2,
      [UserRole.VIEWER]: 1
    };

    const userLevel = roleHierarchy[this.currentContext.userRole];
    const requiredLevel = roleHierarchy[minRole];

    return userLevel >= requiredLevel;
  }

  /**
   * Filtra dados baseado no contexto do tenant
   */
  public filterByTenant<T extends { institutionId: string; organizationId?: string }>(
    data: T[]
  ): T[] {
    if (!this.currentContext) {
      return [];
    }

    const { institutionId, organizationIds, userRole, userId } = this.currentContext;

    switch (userRole) {
      case UserRole.MASTER:
        // Acesso a todos os dados da instituição
        return data.filter(item => item.institutionId === institutionId);

      case UserRole.ORG_ADMIN:
        // Acesso apenas às organizações do usuário
        return data.filter(item =>
          item.institutionId === institutionId &&
          item.organizationId &&
          organizationIds.includes(item.organizationId)
        );

      case UserRole.USER:
      case UserRole.VIEWER:
        // Acesso apenas aos dados próprios
        return data.filter(item =>
          item.institutionId === institutionId &&
          item.organizationId &&
          organizationIds.includes(item.organizationId) &&
          (item as any).userId === userId
        );

      default:
        return [];
    }
  }

  /**
   * Verifica se o usuário pode acessar uma instituição específica
   */
  public canAccessInstitution(institutionId: string): PermissionCheckResult {
    if (!this.currentContext) {
      return {
        allowed: false,
        reason: 'Nenhum contexto de usuário definido'
      };
    }

    if (this.currentContext.institutionId !== institutionId) {
      return {
        allowed: false,
        reason: 'Usuário não pertence a esta instituição'
      };
    }

    return { allowed: true };
  }

  /**
   * Verifica se o usuário pode acessar uma organização específica
   */
  public canAccessOrganization(organizationId: string): PermissionCheckResult {
    if (!this.currentContext) {
      return {
        allowed: false,
        reason: 'Nenhum contexto de usuário definido'
      };
    }

    // Master tem acesso a todas as organizações
    if (this.hasRole(UserRole.MASTER)) {
      return { allowed: true };
    }

    // Outros usuários só acessam suas organizações
    if (!this.currentContext.organizationIds.includes(organizationId)) {
      return {
        allowed: false,
        reason: 'Usuário não pertence a esta organização',
        requiredRole: UserRole.MASTER
      };
    }

    return { allowed: true };
  }

  /**
   * Verifica se o usuário pode realizar uma ação em um recurso
   */
  public canPerformAction(
    action: string,
    resourceType: string,
    resourceId?: string
  ): PermissionCheckResult {
    if (!this.currentContext) {
      return {
        allowed: false,
        reason: 'Nenhum contexto de usuário definido'
      };
    }

    // Mapeia ações para permissões
    const actionPermissionMap: Record<string, {
      scope: keyof UserPrivilegesSet;
      permission: string;
      minRole?: UserRole;
    }> = {
      'create_institution': {
        scope: 'institutional',
        permission: 'manageInstitutionSettings',
        minRole: UserRole.MASTER
      },
      'update_institution': {
        scope: 'institutional',
        permission: 'manageInstitutionSettings',
        minRole: UserRole.MASTER
      },
      'create_organization': {
        scope: 'institutional',
        permission: 'manageOrganizations',
        minRole: UserRole.MASTER
      },
      'update_organization': {
        scope: 'institutional',
        permission: 'manageOrganizations',
        minRole: UserRole.MASTER
      },
      'delete_organization': {
        scope: 'institutional',
        permission: 'manageOrganizations',
        minRole: UserRole.MASTER
      },
      'create_user': {
        scope: 'institutional',
        permission: 'manageAllUsers',
        minRole: UserRole.MASTER
      },
      'update_user': {
        scope: 'institutional',
        permission: 'manageAllUsers',
        minRole: UserRole.MASTER
      },
      'delete_user': {
        scope: 'institutional',
        permission: 'manageAllUsers',
        minRole: UserRole.MASTER
      },
      'create_assessment': {
        scope: 'organizational',
        permission: 'createAssessments',
        minRole: UserRole.ORG_ADMIN
      },
      'update_assessment': {
        scope: 'organizational',
        permission: 'editAssessments',
        minRole: UserRole.ORG_ADMIN
      },
      'delete_assessment': {
        scope: 'organizational',
        permission: 'deleteAssessments',
        minRole: UserRole.ORG_ADMIN
      },
      'view_institutional_reports': {
        scope: 'institutional',
        permission: 'viewInstitutionalReports',
        minRole: UserRole.MASTER
      },
      'view_org_reports': {
        scope: 'organizational',
        permission: 'viewOrgReports',
        minRole: UserRole.ORG_ADMIN
      },
      'export_institutional_data': {
        scope: 'institutional',
        permission: 'exportInstitutionalData',
        minRole: UserRole.MASTER
      },
      'export_org_data': {
        scope: 'organizational',
        permission: 'exportOrgData',
        minRole: UserRole.ORG_ADMIN
      },
      'view_audit_logs': {
        scope: 'institutional',
        permission: 'viewAuditLogs',
        minRole: UserRole.MASTER
      }
    };

    const actionConfig = actionPermissionMap[action];
    
    if (!actionConfig) {
      return {
        allowed: false,
        reason: `Ação '${action}' não reconhecida`
      };
    }

    // Verifica papel mínimo se especificado
    if (actionConfig.minRole && !this.hasMinimumRole(actionConfig.minRole)) {
      return {
        allowed: false,
        reason: 'Papel insuficiente para esta ação',
        requiredRole: actionConfig.minRole
      };
    }

    // Verifica permissão específica
    if (!this.hasPermission(actionConfig.permission as any, actionConfig.scope)) {
      return {
        allowed: false,
        reason: 'Permissão insuficiente para esta ação',
        requiredPrivilege: actionConfig.permission
      };
    }

    return { allowed: true };
  }

  /**
   * Valida se o usuário pode criar um recurso em uma organização
   */
  public canCreateInOrganization(organizationId: string): PermissionCheckResult {
    const orgAccess = this.canAccessOrganization(organizationId);
    if (!orgAccess.allowed) {
      return orgAccess;
    }

    if (!this.hasPermission('createAssessments', 'organizational')) {
      return {
        allowed: false,
        reason: 'Sem permissão para criar recursos nesta organização',
        requiredRole: UserRole.ORG_ADMIN
      };
    }

    return { allowed: true };
  }

  /**
   * Obtém lista de organizações acessíveis pelo usuário
   */
  public getAccessibleOrganizationIds(): string[] {
    if (!this.currentContext) {
      return [];
    }

    // Master tem acesso a todas (retornar todas seria feito via query ao DB)
    // Por ora, retornamos as do contexto
    return this.currentContext.organizationIds;
  }

  /**
   * Verifica se é o primeiro acesso (setup necessário)
   */
  public isFirstTimeSetup(): boolean {
    // Verifica se existe alguma instituição configurada
    const institutions = localStorage.getItem('premium-institutions');
    return !institutions || institutions === '{}';
  }

  /**
   * Verifica se o usuário atual é Master
   */
  public isMaster(): boolean {
    return this.hasRole(UserRole.MASTER);
  }

  /**
   * Verifica se o usuário pode gerenciar outros usuários
   */
  public canManageUsers(): boolean {
    return this.hasPermission('manageAllUsers', 'institutional') ||
           this.hasPermission('manageOrgUsers', 'organizational');
  }

  /**
   * Verifica se o usuário pode ver relatórios institucionais
   */
  public canViewInstitutionalReports(): boolean {
    return this.hasPermission('viewInstitutionalReports', 'institutional');
  }

  /**
   * Obtém resumo de permissões do usuário atual
   */
  public getPermissionsSummary(): {
    role: UserRole;
    canManageInstitution: boolean;
    canManageOrganizations: boolean;
    canManageUsers: boolean;
    canCreateAssessments: boolean;
    canViewInstitutionalReports: boolean;
    canExportData: boolean;
  } | null {
    if (!this.currentContext) {
      return null;
    }

    return {
      role: this.currentContext.userRole,
      canManageInstitution: this.hasPermission('manageInstitutionSettings', 'institutional'),
      canManageOrganizations: this.hasPermission('manageOrganizations', 'institutional'),
      canManageUsers: this.canManageUsers(),
      canCreateAssessments: this.hasPermission('createAssessments', 'organizational'),
      canViewInstitutionalReports: this.canViewInstitutionalReports(),
      canExportData: this.hasPermission('exportInstitutionalData', 'institutional') ||
                      this.hasPermission('exportOrgData', 'organizational')
    };
  }
}

// Export singleton instance
export const tenantManager = TenantManager.getInstance();
