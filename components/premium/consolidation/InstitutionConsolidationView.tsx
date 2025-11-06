/**
 * InstitutionConsolidation - Aba de Consolidação Institucional
 * 
 * Exibe dados consolidados de todas as organizações
 * Dados vêm do SISGEAD 2.0 Standard usado por cada organização
 */

import React, { useEffect, useState } from 'react';
import { consolidationService } from '../../../services/premium/consolidationService';
import type { InstitutionConsolidation, OrganizationData } from '../../../types/premium/consolidation';
import { authService } from '../../../services/premium/authService';

export const InstitutionConsolidationView: React.FC = () => {
  const [consolidation, setConsolidation] = useState<InstitutionConsolidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationData | null>(null);

  useEffect(() => {
    loadConsolidation();
  }, []);

  const loadConsolidation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const institution = authService.getCurrentInstitution();
      if (!institution) {
        throw new Error('Instituição não encontrada');
      }

      const data = await consolidationService.getInstitutionConsolidation({
        institutionId: institution.id,
        includeRawData: false
      });

      setConsolidation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar consolidação');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const institution = authService.getCurrentInstitution();
      if (!institution) return;

      const excelData = await consolidationService.exportToExcel({
        institutionId: institution.id,
        includeRawData: true
      });

      // Criar arquivo JSON para download (em produção, usar biblioteca Excel)
      const dataStr = JSON.stringify(excelData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consolidacao_${institution.name}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="font-semibold text-red-900">Erro ao carregar consolidação</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!consolidation) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header com Totais */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{consolidation.institutionName}</h2>
            <p className="text-blue-100">Consolidação Institucional - SISGEAD 2.0</p>
          </div>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            📊 Exportar Relatório
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold">{consolidation.totals.organizations}</div>
            <div className="text-sm text-blue-100">Organizações</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold">{consolidation.totals.documents}</div>
            <div className="text-sm text-blue-100">Documentos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold">{consolidation.totals.assessments}</div>
            <div className="text-sm text-blue-100">Avaliações</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold">{consolidation.totals.users}</div>
            <div className="text-sm text-blue-100">Usuários</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold">{consolidation.totals.averageScore.toFixed(1)}</div>
            <div className="text-sm text-blue-100">Média Geral</div>
          </div>
        </div>
      </div>

      {/* Ranking */}
      {consolidation.ranking.topPerformingOrgs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top 10 Organizações</h3>
          <div className="space-y-2">
            {consolidation.ranking.topPerformingOrgs.map((org, index) => (
              <div
                key={org.organizationId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{org.organizationName}</div>
                    <div className="text-sm text-gray-500">{org.totalAssessments} avaliações</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{org.averageScore.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Média</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Organizações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Dados por Organização</h3>
          <p className="text-sm text-gray-500">Dados gerados pelo SISGEAD 2.0 Standard de cada organização</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {consolidation.organizations.map((org) => (
            <div
              key={org.organizationId}
              className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedOrg(selectedOrg?.organizationId === org.organizationId ? null : org)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{org.organizationName}</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Documentos:</span>
                      <span className="ml-2 font-medium text-gray-900">{org.stats.totalDocuments}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avaliações:</span>
                      <span className="ml-2 font-medium text-gray-900">{org.stats.totalAssessments}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Usuários:</span>
                      <span className="ml-2 font-medium text-gray-900">{org.stats.totalUsers}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Média:</span>
                      <span className="ml-2 font-medium text-blue-600">{org.stats.averageScore.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Última atividade:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {org.stats.lastActivity 
                          ? new Date(org.stats.lastActivity).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className="ml-4 text-blue-600 hover:text-blue-800">
                  {selectedOrg?.organizationId === org.organizationId ? '▼' : '▶'}
                </button>
              </div>

              {/* Detalhes expandidos */}
              {selectedOrg?.organizationId === org.organizationId && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h5 className="font-medium text-gray-900 mb-2">Detalhes da Organização</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">ID da Organização:</span>
                      <div className="font-mono text-xs text-gray-900">{org.organizationId}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total de Documentos:</span>
                      <div className="font-medium text-gray-900">{org.stats.totalDocuments}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total de Avaliações:</span>
                      <div className="font-medium text-gray-900">{org.stats.totalAssessments}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Usuários Ativos:</span>
                      <div className="font-medium text-gray-900">{org.stats.totalUsers}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Ver Detalhes Completos
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                      Exportar Dados desta Org
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>Dados consolidados do SISGEAD 2.0 Standard</p>
        <p>Última atualização: {new Date(consolidation.generatedAt).toLocaleString('pt-BR')}</p>
      </div>
    </div>
  );
};
