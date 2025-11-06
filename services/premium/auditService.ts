/**
 * SISGEAD 3.0 Premium - Audit Service
 * Serviço de Auditoria Multi-Tenant para Rastreabilidade e KPIs
 * 
 * Decisões Implementadas:
 * - Retenção permanente de audit logs (compliance)
 * - Rastreamento completo de eventos de equipe
 * - Base para cálculo automático de KPIs
 * - Isolamento multi-tenant rigoroso
 */

import {
  TeamAuditLog,
  AuditEventType,
  AuditSeverity,
  AuditLogFilters,
  AuditLogSummary,
  CreateAuditLogRequest,
  AuditReport,
  KPICategory
} from '../../types/premium/auditLog';

/**
 * Serviço singleton de auditoria
 */
class AuditService {
  private readonly STORE_NAME = 'audit_logs';
  private readonly DB_NAME = 'sisgead_premium_v3';
  private db: IDBDatabase | null = null;

  /**
   * Inicializa a conexão com IndexedDB
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          
          // Índices multi-tenant CRÍTICOS
          store.createIndex('institutionId', 'institutionId', { unique: false });
          store.createIndex('organizationId', 'organizationId', { unique: false });
          store.createIndex('teamId', 'teamId', { unique: false });
          store.createIndex('eventType', 'eventType', { unique: false });
          store.createIndex('severity', 'severity', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          
          // Índices para filtros de KPI
          store.createIndex('affectsKPIs', 'affectsKPIs', { unique: false });
          store.createIndex('actorId', 'actorId', { unique: false });
          store.createIndex('targetUserId', 'targetUserId', { unique: false });
          
          // Índice composto para isolamento
          store.createIndex('institution_organization', ['institutionId', 'organizationId'], { unique: false });
        }
      };
    });
  }

  /**
   * Registra evento de auditoria
   */
  async log(
    request: CreateAuditLogRequest,
    institutionId: string,
    organizationId: string
  ): Promise<TeamAuditLog> {
    const db = await this.initDB();
    
    const auditLog: TeamAuditLog = {
      id: crypto.randomUUID(),
      institutionId,
      organizationId,
      teamId: request.teamId,
      eventType: request.eventType,
      severity: request.severity,
      timestamp: new Date(),
      actorId: request.actorId,
      targetUserId: request.targetUserId,
      targetResourceId: request.targetResourceId,
      targetResourceType: request.targetResourceType,
      details: request.details,
      metadata: request.metadata,
      affectsKPIs: request.affectsKPIs || false,
      kpiCategories: request.kpiCategories
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const addRequest = store.add(auditLog);

      addRequest.onsuccess = () => resolve(auditLog);
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  /**
   * Busca logs com filtros (MULTI-TENANT: Isolamento garantido)
   */
  async list(filters: AuditLogFilters): Promise<TeamAuditLog[]> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      
      // Usar índice composto para performance
      const index = store.index('institution_organization');
      const range = IDBKeyRange.only([filters.institutionId, filters.organizationId || '']);
      const request = filters.organizationId 
        ? index.getAll(range)
        : store.index('institutionId').getAll(IDBKeyRange.only(filters.institutionId));

      request.onsuccess = () => {
        let results = request.result as TeamAuditLog[];
        
        // Filtros adicionais
        results = results.filter(log => {
          if (filters.teamId && log.teamId !== filters.teamId) return false;
          if (filters.eventType && !filters.eventType.includes(log.eventType)) return false;
          if (filters.severity && !filters.severity.includes(log.severity)) return false;
          if (filters.actorId && log.actorId !== filters.actorId) return false;
          if (filters.targetUserId && log.targetUserId !== filters.targetUserId) return false;
          if (filters.affectsKPIs !== undefined && log.affectsKPIs !== filters.affectsKPIs) return false;
          
          if (filters.kpiCategory && log.kpiCategories) {
            const hasCategory = log.kpiCategories.some(cat => filters.kpiCategory!.includes(cat));
            if (!hasCategory) return false;
          }
          
          if (filters.dateFrom && new Date(log.timestamp) < filters.dateFrom) return false;
          if (filters.dateTo && new Date(log.timestamp) > filters.dateTo) return false;
          
          return true;
        });
        
        // Ordenar por timestamp (mais recente primeiro)
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Paginação
        if (filters.limit) {
          const offset = filters.offset || 0;
          results = results.slice(offset, offset + filters.limit);
        }
        
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Gera relatório de auditoria com KPIs calculados
   */
  async generateReport(
    institutionId: string,
    organizationId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<AuditReport> {
    const logs = await this.list({
      institutionId,
      organizationId,
      dateFrom,
      dateTo
    });

    // Contadores de eventos
    const eventsByType: Partial<Record<AuditEventType, number>> = {};
    const eventsBySeverity: Partial<Record<AuditSeverity, number>> = {};
    const actorCounts: Map<string, number> = new Map();
    const teamCounts: Map<string, number> = new Map();

    let totalMembersAdded = 0;
    let totalMembersRemoved = 0;
    let totalTransfers = 0;
    let totalResignations = 0;
    let totalContractEnds = 0;
    let totalProjectEnds = 0;

    // Processar logs
    logs.forEach(log => {
      // Contagem por tipo
      eventsByType[log.eventType] = (eventsByType[log.eventType] || 0) + 1;
      
      // Contagem por severidade
      eventsBySeverity[log.severity] = (eventsBySeverity[log.severity] || 0) + 1;
      
      // Contagem por ator
      actorCounts.set(log.actorId, (actorCounts.get(log.actorId) || 0) + 1);
      
      // Contagem por equipe
      if (log.teamId) {
        teamCounts.set(log.teamId, (teamCounts.get(log.teamId) || 0) + 1);
      }

      // KPIs específicos
      switch (log.eventType) {
        case AuditEventType.MEMBER_ADDED:
          totalMembersAdded++;
          break;
        case AuditEventType.MEMBER_REMOVED:
          totalMembersRemoved++;
          break;
        case AuditEventType.MEMBER_TRANSFERRED:
          totalTransfers++;
          break;
        case AuditEventType.MEMBER_RESIGNATION:
          totalResignations++;
          break;
        case AuditEventType.MEMBER_CONTRACT_ENDED:
          totalContractEnds++;
          break;
        case AuditEventType.MEMBER_PROJECT_ENDED:
          totalProjectEnds++;
          break;
      }
    });

    // Calcular taxas (se houver dados suficientes)
    const totalMembers = totalMembersAdded + totalMembersRemoved;
    const turnoverRate = totalMembers > 0 
      ? (totalMembersRemoved / totalMembers) * 100 
      : undefined;
    const retentionRate = turnoverRate !== undefined 
      ? 100 - turnoverRate 
      : undefined;
    const transferRate = totalMembers > 0 
      ? (totalTransfers / totalMembers) * 100 
      : undefined;

    // Top atores (ordenar por quantidade de eventos)
    const topActors = Array.from(actorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([actorId, count]) => ({
        actorId,
        actorName: actorId, // TODO: Buscar nome real do usuário
        eventCount: count
      }));

    // Top equipes
    const topTeams = Array.from(teamCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([teamId, count]) => ({
        teamId,
        teamName: teamId, // TODO: Buscar nome real da equipe
        eventCount: count
      }));

    // Timeline (agrupar por dia)
    const eventsOverTime = this.groupEventsByDay(logs, dateFrom, dateTo);

    return {
      dateFrom,
      dateTo,
      totalEvents: logs.length,
      eventsByType: eventsByType as Record<AuditEventType, number>,
      eventsBySeverity: eventsBySeverity as Record<AuditSeverity, number>,
      totalMembersAdded,
      totalMembersRemoved,
      totalTransfers,
      totalResignations,
      totalContractEnds,
      totalProjectEnds,
      turnoverRate,
      retentionRate,
      transferRate,
      topActors,
      topTeams,
      eventsOverTime
    };
  }

  /**
   * Agrupa eventos por dia para timeline
   */
  private groupEventsByDay(
    logs: TeamAuditLog[], 
    dateFrom: Date, 
    dateTo: Date
  ): Array<{ date: Date; count: number }> {
    const dayMap = new Map<string, number>();
    
    // Inicializar todos os dias com 0
    const currentDate = new Date(dateFrom);
    while (currentDate <= dateTo) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dayMap.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Contar eventos por dia
    logs.forEach(log => {
      const dateKey = new Date(log.timestamp).toISOString().split('T')[0];
      if (dayMap.has(dateKey)) {
        dayMap.set(dateKey, dayMap.get(dateKey)! + 1);
      }
    });

    // Converter para array
    return Array.from(dayMap.entries())
      .map(([dateStr, count]) => ({
        date: new Date(dateStr),
        count
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Conta eventos que afetam KPIs em um período
   */
  async countKPIEvents(
    institutionId: string,
    organizationId: string,
    category: KPICategory,
    dateFrom: Date,
    dateTo: Date
  ): Promise<number> {
    const logs = await this.list({
      institutionId,
      organizationId,
      affectsKPIs: true,
      kpiCategory: [category],
      dateFrom,
      dateTo
    });

    return logs.length;
  }

  /**
   * Busca último evento de um tipo específico para um usuário
   */
  async getLastUserEvent(
    userId: string,
    eventType: AuditEventType,
    institutionId: string
  ): Promise<TeamAuditLog | null> {
    const logs = await this.list({
      institutionId,
      targetUserId: userId,
      eventType: [eventType],
      limit: 1
    });

    return logs.length > 0 ? logs[0] : null;
  }
}

export const auditService = new AuditService();
