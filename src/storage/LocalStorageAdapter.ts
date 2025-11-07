/**
 * SISGEAD 3.0 - Local Storage Adapter
 * Implementação usando IndexedDB (mesma tecnologia do v2.0)
 * Mantém compatibilidade com dados existentes
 */

import {
  StorageAdapter,
  StorageQuery,
  StorageOperation,
  StorageMetadata,
  StorageError
} from './StorageAdapter';

const DB_NAME = 'SISGEAD_3.0';
const DB_VERSION = 1;
const STORE_NAME = 'storage';

interface IndexedDBItem {
  key: string;
  data: any;
  metadata: StorageMetadata;
}

export class LocalStorageAdapter implements StorageAdapter {
  readonly name = 'LocalStorageAdapter';
  readonly type = 'local' as const;
  
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void>;
  
  constructor() {
    this.initPromise = this.initialize();
  }
  
  /**
   * Inicializa o IndexedDB
   */
  private async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        reject(new StorageError(
          'Falha ao abrir IndexedDB',
          'INIT_ERROR',
          request.error || undefined
        ));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Criar object store se não existir
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          
          // Índices para queries
          store.createIndex('metadata.createdAt', 'metadata.createdAt', { unique: false });
          store.createIndex('metadata.updatedAt', 'metadata.updatedAt', { unique: false });
        }
      };
    });
  }
  
  /**
   * Garante que o DB está inicializado
   */
  private async ensureInitialized(): Promise<IDBDatabase> {
    await this.initPromise;
    if (!this.db) {
      throw new StorageError('Database não inicializado', 'DB_NOT_READY');
    }
    return this.db;
  }
  
  /**
   * Helper para executar transação
   */
  private async executeTransaction<T>(
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], mode);
      const store = transaction.objectStore(STORE_NAME);
      const request = callback(store);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new StorageError(
        'Erro na transação',
        'TRANSACTION_ERROR',
        request.error || undefined
      ));
    });
  }
  
  async save<T = any>(key: string, data: T): Promise<void> {
    const item: IndexedDBItem = {
      key,
      data,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '3.0'
      }
    };
    
    await this.executeTransaction('readwrite', (store) => {
      // Verificar se já existe para preservar createdAt
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result as IndexedDBItem | undefined;
        if (existing) {
          item.metadata.createdAt = existing.metadata.createdAt;
        }
        store.put(item);
      };
      
      return getRequest;
    });
  }
  
  async get<T = any>(key: string): Promise<T | null> {
    const result = await this.executeTransaction('readonly', (store) =>
      store.get(key)
    );
    
    return result ? (result as IndexedDBItem).data : null;
  }
  
  async delete(key: string): Promise<void> {
    await this.executeTransaction('readwrite', (store) =>
      store.delete(key)
    );
  }
  
  async list(pattern?: string): Promise<string[]> {
    const db = await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();
      
      request.onsuccess = () => {
        let keys = request.result as string[];
        
        // Filtrar por padrão se fornecido
        if (pattern) {
          const regex = new RegExp(
            '^' + pattern.replace('*', '.*').replace('?', '.') + '$'
          );
          keys = keys.filter(key => regex.test(key));
        }
        
        resolve(keys);
      };
      
      request.onerror = () => reject(new StorageError(
        'Erro ao listar chaves',
        'LIST_ERROR',
        request.error || undefined
      ));
    });
  }
  
  async exists(key: string): Promise<boolean> {
    const result = await this.executeTransaction('readonly', (store) =>
      store.getKey(key)
    );
    return result !== undefined;
  }
  
  async clear(): Promise<void> {
    await this.executeTransaction('readwrite', (store) =>
      store.clear()
    );
  }
  
  async query<T = any>(query: StorageQuery): Promise<T[]> {
    // Query simplificada para IndexedDB
    // Pega todos e filtra em memória (para queries complexas)
    const db = await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        let results = request.result as IndexedDBItem[];
        
        // Aplicar filtros
        if (query.filters) {
          results = results.filter(item => {
            return query.filters!.every(filter => {
              const value = this.getNestedValue(item.data, filter.field || '');
              return this.matchFilter(value, filter.operator || 'eq', filter.value);
            });
          });
        }
        
        // Ordenar
        if (query.sort) {
          results.sort((a, b) => {
            const aVal = this.getNestedValue(a.data, query.sort!.field);
            const bVal = this.getNestedValue(b.data, query.sort!.field);
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return query.sort!.direction === 'desc' ? -comparison : comparison;
          });
        }
        
        // Paginação
        if (query.offset) results = results.slice(query.offset);
        if (query.limit) results = results.slice(0, query.limit);
        
        resolve(results.map(item => item.data));
      };
      
      request.onerror = () => reject(new StorageError(
        'Erro na query',
        'QUERY_ERROR',
        request.error || undefined
      ));
    });
  }
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  private matchFilter(value: any, operator: string, filterValue: any): boolean {
    switch (operator) {
      case 'eq': return value === filterValue;
      case 'ne': return value !== filterValue;
      case 'gt': return value > filterValue;
      case 'lt': return value < filterValue;
      case 'gte': return value >= filterValue;
      case 'lte': return value <= filterValue;
      case 'like': return String(value).includes(String(filterValue));
      case 'in': return Array.isArray(filterValue) && filterValue.includes(value);
      default: return false;
    }
  }
  
  async transaction(operations: StorageOperation[]): Promise<void> {
    const db = await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const txn = db.transaction([STORE_NAME], 'readwrite');
      const store = txn.objectStore(STORE_NAME);
      
      txn.oncomplete = () => resolve();
      txn.onerror = () => reject(new StorageError(
        'Erro na transação',
        'TRANSACTION_ERROR',
        txn.error || undefined
      ));
      
      operations.forEach(op => {
        switch (op.type) {
          case 'save':
            store.put({
              key: op.key,
              data: op.data,
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                version: '3.0'
              }
            });
            break;
          case 'delete':
            store.delete(op.key);
            break;
          case 'update':
            const getRequest = store.get(op.key);
            getRequest.onsuccess = () => {
              const existing = getRequest.result as IndexedDBItem;
              if (existing) {
                store.put({
                  ...existing,
                  data: { ...existing.data, ...op.data },
                  metadata: {
                    ...existing.metadata,
                    updatedAt: Date.now()
                  }
                });
              }
            };
            break;
        }
      });
    });
  }
  
  async getMetadata(key: string): Promise<StorageMetadata | null> {
    const result = await this.executeTransaction('readonly', (store) =>
      store.get(key)
    );
    
    return result ? (result as IndexedDBItem).metadata : null;
  }
  
  async getStats(): Promise<{ totalKeys: number; totalSize: number; collections: string[] }> {
    const keys = await this.list();
    
    // Estimar tamanho (aproximado)
    const db = await this.ensureInitialized();
    let totalSize = 0;
    
    const items = await new Promise<IndexedDBItem[]>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    items.forEach(item => {
      totalSize += JSON.stringify(item).length;
    });
    
    // Coleções = prefixos únicos das chaves
    const collections = Array.from(
      new Set(keys.map(key => key.split('-')[0] || key))
    );
    
    return {
      totalKeys: keys.length,
      totalSize,
      collections
    };
  }
}
