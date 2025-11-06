/**
 * SISGEAD 3.0 Premium - Team Member Service
 * Serviço de Gerenciamento de Membros com Transferências Multi-Tenant
 * 
 * Decisões Implementadas:
 * - Transferências inter-org SEM aprovação de ambas
 * - Mantém histórico DISC com opção de reavaliação
 * - Soft delete com retenção de 1 ano
 * - Auditoria completa de movimentações
 */

import {
  TeamMember,
  MemberStatus,
  MemberRole,
  RemovalReason,
  TransferEvent,
  MemberStats,
  TeamMemberFilters,
  AddMemberRequest,
  RemoveMemberRequest,
  TransferMemberRequest,
  UpdateMemberRequest,
  MEMBER_RETENTION_DAYS,
  DEFAULT_MEMBER_PERMISSIONS
} from '../../types/premium/teamMember';
import { auditService } from './auditService';
import { 
  AuditEventType, 
  AuditSeverity,
  KPICategory,
  createMemberAddedLog,
  createMemberRemovedLog,
  createMemberTransferredLog
} from '../../types/premium/auditLog';

/**
 * Serviço singleton de gerenciamento de membros de equipe
 */
class TeamMemberService {
  private readonly STORE_NAME = 'team_members';
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
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('role', 'role', { unique: false });
          
          // Índice composto para isolamento total
          store.createIndex('institution_organization', ['institutionId', 'organizationId'], { unique: false });
          store.createIndex('organization_team', ['organizationId', 'teamId'], { unique: false });
          store.createIndex('team_user', ['teamId', 'userId'], { unique: false });
          
          // Índices para soft delete
          store.createIndex('deletedAt', 'deletedAt', { unique: false });
          
          // Índices para permissões
          store.createIndex('canApproveAssessments', 'canApproveAssessments', { unique: false });
        }
      };
    });
  }

  /**
   * Adiciona membro à equipe (DECISÃO: Reavaliação permitida por padrão)
   */
  async addMember(
    request: AddMemberRequest,
    institutionId: string,
    organizationId: string,
    addedBy: string
  ): Promise<TeamMember> {
    const db = await this.initDB();
    
    // Verificar se usuário já é membro ativo da equipe
    const existing = await this.list({
      institutionId,
      organizationId,
      teamId: request.teamId,
      userId: request.userId,
      status: [MemberStatus.ACTIVE]
    });

    if (existing.length > 0) {
      throw new Error(`Usuário ${request.userId} já é membro ativo da equipe ${request.teamId}`);
    }

    const member: TeamMember = {
      id: crypto.randomUUID(),
      institutionId,
      organizationId,
      teamId: request.teamId,
      userId: request.userId,
      status: MemberStatus.ACTIVE,
      role: request.role,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      assessmentHistory: [],
      allowReassessment: request.allowReassessment ?? true, // DECISÃO: Default true
      transferHistory: [],
      canApproveAssessments: DEFAULT_MEMBER_PERMISSIONS.canApproveAssessments,
      canManageTeam: DEFAULT_MEMBER_PERMISSIONS.canManageTeam,
      notes: request.notes,
      tags: request.tags,
      version: 1,
      lastModifiedBy: addedBy
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const addRequest = store.add(member);

      addRequest.onsuccess = async () => {
        // Registrar auditoria
        await auditService.log(
          createMemberAddedLog(
            member.id,
            request.teamId,
            addedBy,
            organizationId,
            institutionId,
            request.role
          ),
          institutionId,
          organizationId
        );
        
        resolve(member);
      };
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  /**
   * Remove membro da equipe (DECISÃO: Soft delete com 1 ano retenção)
   */
  async removeMember(
    request: RemoveMemberRequest,
    institutionId: string,
    organizationId: string
  ): Promise<TeamMember> {
    const existing = await this.getById(request.memberId, institutionId, organizationId);
    if (!existing) {
      throw new Error(`Membro ${request.memberId} não encontrado`);
    }

    const db = await this.initDB();
    
    const deletedAt = new Date();
    const expiresAt = new Date(deletedAt);
    expiresAt.setDate(expiresAt.getDate() + MEMBER_RETENTION_DAYS); // +1 ano

    // Calcular tempo na equipe e organização
    const daysInTeam = Math.floor(
      (deletedAt.getTime() - new Date(existing.joinedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysInOrganization = daysInTeam; // TODO: Calcular tempo total na org considerando transferências

    const removed: TeamMember = {
      ...existing,
      status: MemberStatus.REMOVED,
      leftAt: deletedAt,
      deletedAt,
      expiresAt,
      deletedBy: request.removedBy,
      removalReason: request.reason,
      removalDetails: request.details,
      updatedAt: new Date(),
      version: existing.version + 1,
      lastModifiedBy: request.removedBy
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const putRequest = store.put(removed);

      putRequest.onsuccess = async () => {
        // Registrar auditoria com detalhes da remoção
        await auditService.log(
          createMemberRemovedLog(
            request.memberId,
            existing.teamId,
            request.removedBy,
            organizationId,
            institutionId,
            request.reason,
            request.details || '',
            daysInTeam,
            daysInOrganization
          ),
          institutionId,
          organizationId
        );
        
        // Registrar evento específico de acordo com o motivo
        let specificEventType: AuditEventType;
        switch (request.reason) {
          case RemovalReason.RESIGNATION:
            specificEventType = AuditEventType.MEMBER_RESIGNATION;
            break;
          case RemovalReason.CONTRACT_ENDED:
            specificEventType = AuditEventType.MEMBER_CONTRACT_ENDED;
            break;
          case RemovalReason.PROJECT_ENDED:
            specificEventType = AuditEventType.MEMBER_PROJECT_ENDED;
            break;
          default:
            specificEventType = AuditEventType.MEMBER_REMOVED;
        }

        if (specificEventType !== AuditEventType.MEMBER_REMOVED) {
          await auditService.log({
            eventType: specificEventType,
            severity: AuditSeverity.CRITICAL,
            actorId: request.removedBy,
            teamId: existing.teamId,
            targetUserId: existing.userId,
            targetResourceId: request.memberId,
            targetResourceType: 'team_member',
            details: {
              description: `Member ${request.reason}: ${request.details || ''}`,
              action: 'removed',
              reason: request.reason,
              notes: request.details
            },
            affectsKPIs: true,
            kpiCategories: [KPICategory.TURNOVER, KPICategory.RETENTION]
          }, institutionId, organizationId);
        }
        
        resolve(removed);
      };
      putRequest.onerror = () => reject(putRequest.error);
    });
  }

  /**
   * Transfere membro entre equipes/organizações (DECISÃO: SEM aprovação de ambas)
   */
  async transferMember(
    request: TransferMemberRequest,
    institutionId: string
  ): Promise<TeamMember> {
    const existing = await this.getById(request.memberId, institutionId);
    if (!existing) {
      throw new Error(`Membro ${request.memberId} não encontrado`);
    }

    const db = await this.initDB();
    
    // Criar evento de transferência
    const transferEvent: TransferEvent = {
      id: crypto.randomUUID(),
      memberId: request.memberId,
      fromOrganizationId: existing.organizationId,
      fromTeamId: existing.teamId,
      toOrganizationId: request.toOrganizationId,
      toTeamId: request.toTeamId,
      transferredAt: new Date(),
      transferredBy: request.transferredBy,
      reason: request.reason,
      notes: request.notes,
      keptAssessmentId: request.keepAssessment ? existing.currentAssessmentId : undefined,
      newAssessmentId: request.requestReassessment ? undefined : undefined, // Será preenchido depois
      requiresApproval: false, // DECISÃO: Sempre false
      auditLogId: '' // Será preenchido pelo audit
    };

    const transferred: TeamMember = {
      ...existing,
      organizationId: request.toOrganizationId,
      teamId: request.toTeamId,
      status: MemberStatus.ACTIVE,
      transferHistory: [...existing.transferHistory, transferEvent],
      // Se não mantém assessment, limpar
      currentAssessmentId: request.keepAssessment ? existing.currentAssessmentId : undefined,
      updatedAt: new Date(),
      version: existing.version + 1,
      lastModifiedBy: request.transferredBy
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const putRequest = store.put(transferred);

      putRequest.onsuccess = async () => {
        // Registrar auditoria de transferência
        const auditLog = await auditService.log(
          createMemberTransferredLog(
            request.memberId,
            existing.teamId,
            request.toTeamId,
            existing.organizationId,
            request.toOrganizationId,
            request.transferredBy,
            institutionId,
            request.reason,
            request.keepAssessment
          ),
          institutionId,
          existing.organizationId // Log na organização de origem
        );

        // Atualizar auditLogId no transferEvent
        transferEvent.auditLogId = auditLog.id;
        
        resolve(transferred);
      };
      putRequest.onerror = () => reject(putRequest.error);
    });
  }

  /**
   * Atualiza dados do membro
   */
  async updateMember(
    memberId: string,
    updates: UpdateMemberRequest,
    institutionId: string,
    organizationId: string,
    updatedBy: string
  ): Promise<TeamMember> {
    const existing = await this.getById(memberId, institutionId, organizationId);
    if (!existing) {
      throw new Error(`Membro ${memberId} não encontrado`);
    }

    const db = await this.initDB();
    
    const updated: TeamMember = {
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
        // Registrar auditoria
        await auditService.log({
          eventType: AuditEventType.MEMBER_UPDATED,
          severity: AuditSeverity.INFO,
          actorId: updatedBy,
          teamId: existing.teamId,
          targetUserId: existing.userId,
          targetResourceId: memberId,
          targetResourceType: 'team_member',
          details: {
            description: 'Member updated',
            action: 'updated',
            before: {
              role: existing.role,
              status: existing.status,
              canApproveAssessments: existing.canApproveAssessments
            },
            after: {
              role: updates.role || existing.role,
              status: updates.status || existing.status,
              canApproveAssessments: updates.canApproveAssessments ?? existing.canApproveAssessments
            }
          }
        }, institutionId, organizationId);
        
        resolve(updated);
      };
      putRequest.onerror = () => reject(putRequest.error);
    });
  }

  /**
   * Busca membro por ID (MULTI-TENANT: Valida institutionId)
   */
  async getById(
    id: string,
    institutionId: string,
    organizationId?: string
  ): Promise<TeamMember | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const member = getRequest.result as TeamMember | undefined;
        
        // VALIDAÇÃO MULTI-TENANT CRÍTICA
        if (!member) {
          resolve(null);
          return;
        }
        
        if (member.institutionId !== institutionId) {
          console.warn(`🔒 Multi-tenant violation: Member ${id} não pertence à instituição ${institutionId}`);
          resolve(null);
          return;
        }
        
        if (organizationId && member.organizationId !== organizationId) {
          console.warn(`🔒 Multi-tenant violation: Member ${id} não pertence à organização ${organizationId}`);
          resolve(null);
          return;
        }
        
        // Excluir arquivados por padrão
        if (member.deletedAt && member.status === MemberStatus.ARCHIVED) {
          resolve(null);
          return;
        }
        
        resolve(member);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Lista membros com filtros (MULTI-TENANT: Isolamento garantido)
   */
  async list(filters: TeamMemberFilters): Promise<TeamMember[]> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      
      // Usar índice apropriado para performance
      let request: IDBRequest<TeamMember[]>;
      
      if (filters.organizationId && filters.teamId) {
        const index = store.index('organization_team');
        const range = IDBKeyRange.only([filters.organizationId, filters.teamId]);
        request = index.getAll(range);
      } else if (filters.organizationId) {
        const index = store.index('institution_organization');
        const range = IDBKeyRange.only([filters.institutionId, filters.organizationId]);
        request = index.getAll(range);
      } else {
        const index = store.index('institutionId');
        request = index.getAll(IDBKeyRange.only(filters.institutionId));
      }

      request.onsuccess = () => {
        let results = request.result as TeamMember[];
        
        // Filtros adicionais
        results = results.filter(member => {
          // Soft delete (DECISÃO: Excluir arquivados por padrão)
          if (!filters.includeArchived && member.deletedAt) {
            return false;
          }
          
          if (filters.teamId && member.teamId !== filters.teamId) {
            return false;
          }
          
          if (filters.userId && member.userId !== filters.userId) {
            return false;
          }
          
          if (filters.status && !filters.status.includes(member.status)) {
            return false;
          }
          
          if (filters.role && !filters.role.includes(member.role)) {
            return false;
          }
          
          if (filters.hasCurrentAssessment !== undefined) {
            const hasAssessment = !!member.currentAssessmentId;
            if (hasAssessment !== filters.hasCurrentAssessment) {
              return false;
            }
          }
          
          if (filters.joinedFrom && new Date(member.joinedAt) < filters.joinedFrom) {
            return false;
          }
          
          if (filters.joinedTo && new Date(member.joinedAt) > filters.joinedTo) {
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
   * Obtém estatísticas do membro
   */
  async getStats(memberId: string, institutionId: string): Promise<MemberStats> {
    const member = await this.getById(memberId, institutionId);
    if (!member) {
      throw new Error(`Membro ${memberId} não encontrado`);
    }

    const now = new Date();
    const joinedDate = new Date(member.joinedAt);
    const daysInCurrentTeam = Math.floor(
      (now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calcular tempo total na organização (considerando transferências)
    let totalDaysInOrganization = daysInCurrentTeam;
    member.transferHistory.forEach(transfer => {
      if (transfer.toOrganizationId === member.organizationId) {
        const transferDate = new Date(transfer.transferredAt);
        totalDaysInOrganization += Math.floor(
          (now.getTime() - transferDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    });

    const stats: MemberStats = {
      totalProjects: 0, // TODO: Integrar com sistema de projetos
      completedProjects: 0,
      currentProjects: 0,
      daysInCurrentTeam,
      daysInOrganization: totalDaysInOrganization,
      daysInInstitution: totalDaysInOrganization, // TODO: Calcular real
      totalAssessments: member.assessmentHistory.length,
      lastAssessmentDate: member.currentAssessmentId ? new Date() : undefined, // TODO: Buscar data real
      assessmentFrequencyDays: undefined, // TODO: Calcular
      totalTransfers: member.transferHistory.length,
      lastTransferDate: member.transferHistory.length > 0
        ? new Date(member.transferHistory[member.transferHistory.length - 1].transferredAt)
        : undefined
    };

    return stats;
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

    const toPurge = expired.filter(m =>
      m.deletedAt &&
      m.expiresAt &&
      new Date(m.expiresAt) <= now
    );

    for (const member of toPurge) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const deleteRequest = store.delete(member.id);

        deleteRequest.onsuccess = async () => {
          purgedCount++;

          await auditService.log({
            eventType: AuditEventType.DATA_PURGE,
            severity: AuditSeverity.INFO,
            actorId: 'system',
            targetUserId: member.userId,
            targetResourceId: member.id,
            targetResourceType: 'team_member',
            details: {
              description: `Team member purged after ${MEMBER_RETENTION_DAYS} days retention`,
              action: 'purged',
              before: { deletedAt: member.deletedAt, expiresAt: member.expiresAt }
            }
          }, institutionId, member.organizationId);

          resolve();
        };
        deleteRequest.onerror = () => reject(deleteRequest.error);
      });
    }

    return purgedCount;
  }

  /**
   * Arquiva membro (transição para ARCHIVED antes do expurgo)
   */
  async archive(
    memberId: string,
    institutionId: string,
    organizationId: string,
    archivedBy: string
  ): Promise<TeamMember> {
    const existing = await this.getById(memberId, institutionId, organizationId);
    if (!existing) {
      throw new Error(`Membro ${memberId} não encontrado`);
    }

    if (existing.status === MemberStatus.ARCHIVED) {
      return existing; // Já arquivado
    }

    const db = await this.initDB();

    const archived: TeamMember = {
      ...existing,
      status: MemberStatus.ARCHIVED,
      updatedAt: new Date(),
      version: existing.version + 1,
      lastModifiedBy: archivedBy
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const putRequest = store.put(archived);

      putRequest.onsuccess = async () => {
        await auditService.log({
          eventType: AuditEventType.MEMBER_ARCHIVED,
          severity: AuditSeverity.WARNING,
          actorId: archivedBy,
          teamId: existing.teamId,
          targetUserId: existing.userId,
          targetResourceId: memberId,
          targetResourceType: 'team_member',
          details: {
            description: 'Member archived',
            action: 'archived',
            before: { status: existing.status },
            after: { status: MemberStatus.ARCHIVED }
          }
        }, institutionId, organizationId);

        resolve(archived);
      };
      putRequest.onerror = () => reject(putRequest.error);
    });
  }
}

export const teamMemberService = new TeamMemberService();
