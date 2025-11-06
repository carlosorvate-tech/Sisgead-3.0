/**
 * ConsolidationService - Consolidação de dados SISGEAD 2.0 por Instituição
 * 
 * Este serviço AGREGA dados gerados pelas organizações no SISGEAD 2.0 Standard
 * NÃO cria dados novos, apenas lê e consolida
 */

import type { 
  OrganizationData, 
  InstitutionConsolidation, 
  ConsolidationFilters,
  ConsolidatedReport 
} from '../../types/premium/consolidation';
import type { Organization } from '../../types/premium/organization';
import { organizationService } from './organizationService';
import { authService } from './authService';

class ConsolidationService {
  /**
   * Obter dados de uma organização do SISGEAD 2.0
   * Lê diretamente do localStorage onde o SISGEAD 2.0 armazena
   */
  private getOrganizationSisgead2Data(organizationId: string): OrganizationData['rawData'] {
    // Chaves do SISGEAD 2.0 Standard (padrão atual)
    const documentsKey = 'documents';           // Documentos cadastrados
    const metadataKey = 'metadata';             // Metadados
    const currentDocKey = 'currentDocument';    // Documento atual
    
    // Ler dados do localStorage
    const documentsData = localStorage.getItem(documentsKey);
    const metadataData = localStorage.getItem(metadataKey);
    
    let documents: any[] = [];
    let metadata: any[] = [];
    let assessments: any[] = [];
    
    try {
      // Parse documentos
      if (documentsData) {
        const allDocuments = JSON.parse(documentsData);
        // Filtrar apenas documentos desta organização
        documents = Array.isArray(allDocuments) 
          ? allDocuments.filter(doc => doc.organizationId === organizationId)
          : [];
      }
      
      // Parse metadata
      if (metadataData) {
        const allMetadata = JSON.parse(metadataData);
        metadata = Array.isArray(allMetadata)
          ? allMetadata.filter(meta => meta.organizationId === organizationId)
          : [];
      }
      
      // Extrair avaliações dos documentos
      documents.forEach(doc => {
        if (doc.assessments && Array.isArray(doc.assessments)) {
          assessments.push(...doc.assessments);
        }
      });
      
    } catch (error) {
      console.error(`Erro ao ler dados SISGEAD 2.0 da org ${organizationId}:`, error);
    }
    
    return {
      documents,
      assessments,
      metadata
    };
  }
  
  /**
   * Calcular estatísticas de uma organização
   */
  private calculateOrgStats(rawData: OrganizationData['rawData']): OrganizationData['stats'] {
    const { documents, assessments } = rawData;
    
    // Calcular média de avaliações
    let averageScore = 0;
    if (assessments.length > 0) {
      const totalScore = assessments.reduce((sum, assessment) => {
        // Assumindo que avaliações têm um campo 'score' ou similar
        return sum + (assessment.score || assessment.rating || 0);
      }, 0);
      averageScore = totalScore / assessments.length;
    }
    
    // Data da última atividade
    let lastActivity = '';
    if (documents.length > 0) {
      const dates = documents
        .map(doc => doc.createdAt || doc.updatedAt || doc.timestamp)
        .filter(date => date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      if (dates.length > 0) {
        lastActivity = dates[0];
      }
    }
    
    // Contar usuários únicos (se os documentos tiverem createdBy)
    const uniqueUsers = new Set(
      documents
        .map(doc => doc.createdBy || doc.userId)
        .filter(userId => userId)
    );
    
    return {
      totalDocuments: documents.length,
      totalAssessments: assessments.length,
      totalUsers: uniqueUsers.size,
      averageScore: Math.round(averageScore * 100) / 100, // 2 casas decimais
      lastActivity
    };
  }
  
  /**
   * Consolidar dados de uma organização
   */
  async getOrganizationConsolidation(organizationId: string): Promise<OrganizationData> {
    const org = await organizationService.getById(organizationId);
    
    if (!org) {
      throw new Error(`Organização ${organizationId} não encontrada`);
    }
    
    const rawData = this.getOrganizationSisgead2Data(organizationId);
    const stats = this.calculateOrgStats(rawData);
    
    return {
      organizationId: org.id,
      organizationName: org.name,
      stats,
      rawData
    };
  }
  
  /**
   * Consolidar dados de toda a instituição
   */
  async getInstitutionConsolidation(filters: ConsolidationFilters): Promise<InstitutionConsolidation> {
    const currentUser = authService.getCurrentUser();
    const currentInstitution = authService.getCurrentInstitution();
    
    if (!currentUser || !currentInstitution) {
      throw new Error('Usuário ou instituição não encontrada');
    }
    
    // Apenas Master pode acessar consolidação
    if (currentUser.role !== 'master') {
      throw new Error('Acesso negado: apenas usuários Master podem acessar consolidação institucional');
    }
    
    // Obter todas as organizações da instituição
    let organizations = await organizationService.list({ 
      institutionId: filters.institutionId 
    });
    
    // Filtrar organizações se especificado
    if (filters.organizationIds && filters.organizationIds.length > 0) {
      organizations = organizations.filter(org => 
        filters.organizationIds!.includes(org.id)
      );
    }
    
    // Consolidar dados de cada organização
    const organizationsData: OrganizationData[] = [];
    
    for (const org of organizations) {
      try {
        const orgData = await this.getOrganizationConsolidation(org.id);
        
        // Se não deve incluir dados brutos, remover
        if (!filters.includeRawData) {
          orgData.rawData = { documents: [], assessments: [], metadata: [] };
        }
        
        organizationsData.push(orgData);
      } catch (error) {
        console.error(`Erro ao consolidar organização ${org.id}:`, error);
      }
    }
    
    // Calcular totais
    const totals = {
      organizations: organizationsData.length,
      documents: organizationsData.reduce((sum, org) => sum + org.stats.totalDocuments, 0),
      assessments: organizationsData.reduce((sum, org) => sum + org.stats.totalAssessments, 0),
      users: organizationsData.reduce((sum, org) => sum + org.stats.totalUsers, 0),
      averageScore: this.calculateGlobalAverage(organizationsData)
    };
    
    // Criar ranking
    const topPerformingOrgs = organizationsData
      .filter(org => org.stats.totalAssessments > 0)
      .sort((a, b) => b.stats.averageScore - a.stats.averageScore)
      .slice(0, 10)
      .map(org => ({
        organizationId: org.organizationId,
        organizationName: org.organizationName,
        averageScore: org.stats.averageScore,
        totalAssessments: org.stats.totalAssessments
      }));
    
    return {
      institutionId: currentInstitution.id,
      institutionName: currentInstitution.name,
      generatedAt: new Date().toISOString(),
      totals,
      organizations: organizationsData,
      ranking: {
        topPerformingOrgs
      }
    };
  }
  
  /**
   * Calcular média global ponderada
   */
  private calculateGlobalAverage(organizationsData: OrganizationData[]): number {
    let totalScore = 0;
    let totalAssessments = 0;
    
    organizationsData.forEach(org => {
      totalScore += org.stats.averageScore * org.stats.totalAssessments;
      totalAssessments += org.stats.totalAssessments;
    });
    
    if (totalAssessments === 0) return 0;
    
    return Math.round((totalScore / totalAssessments) * 100) / 100;
  }
  
  /**
   * Gerar relatório consolidado
   */
  async generateConsolidatedReport(
    filters: ConsolidationFilters,
    reportType: 'summary' | 'detailed' | 'comparative' = 'summary'
  ): Promise<ConsolidatedReport> {
    const currentUser = authService.getCurrentUser();
    const currentInstitution = authService.getCurrentInstitution();
    
    if (!currentUser || !currentInstitution) {
      throw new Error('Usuário ou instituição não encontrada');
    }
    
    // Incluir dados brutos apenas em relatórios detalhados
    const consolidationFilters = {
      ...filters,
      includeRawData: reportType === 'detailed'
    };
    
    const data = await this.getInstitutionConsolidation(consolidationFilters);
    
    return {
      institutionId: currentInstitution.id,
      institutionName: currentInstitution.name,
      reportType,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser.id,
      dateRange: filters.dateRange,
      data,
      metadata: {
        totalPages: 1,
        format: 'json'
      }
    };
  }
  
  /**
   * Exportar relatório para Excel (preparação de dados)
   */
  async exportToExcel(filters: ConsolidationFilters): Promise<any> {
    const report = await this.generateConsolidatedReport(filters, 'detailed');
    
    // Preparar dados para exportação Excel
    const excelData = {
      summary: {
        institution: report.institutionName,
        generatedAt: new Date(report.generatedAt).toLocaleString('pt-BR'),
        totalOrganizations: report.data.totals.organizations,
        totalDocuments: report.data.totals.documents,
        totalAssessments: report.data.totals.assessments,
        totalUsers: report.data.totals.users,
        averageScore: report.data.totals.averageScore
      },
      organizations: report.data.organizations.map(org => ({
        name: org.organizationName,
        documents: org.stats.totalDocuments,
        assessments: org.stats.totalAssessments,
        users: org.stats.totalUsers,
        averageScore: org.stats.averageScore,
        lastActivity: org.stats.lastActivity 
          ? new Date(org.stats.lastActivity).toLocaleString('pt-BR') 
          : 'N/A'
      })),
      ranking: report.data.ranking.topPerformingOrgs
    };
    
    return excelData;
  }
}

export const consolidationService = new ConsolidationService();
