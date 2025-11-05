// 🏢 SISGEAD 2.0 - Institutional Reports Component
// Analytics e relatórios cross-tenant para super administradores

import React, { useState, useEffect, useCallback } from 'react';
import { useTenantManager } from '../hooks/useTenantManager';
import { auditService } from '../services/auditService';
import InstitutionalLayout from '../layouts/InstitutionalLayout';
import type { Tenant, AuditLog } from '../types/institutional';

interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  tenants: string[];
  reportType: 'overview' | 'usage' | 'security' | 'performance' | 'audit';
  category?: string;
  severity?: 'low' | 'medium' | 'high';
}

interface TenantMetrics {
  tenantId: string;
  tenantName: string;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalQuestionnaireResponses: number;
    avgResponseTime: number;
    errorRate: number;
    auditLogCount: number;
    lastActivity: string;
    storageUsed: number;
    smartHintsUsed: number;
  };
}

interface SecurityReport {
  tenantId: string;
  tenantName: string;
  securityEvents: {
    failedLogins: number;
    suspiciousActivities: number;
    dataExports: number;
    settingsChanges: number;
    userCreations: number;
    permissionChanges: number;
  };
  riskScore: number;
  lastSecurityAudit: string;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    tenantManager: 'healthy' | 'warning' | 'critical';
    auditService: 'healthy' | 'warning' | 'critical';
    smartHints: 'healthy' | 'warning' | 'critical';
    storage: 'healthy' | 'warning' | 'critical';
  };
  metrics: {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    systemUptime: string;
    avgResponseTime: number;
    errorRate: number;
    storageUsage: number;
  };
}

export function InstitutionalReports() {
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    tenants: [],
    reportType: 'overview'
  });

  const [tenantMetrics, setTenantMetrics] = useState<TenantMetrics[]>([]);
  const [securityReports, setSecurityReports] = useState<SecurityReport[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { availableTenants, isSuperAdmin } = useTenantManager();

  // 📊 Load report data based on filters
  const loadReportData = useCallback(async () => {
    if (!isSuperAdmin) return;

    setIsLoading(true);
    setError(null);

    try {
      switch (filters.reportType) {
        case 'overview':
          await Promise.all([
            loadTenantMetrics(),
            loadSystemHealth()
          ]);
          break;
        case 'usage':
          await loadTenantMetrics();
          break;
        case 'security':
          await loadSecurityReports();
          break;
        case 'audit':
          await loadAuditLogs();
          break;
        default:
          await loadTenantMetrics();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório');
    } finally {
      setIsLoading(false);
    }
  }, [filters, isSuperAdmin]);

  // 📈 Load tenant metrics
  const loadTenantMetrics = useCallback(async () => {
    const metrics: TenantMetrics[] = [];
    
    for (const tenant of availableTenants) {
      // Simulate metrics calculation - in real app, this would query actual data
      const mockMetrics: TenantMetrics = {
        tenantId: tenant.id,
        tenantName: tenant.displayName,
        metrics: {
          totalUsers: Math.floor(Math.random() * 100) + 5,
          activeUsers: Math.floor(Math.random() * 50) + 2,
          totalQuestionnaireResponses: Math.floor(Math.random() * 500) + 10,
          avgResponseTime: Math.random() * 1000 + 200,
          errorRate: Math.random() * 5,
          auditLogCount: Math.floor(Math.random() * 1000) + 50,
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          storageUsed: Math.random() * 1000,
          smartHintsUsed: Math.floor(Math.random() * 200) + 10
        }
      };
      
      metrics.push(mockMetrics);
    }
    
    setTenantMetrics(metrics);
  }, [availableTenants]);

  // 🔒 Load security reports
  const loadSecurityReports = useCallback(async () => {
    const reports: SecurityReport[] = [];
    
    for (const tenant of availableTenants) {
      const mockReport: SecurityReport = {
        tenantId: tenant.id,
        tenantName: tenant.displayName,
        securityEvents: {
          failedLogins: Math.floor(Math.random() * 10),
          suspiciousActivities: Math.floor(Math.random() * 3),
          dataExports: Math.floor(Math.random() * 5),
          settingsChanges: Math.floor(Math.random() * 8),
          userCreations: Math.floor(Math.random() * 15),
          permissionChanges: Math.floor(Math.random() * 6)
        },
        riskScore: Math.floor(Math.random() * 100),
        lastSecurityAudit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      reports.push(mockReport);
    }
    
    setSecurityReports(reports);
  }, [availableTenants]);

  // 🏥 Load system health
  const loadSystemHealth = useCallback(async () => {
    const health: SystemHealth = {
      overall: 'healthy',
      components: {
        tenantManager: 'healthy',
        auditService: 'healthy',
        smartHints: 'healthy',
        storage: 'healthy'
      },
      metrics: {
        totalTenants: availableTenants.length,
        activeTenants: availableTenants.filter(t => t.isActive).length,
        totalUsers: tenantMetrics.reduce((sum, t) => sum + t.metrics.totalUsers, 0),
        systemUptime: '99.9%',
        avgResponseTime: tenantMetrics.length > 0 ? 
          tenantMetrics.reduce((sum, t) => sum + t.metrics.avgResponseTime, 0) / tenantMetrics.length : 0,
        errorRate: tenantMetrics.length > 0 ? 
          tenantMetrics.reduce((sum, t) => sum + t.metrics.errorRate, 0) / tenantMetrics.length : 0,
        storageUsage: tenantMetrics.reduce((sum, t) => sum + t.metrics.storageUsed, 0)
      }
    };
    
    setSystemHealth(health);
  }, [availableTenants, tenantMetrics]);

  // 📝 Load audit logs
  const loadAuditLogs = useCallback(async () => {
    // Simulate getting audit logs - in real app, auditService would have getLogs method
    const mockLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
      id: `log-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 100)}` : undefined,
      tenantId: availableTenants[Math.floor(Math.random() * availableTenants.length)]?.id || 'default',
      action: ['create', 'update', 'delete', 'login', 'export'][Math.floor(Math.random() * 5)] as any,
      resource: ['user', 'tenant', 'questionnaire', 'report'][Math.floor(Math.random() * 4)] as any,
      resourceId: `resource-${Math.floor(Math.random() * 1000)}`,
      category: ['authentication', 'configuration', 'data', 'system', 'compliance'][Math.floor(Math.random() * 5)] as any,
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      description: `Mock audit log entry ${i}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Mock Browser)',
      metadata: { operation: 'mock', index: i }
    }));
    
    setAuditLogs(mockLogs);
  }, [filters, availableTenants]);

  // 📥 Export report
  const exportReport = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      let data: any;
      
      switch (filters.reportType) {
        case 'usage':
          data = tenantMetrics;
          break;
        case 'security':
          data = securityReports;
          break;
        case 'audit':
          data = auditLogs;
          break;
        default:
          data = { tenantMetrics, systemHealth, securityReports };
      }

      if (format === 'csv') {
        downloadCSV(data, `sisgead-report-${filters.reportType}-${new Date().toISOString().split('T')[0]}.csv`);
      } else if (format === 'json') {
        downloadJSON(data, `sisgead-report-${filters.reportType}-${new Date().toISOString().split('T')[0]}.json`);
      } else {
        alert('Exportação para PDF será implementada em breve');
      }

      // Log the export
      auditService.log({
        action: 'export',
        resource: 'report',
        resourceId: filters.reportType,
        category: 'compliance',
        severity: 'medium',
        metadata: {
          format,
          dateRange: filters.dateRange,
          tenantCount: filters.tenants.length || availableTenants.length
        }
      });
      
    } catch (err) {
      setError('Erro ao exportar relatório');
    }
  }, [filters, tenantMetrics, securityReports, auditLogs, systemHealth, availableTenants]);

  // Load data on mount and filter changes
  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // 🔒 Security check
  if (!isSuperAdmin) {
    return (
      <InstitutionalLayout
        title="Acesso Negado"
        subtitle="Apenas super administradores podem acessar relatórios institucionais"
        breadcrumbs={[
          { label: 'Dashboard', href: '#dashboard' },
          { label: 'Relatórios' }
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
      title="Relatórios Institucionais"
      subtitle="Analytics e auditoria cross-tenant"
      breadcrumbs={[
        { label: 'Dashboard', href: '#dashboard' },
        { label: 'Relatórios' }
      ]}
      actions={
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportReport('csv')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => exportReport('json')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Exportar JSON
          </button>
          <button
            onClick={loadReportData}
            disabled={isLoading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm flex items-center space-x-1"
          >
            {isLoading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
            <span>Atualizar</span>
          </button>
        </div>
      }
    >
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={filters.reportType}
              onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="overview">Visão Geral</option>
              <option value="usage">Uso e Performance</option>
              <option value="security">Segurança</option>
              <option value="audit">Auditoria</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizações
            </label>
            <select
              multiple
              value={filters.tenants}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                tenants: Array.from(e.target.selectedOptions, (option: any) => option.value)
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              size={3}
            >
              <option value="">Todas</option>
              {availableTenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error display */}
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

      {/* Report content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando relatório...</span>
        </div>
      ) : (
        <>
          {filters.reportType === 'overview' && (
            <OverviewReport 
              systemHealth={systemHealth}
              tenantMetrics={tenantMetrics}
            />
          )}
          
          {filters.reportType === 'usage' && (
            <UsageReport tenantMetrics={tenantMetrics} />
          )}
          
          {filters.reportType === 'security' && (
            <SecurityReport reports={securityReports} />
          )}
          
          {filters.reportType === 'audit' && (
            <AuditReport logs={auditLogs} />
          )}
        </>
      )}
    </InstitutionalLayout>
  );
}

// 📊 Overview Report Component
function OverviewReport({ systemHealth, tenantMetrics }: { 
  systemHealth: SystemHealth | null;
  tenantMetrics: TenantMetrics[];
}) {
  if (!systemHealth) return null;

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Saúde do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
              systemHealth.overall === 'healthy' ? 'bg-green-100 text-green-600' :
              systemHealth.overall === 'warning' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              {systemHealth.overall === 'healthy' ? '✓' : systemHealth.overall === 'warning' ? '⚠' : '✗'}
            </div>
            <div className="mt-2 text-sm font-medium text-gray-900">Status Geral</div>
            <div className="text-xs text-gray-500 capitalize">{systemHealth.overall}</div>
          </div>
          
          {Object.entries(systemHealth.components).map(([component, status]) => (
            <div key={component} className="text-center">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs ${
                status === 'healthy' ? 'bg-green-100 text-green-600' :
                status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {status === 'healthy' ? '✓' : status === 'warning' ? '⚠' : '✗'}
              </div>
              <div className="mt-1 text-xs font-medium text-gray-900 capitalize">{component}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">{systemHealth.metrics.totalTenants}</div>
            <div className="text-sm text-gray-500">Total Tenants</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{systemHealth.metrics.activeTenants}</div>
            <div className="text-sm text-gray-500">Tenants Ativos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{systemHealth.metrics.totalUsers}</div>
            <div className="text-sm text-gray-500">Usuários Totais</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{systemHealth.metrics.systemUptime}</div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
        </div>
      </div>

      {/* Top Tenants */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Organizações por Uso</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organização</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuários</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respostas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Atividade</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenantMetrics
                .sort((a, b) => b.metrics.totalUsers - a.metrics.totalUsers)
                .slice(0, 5)
                .map((tenant) => (
                  <tr key={tenant.tenantId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tenant.tenantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.metrics.activeUsers}/{tenant.metrics.totalUsers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.metrics.totalQuestionnaireResponses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tenant.metrics.lastActivity).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 📈 Usage Report Component
function UsageReport({ tenantMetrics }: { tenantMetrics: TenantMetrics[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatório de Uso</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organização</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuários</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respostas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Smart Hints</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage (MB)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenantMetrics.map((tenant) => (
              <tr key={tenant.tenantId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tenant.tenantName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.metrics.activeUsers}/{tenant.metrics.totalUsers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.metrics.totalQuestionnaireResponses}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.metrics.smartHintsUsed}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.metrics.storageUsed.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.metrics.avgResponseTime.toFixed(0)}ms
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    tenant.metrics.errorRate < 1 ? 'bg-green-100 text-green-800' :
                    tenant.metrics.errorRate < 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tenant.metrics.errorRate.toFixed(1)}% erro
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 🔒 Security Report Component
function SecurityReport({ reports }: { reports: SecurityReport[] }) {
  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <div key={report.tenantId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{report.tenantName}</h3>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              report.riskScore < 30 ? 'bg-green-100 text-green-800' :
              report.riskScore < 70 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Risk Score: {report.riskScore}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{report.securityEvents.failedLogins}</div>
              <div className="text-sm text-gray-500">Logins Falhados</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{report.securityEvents.suspiciousActivities}</div>
              <div className="text-sm text-gray-500">Atividades Suspeitas</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{report.securityEvents.dataExports}</div>
              <div className="text-sm text-gray-500">Exportações de Dados</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{report.securityEvents.settingsChanges}</div>
              <div className="text-sm text-gray-500">Mudanças Configuração</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{report.securityEvents.userCreations}</div>
              <div className="text-sm text-gray-500">Usuários Criados</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{report.securityEvents.permissionChanges}</div>
              <div className="text-sm text-gray-500">Mudanças Permissões</div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Última auditoria de segurança: {new Date(report.lastSecurityAudit).toLocaleString('pt-BR')}
          </div>
        </div>
      ))}
    </div>
  );
}

// 📝 Audit Report Component
function AuditReport({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs de Auditoria</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severidade</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.userId || 'Sistema'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.resource}{log.resourceId ? ` (${log.resourceId})` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    log.severity === 'low' ? 'bg-green-100 text-green-800' :
                    log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 📥 CSV download helper
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

// 📥 JSON download helper
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

export default InstitutionalReports;