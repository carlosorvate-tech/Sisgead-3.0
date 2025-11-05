// 📋 SISGEAD 2.0 - Compliance Reports Component
// Interface para geração e visualização de relatórios de conformidade

import React, { useState, useEffect, useCallback } from 'react';
import { complianceService } from '../services/complianceService';
import { securityMonitor } from '../services/securityMonitor';
import { useTenantManager } from '../hooks/useTenantManager';
import InstitutionalLayout from '../layouts/InstitutionalLayout';
import type { 
  ComplianceReport, 
  ReportSection, 
  ComplianceRecommendation,
  PersonalDataMap,
  ConsentHistory,
  DataSubjectRequest,
  DataSubjectRequestType
} from '../types/security';

interface ReportFilters {
  tenantId: string;
  reportType: 'lgpd_audit' | 'data_inventory' | 'consent_status' | 'security_assessment';
  period: {
    start: string;
    end: string;
  };
}

type ViewMode = 'list' | 'generate' | 'view' | 'data_subject_requests';

export function ComplianceReports() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<ReportFilters>({
    tenantId: '',
    reportType: 'lgpd_audit',
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });

  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [personalDataMap, setPersonalDataMap] = useState<PersonalDataMap | null>(null);
  const [dataSubjectRequests, setDataSubjectRequests] = useState<DataSubjectRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { availableTenants, isSuperAdmin } = useTenantManager();

  // 📊 Load compliance reports
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock reports - in real implementation, load from database
      const mockReports: ComplianceReport[] = [
        {
          id: 'report-1',
          tenantId: 'default',
          type: 'lgpd_audit',
          period: {
            start: new Date('2025-01-01'),
            end: new Date('2025-01-31')
          },
          generatedAt: new Date('2025-01-31'),
          generatedBy: 'admin@sisgead.com',
          status: 'final',
          sections: [],
          recommendations: [],
          score: 85
        },
        {
          id: 'report-2',
          tenantId: 'default',
          type: 'data_inventory',
          period: {
            start: new Date('2025-01-01'),
            end: new Date('2025-01-31')
          },
          generatedAt: new Date('2025-01-30'),
          generatedBy: 'admin@sisgead.com',
          status: 'final',
          sections: [],
          recommendations: [],
          score: 92
        }
      ];

      setReports(mockReports);

      // Load personal data map
      const dataMap = complianceService.mapPersonalData();
      setPersonalDataMap(dataMap);

      // Mock data subject requests
      const mockRequests: DataSubjectRequest[] = [
        {
          id: 'dsr-1',
          userId: 'user-123',
          tenantId: 'default',
          type: 'access',
          status: 'completed',
          requestDate: new Date('2025-01-15'),
          completionDate: new Date('2025-01-16'),
          description: 'Solicitação de acesso aos dados pessoais',
          response: 'Dados fornecidos conforme Art. 18, I da LGPD',
          processedBy: 'admin@sisgead.com',
          documents: []
        },
        {
          id: 'dsr-2',
          userId: 'user-456',
          tenantId: 'default',
          type: 'deletion',
          status: 'pending',
          requestDate: new Date('2025-01-20'),
          description: 'Solicitação de exclusão de dados',
          documents: []
        }
      ];

      setDataSubjectRequests(mockRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 📝 Generate new report
  const generateReport = useCallback(async () => {
    if (!filters.tenantId) {
      setError('Selecione uma organização');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const report = complianceService.generateComplianceReport(
        filters.tenantId,
        filters.reportType,
        {
          start: new Date(filters.period.start),
          end: new Date(filters.period.end)
        },
        'super-admin' // In real implementation, get current user
      );

      setReports(prev => [report, ...prev]);
      setSelectedReport(report);
      setViewMode('view');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // 📤 Export report
  const exportReport = useCallback((report: ComplianceReport, format: 'pdf' | 'csv' | 'json') => {
    if (format === 'json') {
      downloadJSON(report, `compliance-report-${report.id}.json`);
    } else if (format === 'csv') {
      // Convert report to CSV format
      const csvData = [
        {
          id: report.id,
          type: report.type,
          tenantId: report.tenantId,
          generatedAt: report.generatedAt,
          status: report.status,
          score: report.score,
          sectionsCount: report.sections.length,
          recommendationsCount: report.recommendations.length
        }
      ];
      downloadCSV(csvData, `compliance-report-${report.id}.csv`);
    } else {
      alert('Exportação PDF será implementada em breve');
    }
  }, []);

  // 🔄 Process data subject request
  const processDataSubjectRequest = useCallback(async (
    requestId: string, 
    response: string, 
    action: 'approve' | 'reject'
  ) => {
    try {
      const result = complianceService.processDataSubjectRequest(
        requestId,
        response,
        'super-admin'
      );

      if (result.success) {
        // Update the request in state
        setDataSubjectRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: action === 'approve' ? 'completed' : 'rejected', response, completionDate: new Date() }
              : req
          )
        );
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro ao processar solicitação');
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // 🔒 Security check
  if (!isSuperAdmin) {
    return (
      <InstitutionalLayout
        title="Acesso Negado"
        subtitle="Apenas super administradores podem acessar relatórios de compliance"
        breadcrumbs={[
          { label: 'Dashboard', href: '#dashboard' },
          { label: 'Compliance' }
        ]}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-red-800">Acesso Restrito</h3>
          <p className="mt-2 text-red-600">Esta área é destinada exclusivamente para super administradores.</p>
        </div>
      </InstitutionalLayout>
    );
  }

  return (
    <InstitutionalLayout
      title="Relatórios de Conformidade"
      subtitle="LGPD, auditoria e gestão de conformidade"
      breadcrumbs={[
        { label: 'Dashboard', href: '#dashboard' },
        { label: 'Segurança', href: '#security' },
        { label: 'Compliance' }
      ]}
      actions={
        <div className="flex items-center space-x-2">
          {/* View Mode Selector */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="list">Lista de Relatórios</option>
            <option value="generate">Gerar Relatório</option>
            <option value="data_subject_requests">Solicitações LGPD</option>
          </select>

          {viewMode === 'generate' && (
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Gerar Relatório
            </button>
          )}

          {viewMode === 'view' && selectedReport && (
            <>
              <button
                onClick={() => exportReport(selectedReport, 'json')}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
              >
                JSON
              </button>
              <button
                onClick={() => exportReport(selectedReport, 'csv')}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                CSV
              </button>
            </>
          )}

          <button
            onClick={loadReports}
            disabled={isLoading}
            className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
          >
            Atualizar
          </button>
        </div>
      }
    >
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando...</span>
        </div>
      ) : (
        <>
          {viewMode === 'list' && (
            <ReportsList 
              reports={reports} 
              onSelectReport={(report) => {
                setSelectedReport(report);
                setViewMode('view');
              }}
              onExportReport={exportReport}
            />
          )}

          {viewMode === 'generate' && (
            <GenerateReportForm 
              filters={filters}
              setFilters={setFilters}
              availableTenants={availableTenants}
              onGenerate={generateReport}
            />
          )}

          {viewMode === 'view' && selectedReport && (
            <ReportViewer 
              report={selectedReport}
              personalDataMap={personalDataMap}
              onBack={() => setViewMode('list')}
            />
          )}

          {viewMode === 'data_subject_requests' && (
            <DataSubjectRequestsView 
              requests={dataSubjectRequests}
              onProcessRequest={processDataSubjectRequest}
            />
          )}
        </>
      )}
    </InstitutionalLayout>
  );
}

// 📋 Reports List Component
function ReportsList({ 
  reports, 
  onSelectReport, 
  onExportReport 
}: { 
  reports: ComplianceReport[];
  onSelectReport: (report: ComplianceReport) => void;
  onExportReport: (report: ComplianceReport, format: 'pdf' | 'csv' | 'json') => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Relatórios Gerados</h3>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum relatório encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">Gere seu primeiro relatório de compliance.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relatório</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.id}</div>
                      <div className="text-sm text-gray-500">
                        Gerado em {new Date(report.generatedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {report.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.period.start).toLocaleDateString('pt-BR')} - 
                    {new Date(report.period.end).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.score ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.score >= 90 ? 'bg-green-100 text-green-800' :
                        report.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.score}%
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'final' ? 'bg-green-100 text-green-800' :
                      report.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onSelectReport(report)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => onExportReport(report, 'json')}
                      className="text-green-600 hover:text-green-900"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => onExportReport(report, 'csv')}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// 📝 Generate Report Form Component
function GenerateReportForm({ 
  filters, 
  setFilters, 
  availableTenants, 
  onGenerate 
}: {
  filters: ReportFilters;
  setFilters: (filters: ReportFilters) => void;
  availableTenants: any[];
  onGenerate: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Gerar Novo Relatório</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organização *
          </label>
          <select
            value={filters.tenantId}
            onChange={(e) => setFilters({ ...filters, tenantId: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione uma organização</option>
            {availableTenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.displayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Relatório *
          </label>
          <select
            value={filters.reportType}
            onChange={(e) => setFilters({ ...filters, reportType: e.target.value as any })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="lgpd_audit">Auditoria LGPD</option>
            <option value="data_inventory">Inventário de Dados</option>
            <option value="consent_status">Status de Consentimentos</option>
            <option value="security_assessment">Avaliação de Segurança</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Início *
          </label>
          <input
            type="date"
            value={filters.period.start}
            onChange={(e) => setFilters({ 
              ...filters, 
              period: { ...filters.period, start: e.target.value }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Fim *
          </label>
          <input
            type="date"
            value={filters.period.end}
            onChange={(e) => setFilters({ 
              ...filters, 
              period: { ...filters.period, end: e.target.value }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onGenerate}
          disabled={!filters.tenantId}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Gerar Relatório
        </button>
      </div>

      {/* Report Type Descriptions */}
      <div className="mt-8 space-y-4">
        <h4 className="text-md font-medium text-gray-900">Tipos de Relatório:</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900">Auditoria LGPD</h5>
            <p className="text-sm text-gray-600 mt-1">
              Análise completa de conformidade com a Lei Geral de Proteção de Dados, 
              incluindo bases legais, consentimentos e direitos dos titulares.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900">Inventário de Dados</h5>
            <p className="text-sm text-gray-600 mt-1">
              Mapeamento detalhado de todos os dados pessoais processados, 
              categorias, finalidades e bases legais.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900">Status de Consentimentos</h5>
            <p className="text-sm text-gray-600 mt-1">
              Análise do status dos consentimentos coletados, taxas de aceitação 
              e histórico de alterações.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900">Avaliação de Segurança</h5>
            <p className="text-sm text-gray-600 mt-1">
              Análise das medidas de segurança implementadas para proteção 
              dos dados pessoais e detecção de vulnerabilidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 👁️ Report Viewer Component
function ReportViewer({ 
  report, 
  personalDataMap, 
  onBack 
}: { 
  report: ComplianceReport;
  personalDataMap: PersonalDataMap | null;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Relatório: {report.id}
            </h3>
            <p className="text-sm text-gray-500">
              Tipo: {report.type.replace('_', ' ')} | 
              Período: {new Date(report.period.start).toLocaleDateString('pt-BR')} - {new Date(report.period.end).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
          >
            Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {report.score || 'N/A'}%
            </div>
            <div className="text-sm text-gray-500">Score de Compliance</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {report.sections.length}
            </div>
            <div className="text-sm text-gray-500">Seções</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {report.recommendations.length}
            </div>
            <div className="text-sm text-gray-500">Recomendações</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-lg font-semibold ${
              report.status === 'final' ? 'text-green-600' :
              report.status === 'draft' ? 'text-yellow-600' :
              'text-blue-600'
            }`}>
              {report.status}
            </div>
            <div className="text-sm text-gray-500">Status</div>
          </div>
        </div>
      </div>

      {/* Report Sections */}
      {report.sections.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Seções do Relatório</h4>
          <div className="space-y-4">
            {report.sections.map((section, index) => (
              <ReportSectionView key={index} section={section} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recomendações</h4>
          <div className="space-y-3">
            {report.recommendations.map((rec, index) => (
              <RecommendationView key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Personal Data Map (for data inventory reports) */}
      {report.type === 'data_inventory' && personalDataMap && (
        <PersonalDataMapView dataMap={personalDataMap} />
      )}
    </div>
  );
}

// 📊 Report Section View
function ReportSectionView({ section }: { section: ReportSection; key?: React.Key }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-medium text-gray-900">{section.title}</h5>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          section.status === 'compliant' ? 'bg-green-100 text-green-800' :
          section.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {section.status}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{section.content}</p>
      
      {Object.keys(section.metrics).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(section.metrics).map(([key, value]) => (
            <div key={key} className="text-center p-2 bg-gray-50 rounded">
              <div className="text-sm font-semibold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 💡 Recommendation View
function RecommendationView({ recommendation }: { recommendation: ComplianceRecommendation; key?: React.Key }) {
  return (
    <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
        recommendation.priority === 'critical' ? 'bg-red-500' :
        recommendation.priority === 'high' ? 'bg-orange-500' :
        recommendation.priority === 'medium' ? 'bg-yellow-500' :
        'bg-blue-500'
      }`}></div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h6 className="text-sm font-medium text-gray-900">{recommendation.category}</h6>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            recommendation.implemented ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {recommendation.implemented ? 'Implementado' : 'Pendente'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
        <p className="text-sm font-medium text-gray-900 mt-2">{recommendation.action}</p>
        {recommendation.deadline && (
          <p className="text-xs text-gray-500 mt-1">
            Prazo: {new Date(recommendation.deadline).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  );
}

// 🗺️ Personal Data Map View
function PersonalDataMapView({ dataMap }: { dataMap: PersonalDataMap }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Mapa de Dados Pessoais</h4>
      
      <div className="space-y-6">
        {/* Data Categories */}
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Categorias de Dados</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataMap.categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h6 className="font-medium text-gray-900">{category.name}</h6>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.sensitivity === 'restricted' ? 'bg-red-100 text-red-800' :
                    category.sensitivity === 'confidential' ? 'bg-yellow-100 text-yellow-800' :
                    category.sensitivity === 'internal' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {category.sensitivity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                <div className="text-xs text-gray-500">
                  <div>Tipos: {category.dataTypes.join(', ')}</div>
                  <div>Retenção: {category.retentionPeriod} dias</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Processors */}
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Processadores de Dados</h5>
          <div className="space-y-3">
            {dataMap.processors.map((processor) => (
              <div key={processor.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h6 className="font-medium text-gray-900">{processor.name}</h6>
                    <p className="text-sm text-gray-600">{processor.type}</p>
                    <p className="text-sm text-gray-500">{processor.contact.email}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    processor.isEUBased ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {processor.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 📝 Data Subject Requests View
function DataSubjectRequestsView({ 
  requests, 
  onProcessRequest 
}: { 
  requests: DataSubjectRequest[];
  onProcessRequest: (id: string, response: string, action: 'approve' | 'reject') => void;
}) {
  const [selectedRequest, setSelectedRequest] = useState<DataSubjectRequest | null>(null);
  const [response, setResponse] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Solicitações de Direitos dos Titulares (LGPD Art. 18)</h3>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">Não há solicitações de direitos dos titulares pendentes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.id}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {request.description || 'Sem descrição'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {request.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        request.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' && (
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Processar
                        </button>
                      )}
                      {request.status !== 'pending' && (
                        <span className="text-gray-400">Processado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Processar Solicitação: {selectedRequest.type}
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuário</label>
                <p className="text-sm text-gray-900">{selectedRequest.userId}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <p className="text-sm text-gray-600">{selectedRequest.description || 'Sem descrição'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resposta *</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Digite sua resposta ou ação tomada..."
                  required
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setResponse('');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onProcessRequest(selectedRequest.id, response, 'reject');
                  setSelectedRequest(null);
                  setResponse('');
                }}
                disabled={!response.trim()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Rejeitar
              </button>
              <button
                onClick={() => {
                  onProcessRequest(selectedRequest.id, response, 'approve');
                  setSelectedRequest(null);
                  setResponse('');
                }}
                disabled={!response.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🔧 Helper Functions
function downloadCSV(data: any[], filename: string) {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function downloadJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default ComplianceReports;