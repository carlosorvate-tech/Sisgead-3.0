/**
 * SISGEAD Premium 3.0 - Organization Service
 * Gerencia CRUD de organizações e hierarquia
 */

import {
  Organization,
  CreateOrganizationData,
  UpdateOrganizationData,
  OrganizationFilters,
  OrganizationTreeNode,
  OrganizationStatus,
  DEFAULT_ORGANIZATION_SETTINGS,
  INITIAL_ORGANIZATION_STATS
} from '../../types/premium';

/**
 * OrganizationService - CRUD de organizações
 */
class OrganizationService {
  private static instance: OrganizationService;
  private readonly STORAGE_KEY = 'premium-organizations';

  private constructor() {}

  /**
   * Singleton instance
   */
  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  /**
   * Cria nova organização
   */
  public async create(data: CreateOrganizationData): Promise<{
    success: boolean;
    organization?: Organization;
    error?: string;
  }> {
    try {
      // Validar dados
      if (!data.name || !data.institutionId) {
        return { success: false, error: 'Dados obrigatórios faltando' };
      }

      // Calcular nível hierárquico
      let hierarchyLevel = 0;
      let hierarchyPath = '';

      if (data.parentOrgId) {
        const parent = await this.getById(data.parentOrgId);
        if (!parent) {
          return { success: false, error: 'Organização pai não encontrada' };
        }
        hierarchyLevel = parent.hierarchyLevel + 1;
        hierarchyPath = `${parent.hierarchyPath}/${data.parentOrgId}`;
      }

      // Criar organização
      const organization: Organization = {
        id: this.generateId(),
        institutionId: data.institutionId,
        parentOrgId: data.parentOrgId,
        name: data.name,
        code: data.code,
        description: data.description,
        hierarchyLevel,
        hierarchyPath: hierarchyPath || '/',
        settings: {
          ...DEFAULT_ORGANIZATION_SETTINGS,
          ...data.settings
        },
        stats: INITIAL_ORGANIZATION_STATS,
        status: OrganizationStatus.ACTIVE,
        color: data.color,
        icon: data.icon,
        createdAt: new Date().toISOString(),
        createdBy: data.createdBy
      };

      // Salvar
      await this.save(organization);

      return { success: true, organization };
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      return { success: false, error: 'Erro ao criar organização' };
    }
  }

  /**
   * Obtém organização por ID
   */
  public async getById(id: string): Promise<Organization | null> {
    const organizations = await this.loadAll();
    return organizations[id] || null;
  }

  /**
   * Lista organizações com filtros
   */
  public async list(filters?: OrganizationFilters): Promise<Organization[]> {
    const organizations = await this.loadAll();
    let results = Object.values(organizations);

    // Aplicar filtros
    if (filters) {
      if (filters.institutionId) {
        results = results.filter(o => o.institutionId === filters.institutionId);
      }

      if (filters.parentOrgId !== undefined) {
        results = results.filter(o => o.parentOrgId === filters.parentOrgId);
      }

      if (filters.status) {
        results = results.filter(o => o.status === filters.status);
      }

      if (filters.hierarchyLevel !== undefined) {
        results = results.filter(o => o.hierarchyLevel === filters.hierarchyLevel);
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        results = results.filter(o =>
          o.name.toLowerCase().includes(term) ||
          o.code?.toLowerCase().includes(term)
        );
      }
    }

    return results;
  }

  /**
   * Obtém organizações raiz (sem pai) de uma instituição
   */
  public async getRootOrganizations(institutionId: string): Promise<Organization[]> {
    return this.list({
      institutionId,
      parentOrgId: null
    });
  }

  /**
   * Obtém sub-organizações de uma organização
   */
  public async getChildren(parentOrgId: string): Promise<Organization[]> {
    return this.list({ parentOrgId });
  }

  /**
   * Constrói árvore hierárquica de organizações
   */
  public async buildTree(institutionId: string): Promise<OrganizationTreeNode[]> {
    const roots = await this.getRootOrganizations(institutionId);
    return Promise.all(roots.map(org => this.buildNode(org, 0)));
  }

  /**
   * Constrói nó da árvore recursivamente
   */
  private async buildNode(
    organization: Organization,
    depth: number
  ): Promise<OrganizationTreeNode> {
    const children = await this.getChildren(organization.id);
    
    return {
      organization,
      children: await Promise.all(
        children.map(child => this.buildNode(child, depth + 1))
      ),
      depth,
      isExpanded: depth === 0 // Primeiro nível expandido por padrão
    };
  }

  /**
   * Atualiza organização
   */
  public async update(
    id: string,
    data: UpdateOrganizationData
  ): Promise<{
    success: boolean;
    organization?: Organization;
    error?: string;
  }> {
    try {
      const organization = await this.getById(id);
      if (!organization) {
        return { success: false, error: 'Organização não encontrada' };
      }

      // Atualizar campos
      const updated: Organization = {
        ...organization,
        ...data,
        settings: data.settings
          ? { ...organization.settings, ...data.settings }
          : organization.settings,
        updatedAt: new Date().toISOString(),
        updatedBy: data.updatedBy
      };

      await this.save(updated);

      return { success: true, organization: updated };
    } catch (error) {
      console.error('Erro ao atualizar organização:', error);
      return { success: false, error: 'Erro ao atualizar organização' };
    }
  }

  /**
   * Remove organização
   */
  public async delete(id: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verificar se tem sub-organizações
      const children = await this.getChildren(id);
      if (children.length > 0) {
        return {
          success: false,
          error: 'Não é possível remover organização com sub-organizações'
        };
      }

      // Verificar se tem usuários
      const hasUsers = await this.hasUsers(id);
      if (hasUsers) {
        return {
          success: false,
          error: 'Não é possível remover organização com usuários ativos'
        };
      }

      // Remover
      const organizations = await this.loadAll();
      delete organizations[id];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(organizations));

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover organização:', error);
      return { success: false, error: 'Erro ao remover organização' };
    }
  }

  /**
   * Atualiza estatísticas da organização
   */
  public async updateStats(id: string): Promise<void> {
    const organization = await this.getById(id);
    if (!organization) return;

    // Calcular estatísticas
    const users = await this.countUsers(id);
    const subOrganizations = await this.countSubOrganizations(id);
    const assessments = await this.countAssessments(id);

    organization.stats = {
      totalActiveUsers: users.active,
      totalInactiveUsers: users.inactive,
      totalSubOrganizations: subOrganizations,
      totalAssessments: assessments.total,
      totalCompletedAssessments: assessments.completed,
      completionRate: assessments.total > 0
        ? (assessments.completed / assessments.total) * 100
        : 0,
      lastUpdated: new Date().toISOString()
    };

    await this.save(organization);
  }

  /**
   * Salva organização no storage
   */
  private async save(organization: Organization): Promise<void> {
    const organizations = await this.loadAll();
    organizations[organization.id] = organization;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(organizations));
  }

  /**
   * Carrega todas as organizações
   */
  private async loadAll(): Promise<Record<string, Organization>> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Gera ID único
   */
  private generateId(): string {
    return `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se organização tem usuários
   */
  private async hasUsers(organizationId: string): Promise<boolean> {
    const data = localStorage.getItem('premium-users');
    if (!data) return false;

    const users = JSON.parse(data);
    return Object.values(users).some((user: any) =>
      user.organizationIds.includes(organizationId)
    );
  }

  /**
   * Conta usuários da organização
   */
  private async countUsers(organizationId: string): Promise<{
    active: number;
    inactive: number;
  }> {
    const data = localStorage.getItem('premium-users');
    if (!data) return { active: 0, inactive: 0 };

    const users = JSON.parse(data);
    const orgUsers = Object.values(users).filter((user: any) =>
      user.organizationIds.includes(organizationId)
    );

    return {
      active: orgUsers.filter((u: any) => u.isActive).length,
      inactive: orgUsers.filter((u: any) => !u.isActive).length
    };
  }

  /**
   * Conta sub-organizações
   */
  private async countSubOrganizations(organizationId: string): Promise<number> {
    const children = await this.getChildren(organizationId);
    return children.length;
  }

  /**
   * Conta avaliações da organização
   */
  private async countAssessments(organizationId: string): Promise<{
    total: number;
    completed: number;
  }> {
    // Por ora, retorna 0 - será implementado quando integrarmos com avaliações existentes
    return { total: 0, completed: 0 };
  }
}

// Export singleton instance
export const organizationService = OrganizationService.getInstance();
