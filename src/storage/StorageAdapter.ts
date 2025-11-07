/**
 * SISGEAD 3.0 - Storage Adapter Interface
 * Abstração unificada para diferentes backends de armazenamento
 * 
 * Implementações:
 * - LocalStorageAdapter: IndexedDB (navegador - v2.0 atual)
 * - SQLiteAdapter: SQLite (Electron - instalação local)
 * - APIAdapter: REST API (DigitalOcean - modo web)
 */

export interface StorageFilter {
  key?: string;
  pattern?: string;
  field?: string;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in';
  value?: any;
}

export interface StorageQuery {
  collection: string;
  filters?: StorageFilter[];
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

export interface StorageOperation {
  type: 'save' | 'delete' | 'update';
  key: string;
  data?: any;
}

export interface StorageMetadata {
  createdAt: number;
  updatedAt: number;
  version?: string;
  tags?: string[];
}

export interface StorageItem<T = any> {
  key: string;
  data: T;
  metadata: StorageMetadata;
}

/**
 * Interface principal do Storage Adapter
 * Todos os métodos retornam Promises para suportar operações assíncronas
 */
export interface StorageAdapter {
  /**
   * Identificador do adapter (para debug/logs)
   */
  readonly name: string;
  
  /**
   * Tipo do storage (local, sqlite, api)
   */
  readonly type: 'local' | 'sqlite' | 'api';
  
  /**
   * Salvar dados
   * @param key Chave única
   * @param data Dados a serem salvos (serializável)
   * @returns Promise<void>
   */
  save<T = any>(key: string, data: T): Promise<void>;
  
  /**
   * Recuperar dados
   * @param key Chave única
   * @returns Promise com os dados ou null se não existir
   */
  get<T = any>(key: string): Promise<T | null>;
  
  /**
   * Deletar dados
   * @param key Chave única
   * @returns Promise<void>
   */
  delete(key: string): Promise<void>;
  
  /**
   * Listar chaves
   * @param pattern Padrão de busca (opcional, ex: "documents-*")
   * @returns Promise com array de chaves
   */
  list(pattern?: string): Promise<string[]>;
  
  /**
   * Verificar se chave existe
   * @param key Chave única
   * @returns Promise<boolean>
   */
  exists(key: string): Promise<boolean>;
  
  /**
   * Limpar todos os dados (use com cuidado!)
   * @returns Promise<void>
   */
  clear(): Promise<void>;
  
  /**
   * Query avançada (suportado apenas em alguns adapters)
   * @param query Objeto de query
   * @returns Promise com array de resultados
   */
  query<T = any>(query: StorageQuery): Promise<T[]>;
  
  /**
   * Transação (múltiplas operações atômicas)
   * @param operations Array de operações
   * @returns Promise<void>
   */
  transaction(operations: StorageOperation[]): Promise<void>;
  
  /**
   * Obter metadata de um item
   * @param key Chave única
   * @returns Promise com metadata ou null
   */
  getMetadata(key: string): Promise<StorageMetadata | null>;
  
  /**
   * Estatísticas do storage
   * @returns Promise com estatísticas
   */
  getStats(): Promise<{
    totalKeys: number;
    totalSize: number;
    collections: string[];
  }>;
}

/**
 * Erro customizado para operações de storage
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Tipo helper para garantir type safety
 */
export type StorageKey<T> = string & { __type?: T };

/**
 * Helper para criar chaves tipadas
 */
export function createStorageKey<T>(key: string): StorageKey<T> {
  return key as StorageKey<T>;
}
