/**
 * UserService - Gerenciamento de usuários Premium
 * 
 * Responsável por:
 * - CRUD de usuários
 * - Vinculação a organizações
 * - Gestão de privilégios
 * - Validação de hierarquia
 */

import type { 
  User, 
  UserRole, 
  UserPrivilegesSet,
  CreateUserData,
  UpdateUserData,
  UserFilters
} from '../../types/premium/user';
import { DEFAULT_PRIVILEGES } from '../../types/premium/user';
import type { Organization } from '../../types/premium/organization';
import { tenantManager } from './tenantManager';
import { authService } from './authService';
import { organizationService } from './organizationService';

class UserService {
  private readonly STORAGE_KEY = 'premium-users';
  private readonly DEFAULT_PASSWORD = 'Sisgead@2024'; // Senha padrão inicial

  /**
   * Criar novo usuário
   */
  async create(userData: CreateUserData): Promise<User> {
    const currentUser = authService.getCurrentUser();
    const currentInstitution = authService.getCurrentInstitution();
    
    if (!currentUser || !currentInstitution) {
      throw new Error('Usuário ou instituição não encontrada no contexto');
    }

    // Validar hierarquia de criação
    this.validateRoleCreation(currentUser.role, userData.role);

    // Validar email único
    const existingEmail = await this.getByEmail(userData.profile.email);
    if (existingEmail) {
      throw new Error('Email já cadastrado');
    }

    // Validar CPF único
    const existingCpf = await this.getByCpf(userData.profile.cpf);
    if (existingCpf) {
      throw new Error('CPF já cadastrado');
    }

    // Validar organizações
    if (userData.organizationIds.length > 0) {
      for (const orgId of userData.organizationIds) {
        const org = await organizationService.getById(orgId);
        if (!org || org.institutionId !== currentInstitution.id) {
          throw new Error(`Organização ${orgId} inválida`);
        }
        
        if (!tenantManager.canAccessOrganization(orgId)) {
          throw new Error(`Sem permissão para a organização ${orgId}`);
        }
      }
    }

    // Hash de senha
    const passwordHash = await this.hashPassword(userData.password);

    // Mesclar privilégios
    const privileges = this.mergePrivileges(
      DEFAULT_PRIVILEGES[userData.role],
      userData.privileges || {}
    );

    // Criar usuário
    const now = new Date().toISOString();
    const newUser: User = {
      id: this.generateId(),
      institutionId: userData.institutionId,
      organizationIds: userData.organizationIds,
      profile: {
        ...userData.profile,
        email: userData.profile.email.toLowerCase().trim()
      },
      role: userData.role,
      privileges,
      security: {
        passwordHash,
        lastPasswordChange: now,
        requirePasswordChange: false,
        twoFactorEnabled: false,
        failedLoginAttempts: 0,
        isLocked: false
      },
      isActive: true,
      createdAt: now,
      createdBy: userData.createdBy,
      lastActivityAt: now
    };

    // Salvar
    const users = await this.getAll();
    users.push(newUser);
    this.saveAll(users);

    // Atualizar estatísticas
    for (const orgId of newUser.organizationIds) {
      await organizationService.updateStats(orgId);
    }

    return newUser;
  }

  /**
   * Obter usuário por ID
   */
  async getById(userId: string): Promise<User | null> {
    const users = await this.getAll();
    const user = users.find(u => u.id === userId);
    
    if (!user) return null;
    if (!this.canAccessUser(user)) return null;

    return user;
  }

  /**
   * Obter por email
   */
  async getByEmail(email: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find(u => u.profile.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Obter por CPF
   */
  async getByCpf(cpf: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find(u => u.profile.cpf === cpf) || null;
  }

  /**
   * Listar com filtros
   */
  async list(filters?: UserFilters): Promise<User[]> {
    let users = await this.getAll();

    if (filters?.institutionId) {
      users = users.filter(u => u.institutionId === filters.institutionId);
    }

    if (filters?.organizationId) {
      users = users.filter(u => u.organizationIds.includes(filters.organizationId!));
    }

    if (filters?.role) {
      users = users.filter(u => u.role === filters.role);
    }

    if (filters?.isActive !== undefined) {
      users = users.filter(u => u.isActive === filters.isActive);
    }

    if (filters?.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      users = users.filter(u => 
        u.profile.name.toLowerCase().includes(search) ||
        u.profile.email.toLowerCase().includes(search) ||
        u.profile.cpf.includes(search) ||
        u.profile.department?.toLowerCase().includes(search) ||
        u.profile.position?.toLowerCase().includes(search)
      );
    }

    return users.filter(u => this.canAccessUser(u));
  }

  /**
   * Atualizar usuário
   */
  async update(userId: string, updates: UpdateUserData): Promise<User> {
    const user = await this.getById(userId);
    if (!user) throw new Error('Usuário não encontrado');
    if (!this.canModifyUser(user)) throw new Error('Sem permissão');

    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário atual não encontrado');

    // Validar role
    if (updates.role && updates.role !== user.role) {
      this.validateRoleCreation(currentUser.role, updates.role);
    }

    // Validar organizações
    if (updates.organizationIds) {
      for (const orgId of updates.organizationIds) {
        if (!tenantManager.canAccessOrganization(orgId)) {
          throw new Error(`Sem permissão para organização ${orgId}`);
        }
      }
    }

    // Mesclar privilégios
    const privileges = updates.privileges
      ? this.mergePrivileges(user.privileges, updates.privileges)
      : user.privileges;

    // Atualizar
    const updatedUser: User = {
      ...user,
      profile: { ...user.profile, ...updates.profile },
      role: updates.role ?? user.role,
      privileges,
      organizationIds: updates.organizationIds ?? user.organizationIds,
      isActive: updates.isActive ?? user.isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: updates.updatedBy
    };

    const users = await this.getAll();
    const index = users.findIndex(u => u.id === userId);
    users[index] = updatedUser;
    this.saveAll(users);

    // Atualizar estatísticas
    const allOrgs = [...new Set([...user.organizationIds, ...updatedUser.organizationIds])];
    for (const orgId of allOrgs) {
      await organizationService.updateStats(orgId);
    }

    return updatedUser;
  }

  /**
   * Deletar usuário
   */
  async delete(userId: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error('Usuário não encontrado');
    if (!this.canModifyUser(user)) throw new Error('Sem permissão');

    const currentUser = authService.getCurrentUser();
    if (currentUser?.id === userId) {
      throw new Error('Não pode deletar a si mesmo');
    }

    // Validar MASTER único
    if (user.role === 'master') {
      const masters = await this.list({ role: 'master' as UserRole });
      if (masters.length === 1) {
        throw new Error('Não pode deletar o único MASTER');
      }
    }

    const users = await this.getAll();
    this.saveAll(users.filter(u => u.id !== userId));

    for (const orgId of user.organizationIds) {
      await organizationService.updateStats(orgId);
    }
  }

  /**
   * Redefinir senha para padrão
   */
  async resetPassword(userId: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error('Usuário não encontrado');
    if (!this.canModifyUser(user)) throw new Error('Sem permissão');

    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário atual não encontrado');

    // Hash da senha padrão
    const passwordHash = await this.hashPassword(this.DEFAULT_PASSWORD);

    // Atualizar senha e forçar troca no próximo login
    const now = new Date().toISOString();
    user.security = {
      ...user.security,
      passwordHash,
      lastPasswordChange: now,
      requirePasswordChange: true, // Força o usuário a criar nova senha
      failedLoginAttempts: 0,
      isLocked: false
    };
    user.updatedAt = now;
    user.updatedBy = currentUser.id;

    const users = await this.getAll();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = user;
      this.saveAll(users);
    }
  }

  /**
   * Atribuir a organizações
   */
  async assignToOrganizations(userId: string, organizationIds: string[], updatedBy: string): Promise<User> {
    return this.update(userId, { organizationIds, updatedBy });
  }

  /**
   * Atualizar privilégios
   */
  async updatePrivileges(userId: string, privileges: Partial<UserPrivilegesSet>, updatedBy: string): Promise<User> {
    return this.update(userId, { privileges, updatedBy });
  }

  /**
   * Ativar
   */
  async activate(userId: string, updatedBy: string): Promise<User> {
    return this.update(userId, { isActive: true, updatedBy });
  }

  /**
   * Desativar
   */
  async deactivate(userId: string, updatedBy: string): Promise<User> {
    return this.update(userId, { isActive: false, updatedBy });
  }

  /**
   * Alterar senha
   */
  async changePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error('Usuário não encontrado');

    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuário atual não encontrado');

    if (currentUser.id !== userId && !this.canModifyUser(user)) {
      throw new Error('Sem permissão para alterar senha');
    }

    const passwordHash = await this.hashPassword(newPassword);
    const users = await this.getAll();
    const index = users.findIndex(u => u.id === userId);
    users[index] = {
      ...users[index],
      security: {
        ...users[index].security,
        passwordHash,
        lastPasswordChange: new Date().toISOString(),
        requirePasswordChange: false
      }
    };
    this.saveAll(users);
  }

  /**
   * Obter usuários da árvore organizacional
   */
  async getUsersByOrganizationTree(organizationId: string): Promise<User[]> {
    const org = await organizationService.getById(organizationId);
    if (!org) throw new Error('Organização não encontrada');

    const tree = await organizationService.buildTree(org.institutionId);
    const orgIds = this.extractOrgIdsFromTree(tree, organizationId);

    const users = await this.getAll();
    return users.filter(u => u.organizationIds.some(id => orgIds.includes(id)));
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private async getAll(): Promise<User[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Erro ao parsear usuários:', error);
      return [];
    }
  }

  private saveAll(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async hashPassword(password: string): Promise<string> {
    // TODO: Em produção usar bcrypt
    return `hash_${password}`;
  }

  private mergePrivileges(base: UserPrivilegesSet, updates: Partial<UserPrivilegesSet>): UserPrivilegesSet {
    return {
      institutional: { ...base.institutional, ...(updates.institutional || {}) },
      organizational: { ...base.organizational, ...(updates.organizational || {}) },
      user: { ...base.user, ...(updates.user || {}) }
    };
  }

  private validateRoleCreation(creatorRole: UserRole, targetRole: UserRole): void {
    const hierarchy: Record<UserRole, number> = {
      'master': 4,
      'org_admin': 3,
      'user': 2,
      'viewer': 1
    };

    if (hierarchy[creatorRole] <= hierarchy[targetRole]) {
      throw new Error(`Role ${creatorRole} não pode criar role ${targetRole}`);
    }
  }

  private canAccessUser(user: User): boolean {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;

    if (currentUser.role === 'master') {
      return user.institutionId === currentUser.institutionId;
    }

    if (currentUser.role === 'org_admin') {
      if (user.organizationIds.length === 0) return false;
      return user.organizationIds.some(orgId => tenantManager.canAccessOrganization(orgId));
    }

    return user.id === currentUser.id;
  }

  private canModifyUser(user: User): boolean {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;

    const hierarchy: Record<UserRole, number> = {
      'master': 4,
      'org_admin': 3,
      'user': 2,
      'viewer': 1
    };

    if (hierarchy[currentUser.role] <= hierarchy[user.role] && currentUser.id !== user.id) {
      return false;
    }

    if (currentUser.role === 'master') {
      return user.institutionId === currentUser.institutionId;
    }

    if (currentUser.role === 'org_admin') {
      return this.canAccessUser(user);
    }

    return user.id === currentUser.id;
  }

  private extractOrgIdsFromTree(tree: any[], targetId: string): string[] {
    const ids: string[] = [];
    
    const traverse = (nodes: any[], collect: boolean = false): boolean => {
      for (const node of nodes) {
        if (node.id === targetId) collect = true;
        if (collect) ids.push(node.id);
        
        if (node.children && node.children.length > 0) {
          const found = traverse(node.children, collect || node.id === targetId);
          if (found && !collect) {
            ids.push(node.id);
            return true;
          }
        }
      }
      return collect;
    };
    
    traverse(tree);
    return ids;
  }
}

export const userService = new UserService();
