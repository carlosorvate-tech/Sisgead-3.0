/**
 * SISGEAD 3.0 Premium - Assessment Service
 * Serviço de Avaliações Multi-Tenant com Aprovação Opcional
 * 
 * Decisões Implementadas:
 * - Isolamento por institutionId + organizationId
 * - Aprovação opcional por gestor imediato (managerId)
 * - Soft delete com retenção de 1 ano
 * - Reavaliação permitida por padrão
 */

import { 
  Assessment, 
  AssessmentStatus, 
  AssessmentType,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  ApprovalRequest,
  AssessmentFilters,
  AssessmentSummary,
  ASSESSMENT_RETENTION_DAYS,
  DEFAULT_ASSESSMENT_SETTINGS
} from '../../types/premium/assessment';
import { auditService } from './auditService';
import { AuditEventType, AuditSeverity } from '../../types/premium/auditLog';

/**
 * Serviço singleton de gerenciamento de avaliações
 */
class AssessmentService {
  private readonly STORE_NAME = 'assessments';
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
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          
          // Índice composto para isolamento total
          store.createIndex('institution_organization', ['institutionId', 'organizationId'], { unique: false });
          store.createIndex('organization_user', ['organizationId', 'userId'], { unique: false });
          
          // Índices para aprovação
          store.createIndex('approverId', 'settings.approverId', { unique: false });
          store.createIndex('requireApproval', 'settings.requireApproval', { unique: false });
          
          // Índice para soft delete
          store.createIndex('deletedAt', 'deletedAt', { unique: false });
        }
      };
    });
  }

  /**
   * Cria nova avaliação (DECISÃO: Aprovação opcional)
   */
  async create(
    request: CreateAssessmentRequest,
    institutionId: string,
    createdBy: string
  ): Promise<Assessment> {
    const db = await this.initDB();
    
    const assessment: Assessment = {
      id: crypto.randomUUID(),
      institutionId,
      organizationId: request.organizationId,
      userId: request.userId,
      type: request.type,
      status: AssessmentStatus.DRAFT,
      settings: { ...DEFAULT_ASSESSMENT_SETTINGS, ...request.settings },
      title: request.title,
      description: request.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      lastModifiedBy: createdBy
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const addRequest = store.add(assessment);

      addRequest.onsuccess = async () => {
        // Registrar auditoria
        await auditService.log({
          eventType: AuditEventType.ASSESSMENT_CREATED,
          severity: AuditSeverity.INFO,
          actorId: createdBy,
          targetUserId: request.userId,
          targetResourceId: assessment.id,
          targetResourceType: 'assessment',
          details: {
            description: `Assessment created: ${request.title}`,
            action: 'created',
            after: {
              type: request.type,
              requireApproval: request.settings.requireApproval
            }
          },
          affectsKPIs: true
        }, institutionId, request.organizationId);
        
        resolve(assessment);
      };
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  /**
   * Busca avaliação por ID (MULTI-TENANT: Valida institutionId)
   */
  async getById(
    id: string, 
    institutionId: string,
    organizationId?: string
  ): Promise<Assessment | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const assessment = getRequest.result as Assessment | undefined;
        
        // VALIDAÇÃO MULTI-TENANT CRÍTICA
        if (!assessment) {
          resolve(null);
          return;
        }
        
        if (assessment.institutionId !== institutionId) {
          console.warn(`🔒 Multi-tenant violation: Assessment ${id} não pertence à instituição ${institutionId}`);
          resolve(null);
          return;
        }
        
        if (organizationId && assessment.organizationId !== organizationId) {
          console.warn(`🔒 Multi-tenant violation: Assessment ${id} não pertence à organização ${organizationId}`);
          resolve(null);
          return;
        }
        
        // Excluir arquivados por padrão
        if (assessment.deletedAt) {
          resolve(null);
          return;
        }
        
        resolve(assessment);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Lista avaliações com filtros (MULTI-TENANT: Isolamento garantido)
   */
  async list(filters: AssessmentFilters): Promise<Assessment[]> {
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
        let results = request.result as Assessment[];
        
        // Filtros adicionais
        results = results.filter(assessment => {
          // Soft delete (DECISÃO: Excluir arquivados por padrão)
          if (!filters.includeArchived && assessment.deletedAt) {
            return false;
          }
          
          // Filtros específicos
          if (filters.userId && assessment.userId !== filters.userId) {
            return false;
          }
          
          if (filters.type && assessment.type !== filters.type) {
            return false;
          }
          
          if (filters.status && !filters.status.includes(assessment.status)) {
            return false;
          }
          
          if (filters.requiresApproval !== undefined) {
            const requiresApproval = assessment.settings.requireApproval &&
              assessment.status === AssessmentStatus.PENDING_APPROVAL;
            if (requiresApproval !== filters.requiresApproval) {
              return false;
            }
          }
          
          if (filters.dateFrom && new Date(assessment.createdAt) < filters.dateFrom) {
            return false;
          }
          
          if (filters.dateTo && new Date(assessment.createdAt) > filters.dateTo) {
            return false;
          }
          
          return true;
        });
        
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Atualiza avaliação (DECISÃO: Suporta fluxo de aprovação opcional)
   */
  async update(
    id: string,
    updates: UpdateAssessmentRequest,
    institutionId: string,
    organizationId: string,
    updatedBy: string
  ): Promise<Assessment> {
    const existing = await this.getById(id, institutionId, organizationId);
    if (!existing) {
      throw new Error(`Assessment ${id} não encontrado`);
    }

    const db = await this.initDB();
    
    const updated: Assessment = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
      version: existing.version + 1,
      lastModifiedBy: updatedBy
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const putRequest = store.put(updated);

      putRequest.onsuccess = async () => {
        // Registrar auditoria de mudanças
        const eventType = updates.status === AssessmentStatus.COMPLETED
          ? AuditEventType.ASSESSMENT_COMPLETED
          : AuditEventType.ASSESSMENT_STARTED;
        
        await auditService.log({
          eventType,
          severity: AuditSeverity.INFO,
          actorId: updatedBy,
          targetUserId: existing.userId,
          targetResourceId: id,
          targetResourceType: 'assessment',
          details: {
            description: `Assessment ${updates.status || 'updated'}`,
            action: 'updated',
            before: { status: existing.status },
            after: { status: updates.status }
          },
          affectsKPIs: updates.status === AssessmentStatus.COMPLETED
        }, institutionId, organizationId);
        
        resolve(updated);
      };
      putRequest.onerror = () => reject(putRequest.error);
    });
  }

  /**
   * Aprovar ou Rejeitar avaliação (DECISÃO: Gestor imediato)
   */
  async approve(request: ApprovalRequest, institutionId: string): Promise<Assessment> {
    const assessment = await this.getById(request.assessmentId, institutionId);
    if (!assessment) {
      throw new Error(`Assessment ${request.assessmentId} não encontrado`);
    }

    // Validar que approverId é o gestor imediato
    if (assessment.settings.approverId !== request.approverId) {
      throw new Error('Apenas o gestor imediato pode aprovar esta avaliação');
    }

    const db = await this.initDB();
    
    const updated: Assessment = {
      ...assessment,
      status: request.approved ? AssessmentStatus.APPROVED : AssessmentStatus.REJECTED,
      approvedBy: request.approverId,
      approvedAt: request.approved ? new Date() : undefined,
      rejectedAt: !request.approved ? new Date() : undefined,
      approvalNotes: request.notes,
      updatedAt: new Date(),
      version: assessment.version + 1,
      lastModifiedBy: request.approverId
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const putRequest = store.put(updated);

      putRequest.onsuccess = async () => {
        // Registrar auditoria
        await auditService.log({
          eventType: request.approved 
            ? AuditEventType.ASSESSMENT_APPROVED 
            : AuditEventType.ASSESSMENT_REJECTED,
          severity: AuditSeverity.INFO,
          actorId: request.approverId,
          targetUserId: assessment.userId,
          targetResourceId: request.assessmentId,
          targetResourceType: 'assessment',
          details: {
            description: `Assessment ${request.approved ? 'approved' : 'rejected'} by manager`,
            action: request.approved ? 'approved' : 'rejected',
            approvalDetails: {
              approverId: request.approverId,
              approved: request.approved,
              notes: request.notes
            }
          },
          affectsKPIs: true
        }, institutionId, assessment.organizationId);
        
        resolve(updated);
      };
      putRequest.onerror = () => reject(putRequest.error);
    });
  }

  /**
   * Arquiva avaliação (DECISÃO: Soft delete com 1 ano retenção)
   */
  async archive(
    id: string,
    institutionId: string,
    organizationId: string,
    deletedBy: string,
    reason?: string
  ): Promise<Assessment> {
    const existing = await this.getById(id, institutionId, organizationId);
    if (!existing) {
      throw new Error(`Assessment ${id} não encontrado`);
    }

    const db = await this.initDB();
    
    const deletedAt = new Date();
    const expiresAt = new Date(deletedAt);
    expiresAt.setDate(expiresAt.getDate() + ASSESSMENT_RETENTION_DAYS); // +1 ano

    const archived: Assessment = {
      ...existing,
      status: AssessmentStatus.ARCHIVED,
      deletedAt,
      expiresAt,
      deletedBy,
      deletionReason: reason,
      updatedAt: new Date(),
      version: existing.version + 1,
      lastModifiedBy: deletedBy
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const putRequest = store.put(archived);

      putRequest.onsuccess = async () => {
        await auditService.log({
          eventType: AuditEventType.ASSESSMENT_ARCHIVED,
          severity: AuditSeverity.WARNING,
          actorId: deletedBy,
          targetUserId: existing.userId,
          targetResourceId: id,
          targetResourceType: 'assessment',
          details: {
            description: `Assessment archived: ${reason || 'No reason provided'}`,
            action: 'archived',
            reason,
            before: { status: existing.status },
            after: { status: AssessmentStatus.ARCHIVED, expiresAt }
          }
        }, institutionId, organizationId);
        
        resolve(archived);
      };
      putRequest.onerror = () => reject(putRequest.error);
    });
  }

  /**
   * Expurgo automático (DECISÃO: Remove após 1 ano)
   * Deve ser executado mensalmente via job
   */
  async purgeExpired(institutionId: string): Promise<number> {
    const db = await this.initDB();
    const now = new Date();
    let purgedCount = 0;

    const expired = await this.list({
      institutionId,
      includeArchived: true
    });

    const toPurge = expired.filter(a => 
      a.deletedAt && 
      a.expiresAt && 
      new Date(a.expiresAt) <= now
    );

    for (const assessment of toPurge) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const deleteRequest = store.delete(assessment.id);

        deleteRequest.onsuccess = async () => {
          purgedCount++;
          
          await auditService.log({
            eventType: AuditEventType.DATA_PURGE,
            severity: AuditSeverity.INFO,
            actorId: 'system',
            targetResourceId: assessment.id,
            targetResourceType: 'assessment',
            details: {
              description: `Assessment purged after ${ASSESSMENT_RETENTION_DAYS} days retention`,
              action: 'purged',
              before: { deletedAt: assessment.deletedAt, expiresAt: assessment.expiresAt }
            }
          }, institutionId, assessment.organizationId);
          
          resolve();
        };
        deleteRequest.onerror = () => reject(deleteRequest.error);
      });
    }

    return purgedCount;
  }
}

export const assessmentService = new AssessmentService();
