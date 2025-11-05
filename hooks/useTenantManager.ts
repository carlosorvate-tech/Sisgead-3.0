// 🪝 SISGEAD 2.0 - Multi-Tenant React Hook
// Hook customizado para facilitar uso do sistema multi-tenant

import { useState, useEffect, useCallback, useMemo } from 'react';
import { tenantManager } from '../services/tenantManager';
import { tenantStorage } from '../utils/tenantStorage';
import type { 
  Tenant, 
  TenantContext, 
  TenantOperationResult,
  InstitutionalUser 
} from '../types/institutional';

export interface UseTenantManagerReturn {
  // State
  context: TenantContext;
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  isLoading: boolean;
  error: string | null;
  
  // Operations
  createTenant: (tenantData: Partial<Tenant>) => Promise<TenantOperationResult<Tenant>>;
  switchTenant: (tenantId: string) => Promise<TenantOperationResult<Tenant>>;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => Promise<TenantOperationResult<Tenant>>;
  deleteTenant: (tenantId: string) => Promise<TenantOperationResult<boolean>>;
  
  // Utilities
  hasPermission: (resource: string, action: string) => boolean;
  isMultiTenant: boolean;
  isSuperAdmin: boolean;
  refresh: () => void;
  
  // Storage shortcuts
  storeData: <T>(key: string, data: T) => boolean;
  getData: <T>(key: string, defaultValue?: T | null) => T | null;
  clearTenantData: () => boolean;
}

/**
 * Hook principal para gerenciamento multi-tenant
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     currentTenant, 
 *     availableTenants, 
 *     switchTenant,
 *     hasPermission 
 *   } = useTenantManager();
 *   
 *   if (!currentTenant) return <div>Carregando...</div>;
 *   
 *   return (
 *     <div>
 *       <h1>{currentTenant.displayName}</h1>
 *       {hasPermission('users', 'create') && (
 *         <button>Criar Usuário</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTenantManager(): UseTenantManagerReturn {
  const [context, setContext] = useState<TenantContext>(() => 
    tenantManager.getCurrentContext()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Refresh context from tenant manager
  const refresh = useCallback(() => {
    try {
      const newContext = tenantManager.getCurrentContext();
      setContext(newContext);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar contexto');
    }
  }, []);

  // 🎧 Listen for tenant changes
  useEffect(() => {
    const handleTenantChange = () => {
      refresh();
    };

    // Listen for custom tenant change events
    window.addEventListener('tenantChanged', handleTenantChange);
    
    // Initial load
    refresh();

    return () => {
      window.removeEventListener('tenantChanged', handleTenantChange);
    };
  }, [refresh]);

  // 🏢 Tenant Operations
  const createTenant = useCallback(async (tenantData: Partial<Tenant>): Promise<TenantOperationResult<Tenant>> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tenantManager.createTenant(tenantData);
      
      if (result.success) {
        refresh(); // Update context after successful creation
      } else {
        setError(result.error || 'Erro ao criar tenant');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado ao criar tenant';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        tenantId: tenantData.id || 'unknown'
      };
    } finally {
      setIsLoading(false);
    }
  }, [refresh]);

  const switchTenant = useCallback(async (tenantId: string): Promise<TenantOperationResult<Tenant>> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tenantManager.switchTenant(tenantId);
      
      if (result.success) {
        refresh(); // Update context after successful switch
      } else {
        setError(result.error || 'Erro ao trocar tenant');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado ao trocar tenant';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        tenantId
      };
    } finally {
      setIsLoading(false);
    }
  }, [refresh]);

  const updateTenant = useCallback(async (tenantId: string, updates: Partial<Tenant>): Promise<TenantOperationResult<Tenant>> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tenantManager.updateTenant(tenantId, updates);
      
      if (result.success) {
        refresh(); // Update context after successful update
      } else {
        setError(result.error || 'Erro ao atualizar tenant');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado ao atualizar tenant';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        tenantId
      };
    } finally {
      setIsLoading(false);
    }
  }, [refresh]);

  const deleteTenant = useCallback(async (tenantId: string): Promise<TenantOperationResult<boolean>> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tenantManager.deleteTenant(tenantId);
      
      if (result.success) {
        refresh(); // Update context after successful deletion
      } else {
        setError(result.error || 'Erro ao excluir tenant');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado ao excluir tenant';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        tenantId
      };
    } finally {
      setIsLoading(false);
    }
  }, [refresh]);

  // 🔐 Permission check
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    return tenantManager.hasPermission(resource, action);
  }, []);

  // 💾 Storage shortcuts
  const storeData = useCallback(<T>(key: string, data: T): boolean => {
    return tenantStorage.setItem(key, data);
  }, []);

  const getData = useCallback(<T>(key: string, defaultValue: T | null = null): T | null => {
    return tenantStorage.getItem(key, false, defaultValue);
  }, []);

  const clearTenantData = useCallback((): boolean => {
    return tenantStorage.clearTenantData();
  }, []);

  // 📊 Computed values
  const currentTenant = useMemo(() => context.currentTenant, [context.currentTenant]);
  const availableTenants = useMemo(() => context.availableTenants, [context.availableTenants]);
  const isMultiTenant = useMemo(() => context.isMultiTenant, [context.isMultiTenant]);
  const isSuperAdmin = useMemo(() => context.isSuperAdmin, [context.isSuperAdmin]);

  return {
    // State
    context,
    currentTenant,
    availableTenants,
    isLoading,
    error,
    
    // Operations
    createTenant,
    switchTenant,
    updateTenant,
    deleteTenant,
    
    // Utilities
    hasPermission,
    isMultiTenant,
    isSuperAdmin,
    refresh,
    
    // Storage shortcuts
    storeData,
    getData,
    clearTenantData
  };
}

/**
 * Hook simplificado apenas para dados do tenant atual
 */
export function useTenant() {
  const { currentTenant, isLoading } = useTenantManager();
  return { currentTenant, isLoading };
}

/**
 * Hook para permissões
 */
export function usePermissions() {
  const { hasPermission, context } = useTenantManager();
  
  return {
    hasPermission,
    userRole: context.userRole,
    isSuperAdmin: context.isSuperAdmin,
    canCreate: (resource: string) => hasPermission(resource, 'create'),
    canRead: (resource: string) => hasPermission(resource, 'read'),
    canUpdate: (resource: string) => hasPermission(resource, 'update'),
    canDelete: (resource: string) => hasPermission(resource, 'delete'),
    canExport: (resource: string) => hasPermission(resource, 'export'),
  };
}

/**
 * Hook para storage com isolamento por tenant
 */
export function useTenantStorage<T = any>(key: string, defaultValue: T | null = null) {
  const [data, setData] = useState<T | null>(() => 
    tenantStorage.getItem(key, false, defaultValue)
  );
  const [isLoading, setIsLoading] = useState(false);

  const saveData = useCallback((newData: T) => {
    setIsLoading(true);
    try {
      const success = tenantStorage.setItem(key, newData);
      if (success) {
        setData(newData);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const removeData = useCallback(() => {
    setIsLoading(true);
    try {
      const success = tenantStorage.removeItem(key);
      if (success) {
        setData(defaultValue);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [key, defaultValue]);

  const refreshData = useCallback(() => {
    const newData = tenantStorage.getItem(key, false, defaultValue);
    setData(newData);
  }, [key, defaultValue]);

  // Listen for tenant changes to refresh data
  useEffect(() => {
    const handleTenantChange = () => {
      refreshData();
    };

    window.addEventListener('tenantChanged', handleTenantChange);
    return () => {
      window.removeEventListener('tenantChanged', handleTenantChange);
    };
  }, [refreshData]);

  return {
    data,
    saveData,
    removeData,
    refreshData,
    isLoading,
    hasData: data !== null
  };
}

/**
 * Hook para cache com TTL
 */
export function useTenantCache<T = any>(key: string, ttlMinutes: number = 60) {
  const [data, setData] = useState<T | null>(() => 
    tenantStorage.getCache(key)
  );

  const setCache = useCallback((newData: T) => {
    const success = tenantStorage.setCache(key, newData, ttlMinutes);
    if (success) {
      setData(newData);
    }
    return success;
  }, [key, ttlMinutes]);

  const clearCache = useCallback(() => {
    const success = tenantStorage.removeItem(`cache_${key}`);
    if (success) {
      setData(null);
    }
    return success;
  }, [key]);

  const refreshCache = useCallback(() => {
    const newData = tenantStorage.getCache<T>(key);
    setData(newData);
  }, [key]);

  return {
    data,
    setCache,
    clearCache,
    refreshCache,
    hasData: data !== null
  };
}

/**
 * Hook para analytics simples
 */
export function useTenantAnalytics() {
  const { currentTenant } = useTenantManager();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!currentTenant) return;

    // Collect basic usage statistics
    const storageStats = tenantStorage.getStorageStatistics();
    const managerStats = tenantManager.getStatistics();

    setStats({
      storage: storageStats,
      manager: managerStats,
      tenant: {
        id: currentTenant.id,
        name: currentTenant.displayName,
        isActive: currentTenant.isActive,
        createdAt: currentTenant.createdAt
      }
    });
  }, [currentTenant]);

  return {
    stats,
    refresh: () => {
      if (currentTenant) {
        const storageStats = tenantStorage.getStorageStatistics();
        const managerStats = tenantManager.getStatistics();
        setStats({
          storage: storageStats,
          manager: managerStats,
          tenant: {
            id: currentTenant.id,
            name: currentTenant.displayName,
            isActive: currentTenant.isActive,
            createdAt: currentTenant.createdAt
          }
        });
      }
    }
  };
}