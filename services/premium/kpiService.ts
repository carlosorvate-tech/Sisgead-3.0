/**
 * SISGEAD 3.0 Premium - KPI Service
 * Serviço de Cálculo Automático de KPIs (ISO 30414 Compliant)
 * 
 * Decisões Implementadas:
 * - KPIs baseados em ISO 30414 (Human Capital Reporting)
 * - Cálculo automático baseado em audit logs
 * - Métricas de turnover, retention, transferências
 * - Dashboard por organização e instituição
 */

import {
  OrganizationKPIs,
  KPIMetric,
  KPIPeriod,
  KPITrend,
  KPIFilters,
  KPICalculationRequest,
  KPIComparison,
  KPIDashboard,
  KPIAlert,
  KPIRecommendation,
  KPI_THRESHOLDS,
  DEFAULT_KPI_PERIOD,
  calculateTurnoverRate,
  calculateRetentionRate,
  calculateTransferRate
} from '../../types/premium/kpi';
import { auditService } from './auditService';
import { teamMemberService } from './teamMemberService';
import { 
  AuditEventType,
  KPICategory 
} from '../../types/premium/auditLog';
import { MemberStatus } from '../../types/premium/teamMember';

/**
 * Serviço singleton de cálculo de KPIs
 */
class KPIService {
  private readonly STORE_NAME = 'organization_kpis';
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
          
          // Índices multi-tenant
          store.createIndex('institutionId', 'institutionId', { unique: false });
          store.createIndex('organizationId', 'organizationId', { unique: false });
          store.createIndex('period', 'period', { unique: false });
          store.createIndex('calculatedAt', 'calculatedAt', { unique: false });
          
          // Índice composto para busca eficiente
          store.createIndex('organization_period', ['organizationId', 'period'], { unique: false });
        }
      };
    });
  }

  /**
   * Calcula KPIs para uma organização em um período (DECISÃO: Baseado em audit logs)
   */
  async calculate(request: KPICalculationRequest): Promise<OrganizationKPIs> {
    // Verificar se já existe cálculo para este período
    if (!request.recalculate) {
      const existing = await this.getByPeriod(
        request.organizationId,
        request.period,
        request.periodStart,
        request.periodEnd
      );
      if (existing) {
        return existing;
      }
    }

    const db = await this.initDB();
    
    // Buscar todos os membros da organização
    const allMembers = await teamMemberService.list({
      institutionId: await this.getInstitutionId(request.organizationId),
      organizationId: request.organizationId,
      includeArchived: true
    });

    // Filtrar membros ativos no período
    const activeMembers = allMembers.filter(m => {
      const joinedDate = new Date(m.joinedAt);
      return joinedDate <= request.periodEnd && 
        (!m.leftAt || new Date(m.leftAt) >= request.periodStart);
    });

    // Gerar relatório de auditoria para o período
    const auditReport = await auditService.generateReport(
      await this.getInstitutionId(request.organizationId),
      request.organizationId,
      request.periodStart,
      request.periodEnd
    );

    // Calcular snapshot de dados
    const snapshot = {
      totalMembers: allMembers.length,
      activeMembers: allMembers.filter(m => m.status === MemberStatus.ACTIVE).length,
      archivedMembers: allMembers.filter(m => m.status === MemberStatus.ARCHIVED).length,
      totalTeams: 0, // TODO: Integrar com teamService
      activeTeams: 0
    };

    // Calcular métricas de rotatividade
    const averageHeadcount = activeMembers.length;
    const turnoverMetrics = {
      totalRate: calculateTurnoverRate(auditReport.totalMembersRemoved, averageHeadcount),
      voluntaryRate: calculateTurnoverRate(auditReport.totalResignations, averageHeadcount),
      involuntaryRate: calculateTurnoverRate(
        auditReport.totalMembersRemoved - auditReport.totalResignations,
        averageHeadcount
      ),
      totalExits: auditReport.totalMembersRemoved,
      voluntaryExits: auditReport.totalResignations,
      involuntaryExits: auditReport.totalMembersRemoved - auditReport.totalResignations,
      projectEndExits: auditReport.totalProjectEnds,
      contractEndExits: auditReport.totalContractEnds,
      trend: KPITrend.UNKNOWN // TODO: Calcular comparando com período anterior
    };

    // Calcular métricas de retenção
    const retentionMetrics = {
      rate: calculateRetentionRate(turnoverMetrics.totalRate),
      averageTenureDays: this.calculateAverageTenure(activeMembers),
      newHires: auditReport.totalMembersAdded,
      retainedMembers: averageHeadcount - auditReport.totalMembersRemoved,
      trend: KPITrend.UNKNOWN
    };

    // Calcular métricas de transferência
    const transferMetrics = {
      totalRate: calculateTransferRate(auditReport.totalTransfers, averageHeadcount),
      internalTransfers: auditReport.totalTransfers,
      incomingTransfers: 0, // TODO: Calcular transferências recebidas
      outgoingTransfers: 0, // TODO: Calcular transferências enviadas
      netTransfers: 0,
      trend: KPITrend.UNKNOWN
    };

    // Calcular métricas de avaliação
    const assessmentMetrics = {
      completionRate: 0, // TODO: Integrar com assessmentService
      totalCompleted: 0,
      totalPending: 0,
      averageCompletionDays: 0,
      reassessmentRate: 0,
      totalReassessments: 0,
      trend: KPITrend.UNKNOWN
    };

    // Calcular métricas de aprovação
    const approvalMetrics = {
      approvalRate: 0, // TODO: Integrar com assessmentService
      totalApproved: 0,
      totalRejected: 0,
      totalPending: 0,
      averageApprovalDays: 0,
      trend: KPITrend.UNKNOWN
    };

    const kpis: OrganizationKPIs = {
      id: crypto.randomUUID(),
      institutionId: await this.getInstitutionId(request.organizationId),
      organizationId: request.organizationId,
      period: request.period,
      periodStart: request.periodStart,
      periodEnd: request.periodEnd,
      snapshot,
      turnover: turnoverMetrics,
      retention: retentionMetrics,
      transfers: transferMetrics,
      assessments: assessmentMetrics,
      approvals: approvalMetrics,
      calculatedAt: new Date(),
      calculatedBy: 'system',
      version: 1
    };

    // Salvar KPIs calculados
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const addRequest = store.add(kpis);

      addRequest.onsuccess = () => resolve(kpis);
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  /**
   * Recalcula KPIs após eventos que afetam métricas
   */
  async recalculate(organizationId: string): Promise<OrganizationKPIs> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Primeiro dia do mês
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último dia do mês

    return this.calculate({
      organizationId,
      period: KPIPeriod.MONTHLY,
      periodStart,
      periodEnd,
      recalculate: true
    });
  }

  /**
   * Busca KPIs por período
   */
  private async getByPeriod(
    organizationId: string,
    period: KPIPeriod,
    periodStart: Date,
    periodEnd: Date
  ): Promise<OrganizationKPIs | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('organization_period');
      const request = index.getAll(IDBKeyRange.only([organizationId, period]));

      request.onsuccess = () => {
        const results = request.result as OrganizationKPIs[];
        
        // Filtrar por datas exatas
        const match = results.find(kpi =>
          new Date(kpi.periodStart).getTime() === periodStart.getTime() &&
          new Date(kpi.periodEnd).getTime() === periodEnd.getTime()
        );

        resolve(match || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtém dashboard completo de KPIs
   */
  async getDashboard(
    institutionId: string,
    organizationId?: string
  ): Promise<KPIDashboard> {
    const now = new Date();
    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Se não especificou org, retornar dashboard institucional
    if (!organizationId) {
      // TODO: Implementar dashboard agregado de todas as orgs
      throw new Error('Dashboard institucional não implementado ainda');
    }

    // Calcular período atual
    const currentPeriod = await this.calculate({
      organizationId,
      period: DEFAULT_KPI_PERIOD,
      periodStart: currentPeriodStart,
      periodEnd: currentPeriodEnd
    });

    // Calcular período anterior
    const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const previousPeriod = await this.calculate({
      organizationId,
      period: DEFAULT_KPI_PERIOD,
      periodStart: previousPeriodStart,
      periodEnd: previousPeriodEnd
    });

    // Calcular tendências dos últimos 6 meses
    const trends = await this.calculateTrends(organizationId, 6);

    // Gerar alertas
    const alerts = this.generateAlerts(currentPeriod);

    // Gerar recomendações
    const recommendations = this.generateRecommendations(currentPeriod, previousPeriod);

    return {
      institutionId,
      organizationId,
      currentPeriod,
      previousPeriod,
      trends,
      alerts,
      recommendations
    };
  }

  /**
   * Calcula tendências dos últimos N períodos
   */
  private async calculateTrends(
    organizationId: string,
    months: number
  ): Promise<Array<{
    period: string;
    turnoverRate: number;
    retentionRate: number;
    transferRate: number;
    assessmentCompletionRate: number;
  }>> {
    const trends = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const kpis = await this.calculate({
        organizationId,
        period: KPIPeriod.MONTHLY,
        periodStart,
        periodEnd
      });

      trends.unshift({
        period: `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`,
        turnoverRate: kpis.turnover.totalRate,
        retentionRate: kpis.retention.rate,
        transferRate: kpis.transfers.totalRate,
        assessmentCompletionRate: kpis.assessments.completionRate
      });
    }

    return trends;
  }

  /**
   * Gera alertas baseados em thresholds
   */
  private generateAlerts(kpis: OrganizationKPIs): KPIAlert[] {
    const alerts: KPIAlert[] = [];

    // Alerta de turnover
    if (kpis.turnover.totalRate > KPI_THRESHOLDS.TURNOVER_RATE.critical) {
      alerts.push({
        severity: 'critical',
        metric: KPIMetric.TURNOVER_RATE,
        message: `Taxa de rotatividade crítica: ${kpis.turnover.totalRate.toFixed(1)}%`,
        currentValue: kpis.turnover.totalRate,
        thresholdValue: KPI_THRESHOLDS.TURNOVER_RATE.critical,
        trend: kpis.turnover.trend,
        actionRequired: true
      });
    } else if (kpis.turnover.totalRate > KPI_THRESHOLDS.TURNOVER_RATE.acceptable) {
      alerts.push({
        severity: 'warning',
        metric: KPIMetric.TURNOVER_RATE,
        message: `Taxa de rotatividade elevada: ${kpis.turnover.totalRate.toFixed(1)}%`,
        currentValue: kpis.turnover.totalRate,
        thresholdValue: KPI_THRESHOLDS.TURNOVER_RATE.acceptable,
        trend: kpis.turnover.trend,
        actionRequired: true
      });
    }

    // Alerta de retenção
    if (kpis.retention.rate < KPI_THRESHOLDS.RETENTION_RATE.critical) {
      alerts.push({
        severity: 'critical',
        metric: KPIMetric.RETENTION_RATE,
        message: `Taxa de retenção crítica: ${kpis.retention.rate.toFixed(1)}%`,
        currentValue: kpis.retention.rate,
        thresholdValue: KPI_THRESHOLDS.RETENTION_RATE.critical,
        trend: kpis.retention.trend,
        actionRequired: true
      });
    }

    // Alerta de conclusão de avaliações
    if (kpis.assessments.completionRate < KPI_THRESHOLDS.ASSESSMENT_COMPLETION_RATE.acceptable) {
      alerts.push({
        severity: 'warning',
        metric: KPIMetric.ASSESSMENT_COMPLETION_RATE,
        message: `Taxa de conclusão de avaliações baixa: ${kpis.assessments.completionRate.toFixed(1)}%`,
        currentValue: kpis.assessments.completionRate,
        thresholdValue: KPI_THRESHOLDS.ASSESSMENT_COMPLETION_RATE.acceptable,
        trend: kpis.assessments.trend,
        actionRequired: false
      });
    }

    return alerts;
  }

  /**
   * Gera recomendações baseadas em KPIs
   */
  private generateRecommendations(
    current: OrganizationKPIs,
    previous?: OrganizationKPIs
  ): KPIRecommendation[] {
    const recommendations: KPIRecommendation[] = [];

    // Recomendação para turnover alto
    if (current.turnover.totalRate > KPI_THRESHOLDS.TURNOVER_RATE.acceptable) {
      recommendations.push({
        priority: 'high',
        category: 'Retenção de Talentos',
        title: 'Reduzir Taxa de Rotatividade',
        description: `A taxa de rotatividade está em ${current.turnover.totalRate.toFixed(1)}%, acima do aceitável (${KPI_THRESHOLDS.TURNOVER_RATE.acceptable}%)`,
        impactedMetrics: [KPIMetric.TURNOVER_RATE, KPIMetric.RETENTION_RATE],
        suggestedActions: [
          'Realizar entrevistas de desligamento para identificar causas',
          'Revisar política de benefícios e remuneração',
          'Implementar programa de desenvolvimento de carreira',
          'Melhorar clima organizacional e cultura'
        ]
      });
    }

    // Recomendação para desistências voluntárias
    if (current.turnover.voluntaryRate > current.turnover.involuntaryRate) {
      recommendations.push({
        priority: 'high',
        category: 'Engajamento',
        title: 'Alto Índice de Desistências Voluntárias',
        description: `${current.turnover.voluntaryExits} desistências voluntárias vs ${current.turnover.involuntaryExits} desligamentos`,
        impactedMetrics: [KPIMetric.VOLUNTARY_TURNOVER_RATE],
        suggestedActions: [
          'Realizar pesquisa de clima organizacional',
          'Avaliar satisfação e engajamento dos colaboradores',
          'Criar plano de carreira mais claro',
          'Revisar liderança e gestão de pessoas'
        ]
      });
    }

    // Recomendação para avaliações pendentes
    if (current.assessments.totalPending > current.assessments.totalCompleted * 0.2) {
      recommendations.push({
        priority: 'medium',
        category: 'Avaliações',
        title: 'Muitas Avaliações Pendentes',
        description: `${current.assessments.totalPending} avaliações pendentes`,
        impactedMetrics: [KPIMetric.ASSESSMENT_COMPLETION_RATE],
        suggestedActions: [
          'Enviar lembretes automáticos para colaboradores',
          'Simplificar processo de avaliação',
          'Estabelecer prazos claros e comunicar importância',
          'Oferecer suporte para dúvidas'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Compara KPIs entre organizações
   */
  async getComparison(
    institutionId: string,
    organizationIds: string[],
    period: KPIPeriod,
    periodStart: Date,
    periodEnd: Date
  ): Promise<KPIComparison> {
    const organizations = [];

    for (const orgId of organizationIds) {
      const kpis = await this.calculate({
        organizationId: orgId,
        period,
        periodStart,
        periodEnd
      });

      organizations.push({
        organizationId: orgId,
        organizationName: orgId, // TODO: Buscar nome real
        kpis
      });
    }

    // Calcular médias
    const totalOrgs = organizations.length;
    const averages = {
      turnoverRate: organizations.reduce((sum, o) => sum + o.kpis.turnover.totalRate, 0) / totalOrgs,
      retentionRate: organizations.reduce((sum, o) => sum + o.kpis.retention.rate, 0) / totalOrgs,
      transferRate: organizations.reduce((sum, o) => sum + o.kpis.transfers.totalRate, 0) / totalOrgs,
      assessmentCompletionRate: organizations.reduce((sum, o) => sum + o.kpis.assessments.completionRate, 0) / totalOrgs
    };

    // Determinar rankings
    const sortedByRetention = [...organizations].sort((a, b) => 
      b.kpis.retention.rate - a.kpis.retention.rate
    );
    const sortedByTurnover = [...organizations].sort((a, b) => 
      a.kpis.turnover.totalRate - b.kpis.turnover.totalRate
    );
    const sortedByCompletion = [...organizations].sort((a, b) => 
      b.kpis.assessments.completionRate - a.kpis.assessments.completionRate
    );

    return {
      organizations,
      period,
      periodStart,
      periodEnd,
      averages,
      rankings: {
        bestRetention: sortedByRetention[0]?.organizationId || '',
        lowestTurnover: sortedByTurnover[0]?.organizationId || '',
        highestAssessmentCompletion: sortedByCompletion[0]?.organizationId || ''
      }
    };
  }

  /**
   * Helper para calcular tempo médio na organização
   */
  private calculateAverageTenure(members: any[]): number {
    if (members.length === 0) return 0;

    const totalDays = members.reduce((sum, member) => {
      const joinedDate = new Date(member.joinedAt);
      const endDate = member.leftAt ? new Date(member.leftAt) : new Date();
      const days = Math.floor((endDate.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.floor(totalDays / members.length);
  }

  /**
   * Helper para obter institutionId de uma organização
   */
  private async getInstitutionId(organizationId: string): Promise<string> {
    // TODO: Buscar do organizationService
    // Por enquanto, retornar placeholder
    return 'institution-placeholder';
  }
}

export const kpiService = new KPIService();
