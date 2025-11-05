// 🔒 SISGEAD 2.0 - Tenant Storage Isolation System
// Sistema de isolamento completo de dados por tenant

import type { Tenant } from '../types/institutional';
import { tenantManager } from '../services/tenantManager';

export class TenantStorage {
  private static instance: TenantStorage;
  private storagePrefix = 'sisgead_';
  private tenantSeparator = '__tenant__';
  
  // 🔐 Singleton for consistent storage isolation
  public static getInstance(): TenantStorage {
    if (!TenantStorage.instance) {
      TenantStorage.instance = new TenantStorage();
    }
    return TenantStorage.instance;
  }

  private constructor() {
    this.setupStorageListener();
  }

  // 🏢 Core Storage Methods with Tenant Isolation

  /**
   * Store data with tenant isolation
   * @param key - Storage key (will be prefixed with tenant ID)
   * @param data - Data to store
   * @param global - If true, stores without tenant prefix (use carefully!)
   */
  public setItem<T>(key: string, data: T, global: boolean = false): boolean {
    try {
      const storageKey = global ? this.getGlobalKey(key) : this.getTenantKey(key);
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
        tenantId: global ? null : this.getCurrentTenantId(),
        version: '2.0'
      });
      
      localStorage.setItem(storageKey, serializedData);
      return true;
    } catch (error) {
      console.error('TenantStorage.setItem error:', error);
      return false;
    }
  }

  /**
   * Retrieve data with tenant isolation
   * @param key - Storage key
   * @param global - If true, looks for global data (not tenant-specific)
   * @param defaultValue - Default value if not found
   */
  public getItem<T>(key: string, global: boolean = false, defaultValue: T | null = null): T | null {
    try {
      const storageKey = global ? this.getGlobalKey(key) : this.getTenantKey(key);
      const storedData = localStorage.getItem(storageKey);
      
      if (!storedData) {
        return defaultValue;
      }

      const parsedData = JSON.parse(storedData);
      
      // Validate data structure
      if (!this.isValidStorageData(parsedData)) {
        console.warn(`Invalid storage data structure for key: ${key}`);
        this.removeItem(key, global);
        return defaultValue;
      }

      // Validate tenant ownership (for tenant-specific data)
      if (!global && parsedData.tenantId !== this.getCurrentTenantId()) {
        console.warn(`Tenant mismatch for key: ${key}`);
        return defaultValue;
      }

      return parsedData.data;
    } catch (error) {
      console.error('TenantStorage.getItem error:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item with tenant isolation
   */
  public removeItem(key: string, global: boolean = false): boolean {
    try {
      const storageKey = global ? this.getGlobalKey(key) : this.getTenantKey(key);
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('TenantStorage.removeItem error:', error);
      return false;
    }
  }

  /**
   * Check if item exists with tenant isolation
   */
  public hasItem(key: string, global: boolean = false): boolean {
    const storageKey = global ? this.getGlobalKey(key) : this.getTenantKey(key);
    return localStorage.getItem(storageKey) !== null;
  }

  // 📊 Assessment Data Isolation

  /**
   * Store assessment data with tenant isolation
   */
  public storeAssessment(assessmentId: string, assessmentData: any): boolean {
    return this.setItem(`assessment_${assessmentId}`, {
      ...assessmentData,
      tenantId: this.getCurrentTenantId(),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Retrieve assessment data (tenant-isolated)
   */
  public getAssessment(assessmentId: string): any | null {
    return this.getItem(`assessment_${assessmentId}`);
  }

  /**
   * Get all assessments for current tenant
   */
  public getAllAssessments(): any[] {
    const currentTenantId = this.getCurrentTenantId();
    const assessments: any[] = [];
    
    // Scan localStorage for tenant assessments
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`${currentTenantId}${this.tenantSeparator}assessment_`)) {
        try {
          const assessment = this.getAssessmentFromKey(key);
          if (assessment) {
            assessments.push(assessment);
          }
        } catch (error) {
          console.warn(`Error loading assessment from key ${key}:`, error);
        }
      }
    }
    
    return assessments.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - 
      new Date(a.updatedAt || a.createdAt).getTime()
    );
  }

  /**
   * Delete assessment with tenant validation
   */
  public deleteAssessment(assessmentId: string): boolean {
    const assessment = this.getAssessment(assessmentId);
    if (!assessment) {
      return false;
    }

    return this.removeItem(`assessment_${assessmentId}`);
  }

  // 👤 User Data Isolation

  /**
   * Store user data with tenant context
   */
  public storeUserData(userData: any): boolean {
    return this.setItem('user_data', {
      ...userData,
      tenantId: this.getCurrentTenantId(),
      lastLogin: new Date().toISOString()
    });
  }

  /**
   * Get user data for current tenant
   */
  public getUserData(): any | null {
    return this.getItem('user_data');
  }

  /**
   * Store user preferences (tenant-specific)
   */
  public storeUserPreferences(preferences: any): boolean {
    return this.setItem('user_preferences', preferences);
  }

  /**
   * Get user preferences for current tenant
   */
  public getUserPreferences(): any | null {
    return this.getItem('user_preferences', false, {});
  }

  // 🎨 UI State & Cache Management

  /**
   * Store UI state with tenant isolation
   */
  public storeUIState(component: string, state: any): boolean {
    return this.setItem(`ui_${component}`, state);
  }

  /**
   * Get UI state for current tenant
   */
  public getUIState(component: string): any | null {
    return this.getItem(`ui_${component}`);
  }

  /**
   * Store cache data with TTL
   */
  public setCache<T>(key: string, data: T, ttlMinutes: number = 60): boolean {
    const cacheData = {
      data,
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000),
      tenantId: this.getCurrentTenantId()
    };
    
    return this.setItem(`cache_${key}`, cacheData);
  }

  /**
   * Get cache data (with expiration check)
   */
  public getCache<T>(key: string): T | null {
    const cacheData = this.getItem(`cache_${key}`) as any;
    
    if (!cacheData || !cacheData.expiresAt) {
      return null;
    }

    if (Date.now() > cacheData.expiresAt) {
      this.removeItem(`cache_${key}`);
      return null;
    }

    return cacheData.data;
  }

  // 🔄 Tenant Migration & Management

  /**
   * Migrate data to new tenant structure (for existing installations)
   */
  public migrateLegacyData(): { success: boolean; migratedItems: number; errors: string[] } {
    const result = {
      success: true,
      migratedItems: 0,
      errors: [] as string[]
    };

    try {
      const legacyKeys = this.findLegacyKeys();
      
      for (const key of legacyKeys) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            // Parse and migrate to tenant-specific key
            const parsedData = JSON.parse(data);
            const newKey = this.getLegacyMigrationKey(key);
            
            if (newKey) {
              this.setItem(newKey, parsedData);
              localStorage.removeItem(key); // Remove old key
              result.migratedItems++;
            }
          }
        } catch (error) {
          result.errors.push(`Error migrating key ${key}: ${error}`);
        }
      }

      if (result.errors.length > 0) {
        result.success = false;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Migration failed: ${error}`);
    }

    return result;
  }

  /**
   * Export all tenant data
   */
  public exportTenantData(tenantId?: string): { 
    tenantId: string; 
    data: Record<string, any>; 
    exportedAt: string;
    version: string;
  } {
    const targetTenantId = tenantId || this.getCurrentTenantId();
    const tenantData: Record<string, any> = {};

    // Scan for all keys belonging to this tenant
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`${targetTenantId}${this.tenantSeparator}`)) {
        try {
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const parsedData = JSON.parse(rawData);
            const cleanKey = key.split(this.tenantSeparator)[1]; // Remove tenant prefix
            tenantData[cleanKey] = parsedData.data;
          }
        } catch (error) {
          console.warn(`Error exporting key ${key}:`, error);
        }
      }
    }

    return {
      tenantId: targetTenantId,
      data: tenantData,
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };
  }

  /**
   * Import tenant data
   */
  public importTenantData(exportedData: {
    tenantId: string;
    data: Record<string, any>;
    version?: string;
  }): { success: boolean; importedItems: number; errors: string[] } {
    const result = {
      success: true,
      importedItems: 0,
      errors: [] as string[]
    };

    try {
      // Validate export format
      if (!exportedData.data || typeof exportedData.data !== 'object') {
        throw new Error('Invalid export data format');
      }

      // Import each item
      for (const [key, data] of Object.entries(exportedData.data)) {
        try {
          this.setItem(key, data);
          result.importedItems++;
        } catch (error) {
          result.errors.push(`Error importing key ${key}: ${error}`);
        }
      }

      if (result.errors.length > 0) {
        result.success = false;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Import failed: ${error}`);
    }

    return result;
  }

  // 🧹 Cleanup & Maintenance

  /**
   * Clear all data for current tenant
   */
  public clearTenantData(): boolean {
    try {
      const currentTenantId = this.getCurrentTenantId();
      const keysToRemove: string[] = [];

      // Find all keys for current tenant
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`${currentTenantId}${this.tenantSeparator}`)) {
          keysToRemove.push(key);
        }
      }

      // Remove all tenant-specific keys
      keysToRemove.forEach(key => localStorage.removeItem(key));

      return true;
    } catch (error) {
      console.error('Error clearing tenant data:', error);
      return false;
    }
  }

  /**
   * Cleanup expired cache entries
   */
  public cleanupExpiredCache(): number {
    let cleanedCount = 0;
    const currentTenantId = this.getCurrentTenantId();

    try {
      const keysToCheck: string[] = [];

      // Find cache keys for current tenant
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`${currentTenantId}${this.tenantSeparator}cache_`)) {
          keysToCheck.push(key);
        }
      }

      // Check and remove expired items
      for (const key of keysToCheck) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            if (parsedData.data?.expiresAt && Date.now() > parsedData.data.expiresAt) {
              localStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          // If we can't parse it, remove it
          localStorage.removeItem(key);
          cleanedCount++;
        }
      }
    } catch (error) {
      console.warn('Error during cache cleanup:', error);
    }

    return cleanedCount;
  }

  // 🔧 Private Helper Methods

  private getCurrentTenantId(): string {
    return tenantManager.getCurrentTenant()?.id || 'default';
  }

  private getTenantKey(key: string): string {
    const tenantId = this.getCurrentTenantId();
    return `${this.storagePrefix}${tenantId}${this.tenantSeparator}${key}`;
  }

  private getGlobalKey(key: string): string {
    return `${this.storagePrefix}global__${key}`;
  }

  private isValidStorageData(data: any): boolean {
    return data && 
           typeof data === 'object' && 
           'data' in data && 
           'timestamp' in data &&
           'version' in data;
  }

  private getAssessmentFromKey(key: string): any | null {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.data;
      }
    } catch (error) {
      console.warn(`Error parsing assessment from key ${key}:`, error);
    }
    return null;
  }

  private findLegacyKeys(): string[] {
    const legacyKeys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && 
          key.startsWith(this.storagePrefix) && 
          !key.includes(this.tenantSeparator) && 
          !key.includes('global__')) {
        legacyKeys.push(key);
      }
    }
    
    return legacyKeys;
  }

  private getLegacyMigrationKey(legacyKey: string): string | null {
    // Remove prefix and create new key structure
    const baseKey = legacyKey.replace(this.storagePrefix, '');
    
    // Skip certain keys that shouldn't be migrated
    if (baseKey.startsWith('tenant_') || baseKey === 'current') {
      return null;
    }
    
    return baseKey;
  }

  private setupStorageListener(): void {
    // Listen for storage events to maintain consistency
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith(this.storagePrefix)) {
        // Handle storage changes from other tabs
        this.handleStorageChange(event);
      }
    });

    // Listen for tenant changes
    window.addEventListener('tenantChanged', () => {
      // Clear any UI state cache when tenant changes
      this.clearUICache();
    });
  }

  private handleStorageChange(event: StorageEvent): void {
    // This could be enhanced to sync changes across tabs
    console.debug('Storage change detected:', event.key);
  }

  private clearUICache(): void {
    const currentTenantId = this.getCurrentTenantId();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`${currentTenantId}${this.tenantSeparator}ui_`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // 📊 Statistics & Health Check

  public getStorageStatistics() {
    const currentTenantId = this.getCurrentTenantId();
    let tenantKeys = 0;
    let globalKeys = 0;
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storagePrefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
          
          if (key.includes('global__')) {
            globalKeys++;
          } else if (key.includes(`${currentTenantId}${this.tenantSeparator}`)) {
            tenantKeys++;
          }
        }
      }
    }

    return {
      currentTenantId,
      tenantKeys,
      globalKeys,
      totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
    };
  }

  public healthCheck(): { status: 'healthy' | 'warning' | 'error'; issues: string[] } {
    const issues: string[] = [];
    const stats = this.getStorageStatistics();

    // Check storage usage
    if (stats.totalSizeKB > 5000) { // 5MB warning
      issues.push('Alto uso de armazenamento (> 5MB)');
    }

    // Check if current tenant exists
    if (!this.getCurrentTenantId()) {
      issues.push('Nenhum tenant ativo');
    }

    const status = issues.length === 0 ? 'healthy' : 
                   issues.length <= 1 ? 'warning' : 'error';

    return { status, issues };
  }
}

// 🎯 Export singleton instance
export const tenantStorage = TenantStorage.getInstance();