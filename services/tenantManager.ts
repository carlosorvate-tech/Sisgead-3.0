// 🏢 SISGEAD 2.0 - Tenant Manager Service
// Sistema completo de gestão multi-tenant com isolamento de dados

import type { 
  Tenant, 
  TenantContext, 
  InstitutionalUser,
  TenantConfiguration,
  TenantOperationResult,
  UserRole,
  Permission
} from '../types/institutional';

export class TenantManager {
  private static instance: TenantManager;
  private currentTenant: Tenant | null = null;
  private tenantCache = new Map<string, Tenant>();
  private userPermissions = new Map<string, Permission[]>();
  private storagePrefix = 'sisgead_tenant_';
  
  // 🔐 Singleton pattern for data consistency
  public static getInstance(): TenantManager {
    if (!TenantManager.instance) {
      TenantManager.instance = new TenantManager();
    }
    return TenantManager.instance;
  }

  private constructor() {
    this.initializeFromStorage();
  }

  // 🚀 Initialization
  private initializeFromStorage(): void {
    try {
      // Load current tenant from localStorage
      const savedTenantId = localStorage.getItem(`${this.storagePrefix}current`);
      if (savedTenantId) {
        const tenantData = localStorage.getItem(`${this.storagePrefix}${savedTenantId}`);
        if (tenantData) {
          this.currentTenant = JSON.parse(tenantData);
          this.tenantCache.set(savedTenantId, this.currentTenant);
        }
      }

      // Load cached tenants
      const cacheKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.storagePrefix) && key !== `${this.storagePrefix}current`);
      
      for (const key of cacheKeys) {
        const tenantId = key.replace(this.storagePrefix, '');
        const tenantData = localStorage.getItem(key);
        if (tenantData) {
          this.tenantCache.set(tenantId, JSON.parse(tenantData));
        }
      }
    } catch (error) {
      console.warn('Error initializing tenant manager from storage:', error);
      this.resetToDefault();
    }
  }

  // 🔄 Default Tenant Management
  private resetToDefault(): void {
    const defaultTenant: Tenant = {
      id: 'default',
      name: 'default',
      displayName: 'SISGEAD 2.0',
      isActive: true,
      settings: {
        features: {
          smartHintsEnabled: true,
          auditLoggingLevel: 'basic',
        },
        security: {
          requireTwoFactor: false,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
          },
          sessionTimeout: 480 // 8 hours
        },
        locale: {
          language: 'pt-BR',
          currency: 'BRL',
          timezone: 'America/Sao_Paulo',
          dateFormat: 'DD/MM/YYYY'
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        lgpdCompliant: true,
        dataRegion: 'br-southeast'
      }
    };

    this.currentTenant = defaultTenant;
    this.tenantCache.set('default', defaultTenant);
    this.persistTenant(defaultTenant);
  }

  // 🏢 Core Tenant Operations
  public async createTenant(tenantData: Partial<Tenant>): Promise<TenantOperationResult<Tenant>> {
    try {
      if (!tenantData.name || !tenantData.displayName) {
        return {
          success: false,
          error: 'Nome e nome de exibição são obrigatórios',
          tenantId: tenantData.id || 'unknown'
        };
      }

      // Check for duplicate names
      const existingTenant = Array.from(this.tenantCache.values())
        .find(t => t.name === tenantData.name);
      
      if (existingTenant) {
        return {
          success: false,
          error: 'Já existe um tenant com este nome',
          tenantId: tenantData.id || 'unknown'
        };
      }

      const tenant: Tenant = {
        id: tenantData.id || this.generateTenantId(),
        name: tenantData.name,
        displayName: tenantData.displayName,
        cnpj: tenantData.cnpj,
        domain: tenantData.domain,
        isActive: tenantData.isActive ?? true,
        settings: this.mergeWithDefaultSettings(tenantData.settings),
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          lgpdCompliant: true,
          dataRegion: 'br-southeast',
          ...tenantData.metadata
        }
      };

      // Validate tenant data
      const validation = this.validateTenant(tenant);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
          tenantId: tenant.id
        };
      }

      // Store tenant
      this.tenantCache.set(tenant.id, tenant);
      this.persistTenant(tenant);

      return {
        success: true,
        data: tenant,
        tenantId: tenant.id
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao criar tenant: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        tenantId: tenantData.id || 'unknown'
      };
    }
  }

  public getTenant(tenantId: string): Tenant | null {
    return this.tenantCache.get(tenantId) || null;
  }

  public getAllTenants(): Tenant[] {
    return Array.from(this.tenantCache.values())
      .filter(tenant => tenant.isActive)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  public async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<TenantOperationResult<Tenant>> {
    try {
      const existingTenant = this.tenantCache.get(tenantId);
      if (!existingTenant) {
        return {
          success: false,
          error: 'Tenant não encontrado',
          tenantId
        };
      }

      const updatedTenant: Tenant = {
        ...existingTenant,
        ...updates,
        id: tenantId, // Prevent ID changes
        updatedAt: new Date()
      };

      // Validate updated data
      const validation = this.validateTenant(updatedTenant);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
          tenantId
        };
      }

      // Update cache and storage
      this.tenantCache.set(tenantId, updatedTenant);
      this.persistTenant(updatedTenant);

      // Update current tenant if it's the one being modified
      if (this.currentTenant?.id === tenantId) {
        this.currentTenant = updatedTenant;
      }

      return {
        success: true,
        data: updatedTenant,
        tenantId
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao atualizar tenant: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        tenantId
      };
    }
  }

  public async deleteTenant(tenantId: string): Promise<TenantOperationResult<boolean>> {
    try {
      if (tenantId === 'default') {
        return {
          success: false,
          error: 'Não é possível excluir o tenant padrão',
          tenantId
        };
      }

      const tenant = this.tenantCache.get(tenantId);
      if (!tenant) {
        return {
          success: false,
          error: 'Tenant não encontrado',
          tenantId
        };
      }

      // Soft delete - mark as inactive
      const updatedTenant: Tenant = {
        ...tenant,
        isActive: false,
        updatedAt: new Date()
      };

      this.tenantCache.set(tenantId, updatedTenant);
      this.persistTenant(updatedTenant);

      // Switch to default if current tenant is being deleted
      if (this.currentTenant?.id === tenantId) {
        await this.switchTenant('default');
      }

      return {
        success: true,
        data: true,
        tenantId
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao excluir tenant: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        tenantId
      };
    }
  }

  // 🔄 Tenant Switching
  public async switchTenant(tenantId: string): Promise<TenantOperationResult<Tenant>> {
    try {
      const tenant = this.tenantCache.get(tenantId);
      if (!tenant) {
        return {
          success: false,
          error: 'Tenant não encontrado',
          tenantId
        };
      }

      if (!tenant.isActive) {
        return {
          success: false,
          error: 'Tenant está inativo',
          tenantId
        };
      }

      // Store current tenant
      this.currentTenant = tenant;
      localStorage.setItem(`${this.storagePrefix}current`, tenantId);

      // Trigger tenant change event
      this.notifyTenantChange(tenant);

      return {
        success: true,
        data: tenant,
        tenantId
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao trocar tenant: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        tenantId
      };
    }
  }

  // 📊 Context Management
  public getCurrentContext(): TenantContext {
    const user = this.getCurrentUser();
    
    return {
      currentTenant: this.currentTenant,
      availableTenants: this.getAllTenants(),
      userRole: user?.role || 'guest',
      permissions: user ? this.userPermissions.get(user.id) || [] : [],
      isLoading: false,
      isMultiTenant: this.tenantCache.size > 1,
      isSuperAdmin: user?.role === 'super_admin'
    };
  }

  public getCurrentTenant(): Tenant | null {
    return this.currentTenant;
  }

  public isMultiTenantMode(): boolean {
    return this.tenantCache.size > 1;
  }

  // 👤 User Management (Basic - will be enhanced in INCREMENT 2)
  private getCurrentUser(): InstitutionalUser | null {
    // This will be enhanced in INCREMENT 2
    // For now, return basic user info from existing system
    const userData = localStorage.getItem('sisgead_user');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        id: user.id || user.cpf || 'anonymous',
        tenantId: this.currentTenant?.id || 'default',
        cpf: user.cpf || '',
        name: user.name || 'Usuário',
        email: user.email || '',
        role: user.isAdmin ? 'tenant_admin' : 'evaluator',
        permissions: [],
        isActive: true,
        createdAt: new Date(),
      };
    }
    return null;
  }

  // 🔐 Permission Management
  public hasPermission(resource: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    // Check specific permissions
    const userPermissions = this.userPermissions.get(user.id) || [];
    return userPermissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action as any)
    );
  }

  // 🛠️ Utility Methods
  private generateTenantId(): string {
    return `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mergeWithDefaultSettings(settings?: Partial<Tenant['settings']>): Tenant['settings'] {
    return {
      features: {
        smartHintsEnabled: true,
        auditLoggingLevel: 'basic',
        ...settings?.features
      },
      security: {
        requireTwoFactor: false,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false
        },
        sessionTimeout: 480,
        ...settings?.security
      },
      locale: {
        language: 'pt-BR',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        dateFormat: 'DD/MM/YYYY',
        ...settings?.locale
      },
      ...settings
    };
  }

  private validateTenant(tenant: Tenant): { success: boolean; error?: string } {
    // Basic validation
    if (!tenant.name || tenant.name.trim() === '') {
      return { success: false, error: 'Nome do tenant é obrigatório' };
    }

    if (!tenant.displayName || tenant.displayName.trim() === '') {
      return { success: false, error: 'Nome de exibição é obrigatório' };
    }

    // CNPJ validation (if provided)
    if (tenant.cnpj && !this.isValidCNPJ(tenant.cnpj)) {
      return { success: false, error: 'CNPJ inválido' };
    }

    return { success: true };
  }

  private isValidCNPJ(cnpj: string): boolean {
    // Basic CNPJ validation - will be enhanced in INCREMENT 2
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.length === 14;
  }

  private persistTenant(tenant: Tenant): void {
    try {
      localStorage.setItem(`${this.storagePrefix}${tenant.id}`, JSON.stringify(tenant));
    } catch (error) {
      console.warn('Error persisting tenant to storage:', error);
    }
  }

  private notifyTenantChange(tenant: Tenant): void {
    // Dispatch custom event for components to react to tenant changes
    window.dispatchEvent(new CustomEvent('tenantChanged', { 
      detail: tenant 
    }));
  }

  // 🧹 Cleanup & Reset
  public reset(): void {
    this.tenantCache.clear();
    this.userPermissions.clear();
    this.currentTenant = null;
    
    // Clear tenant data from storage (keep other data intact)
    const keysToRemove = Object.keys(localStorage)
      .filter(key => key.startsWith(this.storagePrefix));
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reset to default
    this.resetToDefault();
  }

  // 📈 Statistics & Health
  public getStatistics() {
    return {
      totalTenants: this.tenantCache.size,
      activeTenants: Array.from(this.tenantCache.values()).filter(t => t.isActive).length,
      currentTenantId: this.currentTenant?.id || null,
      isMultiTenant: this.isMultiTenantMode(),
      cacheSize: this.tenantCache.size
    };
  }

  public healthCheck(): { status: 'healthy' | 'warning' | 'error'; issues: string[] } {
    const issues: string[] = [];
    
    if (this.tenantCache.size === 0) {
      issues.push('Nenhum tenant carregado');
    }
    
    if (!this.currentTenant) {
      issues.push('Nenhum tenant ativo');
    }
    
    if (!localStorage.getItem(`${this.storagePrefix}current`)) {
      issues.push('Tenant atual não persistido');
    }
    
    const status = issues.length === 0 ? 'healthy' : 
                   issues.length <= 1 ? 'warning' : 'error';
    
    return { status, issues };
  }
}

// 🎯 Export singleton instance
export const tenantManager = TenantManager.getInstance();