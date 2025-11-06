/**
 * Types para Consolidação Institucional
 * SISGEAD 3.0 Premium - Consolidação de dados do SISGEAD 2.0 Standard
 */

import type { Organization } from './organization';

/**
 * Dados consolidados de uma organização (vindos do SISGEAD 2.0)
 */
export interface OrganizationData {
  organizationId: string;
  organizationName: string;
  
  // Estatísticas do SISGEAD 2.0 Standard
  stats: {
    totalDocuments: number;           // Total de documentos cadastrados
    totalAssessments: number;          // Total de avaliações realizadas
    totalUsers: number;                // Total de usuários da organização
    averageScore: number;              // Média geral de avaliações
    lastActivity: string;              // Data da última atividade
  };
  
  // Dados brutos do localStorage (SISGEAD 2.0)
  rawData: {
    documents: any[];                  // Documentos do SISGEAD 2.0
    assessments: any[];                // Avaliações do SISGEAD 2.0
    metadata: any[];                   // Metadados do SISGEAD 2.0
  };
}

/**
 * Consolidação completa da instituição
 */
export interface InstitutionConsolidation {
  institutionId: string;
  institutionName: string;
  generatedAt: string;
  
  // Totais consolidados
  totals: {
    organizations: number;
    documents: number;
    assessments: number;
    users: number;
    averageScore: number;
  };
  
  // Dados por organização
  organizations: OrganizationData[];
  
  // Ranking
  ranking: {
    topPerformingOrgs: Array<{
      organizationId: string;
      organizationName: string;
      averageScore: number;
      totalAssessments: number;
    }>;
  };
}

/**
 * Filtros para consolidação
 */
export interface ConsolidationFilters {
  institutionId: string;
  organizationIds?: string[];        // Filtrar organizações específicas
  dateRange?: {
    start: string;
    end: string;
  };
  includeRawData?: boolean;         // Se deve incluir dados brutos
}

/**
 * Relatório consolidado exportável
 */
export interface ConsolidatedReport {
  institutionId: string;
  institutionName: string;
  reportType: 'summary' | 'detailed' | 'comparative';
  generatedAt: string;
  generatedBy: string;
  dateRange?: {
    start: string;
    end: string;
  };
  
  data: InstitutionConsolidation;
  
  // Metadados para exportação
  metadata: {
    totalPages: number;
    format: 'json' | 'excel' | 'pdf';
  };
}
