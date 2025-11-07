/**
 * SISGEAD 3.0 - Storage Factory
 * Detecta automaticamente o ambiente e retorna o adapter apropriado
 * 
 * Modos suportados:
 * - LOCAL: IndexedDB (navegador)
 * - SQLITE: SQLite (Electron)
 * - API: REST API (DigitalOcean)
 */

import { StorageAdapter } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';

// Tipos para TypeScript
declare global {
  interface Window {
    electron?: {
      isElectron: boolean;
      storage?: any;
    };
  }
}

export type StorageMode = 'local' | 'sqlite' | 'api';

export interface StorageFactoryConfig {
  mode?: StorageMode;
  apiURL?: string;
  apiToken?: string;
}

export class StorageFactory {
  private static instance: StorageAdapter | null = null;
  private static config: StorageFactoryConfig = {};
  
  /**
   * Detecta automaticamente o modo de execução
   */
  static detectMode(): StorageMode {
    // 1. Se está rodando em Electron
    if (typeof window !== 'undefined' && window.electron?.isElectron) {
      return 'sqlite';
    }
    
    // 2. Se tem variável de ambiente configurada
    if (import.meta.env.VITE_STORAGE_MODE) {
      return import.meta.env.VITE_STORAGE_MODE;
    }
    
    // 3. Se está em domínio conhecido (produção web)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('sisgead.com') || hostname.includes('digitalocean')) {
        return 'api';
      }
    }
    
    // 4. Padrão: local (IndexedDB)
    return 'local';
  }
  
  /**
   * Configura o factory (opcional)
   */
  static configure(config: StorageFactoryConfig): void {
    this.config = { ...this.config, ...config };
    // Resetar instância para forçar recriação
    this.instance = null;
  }
  
  /**
   * Cria ou retorna o storage adapter (Singleton)
   */
  static create(): StorageAdapter {
    if (this.instance) {
      return this.instance;
    }
    
    const mode = this.config.mode || this.detectMode();
    
    console.log(`🗄️ [StorageFactory] Modo detectado: ${mode}`);
    
    switch (mode) {
      case 'local':
        this.instance = new LocalStorageAdapter();
        break;
        
      case 'sqlite':
        // TODO: Implementar SQLiteAdapter (Sprint 4)
        console.warn('⚠️ SQLiteAdapter ainda não implementado, usando Local');
        this.instance = new LocalStorageAdapter();
        break;
        
      case 'api':
        // TODO: Implementar APIAdapter (Sprint 2)
        console.warn('⚠️ APIAdapter ainda não implementado, usando Local');
        this.instance = new LocalStorageAdapter();
        break;
        
      default:
        console.warn(`⚠️ Modo desconhecido: ${mode}, usando Local`);
        this.instance = new LocalStorageAdapter();
    }
    
    return this.instance;
  }
  
  /**
   * Reseta o factory (útil para testes)
   */
  static reset(): void {
    this.instance = null;
    this.config = {};
  }
  
  /**
   * Obtém a configuração atual
   */
  static getConfig(): StorageFactoryConfig {
    return { ...this.config };
  }
}

/**
 * Hook para React (criar depois)
 */
export function useStorage(): StorageAdapter {
  return StorageFactory.create();
}

/**
 * Export da instância padrão para uso direto
 */
export const storage = StorageFactory.create();
