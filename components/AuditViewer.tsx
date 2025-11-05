// 📊 SISGEAD 2.0 - Advanced Audit Viewer Component
// Interface avançada para visualização e análise de logs de auditoria

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { securityMonitor } from '../services/securityMonitor';
import { complianceService } from '../services/complianceService';
import { auditService } from '../services/auditService';
import { useTenantManager } from '../hooks/useTenantManager';
import InstitutionalLayout from '../layouts/InstitutionalLayout';
import type { 
  SecurityEvent, 
  SecurityEventType, 
  AuditTrailQuery, 
  AuditTrailResult,
  AuditAggregation 
} from '../types/security';
import type { AuditLog } from '../types/institutional';

interface AuditFilters {
  dateRange: {
    start: string;
    end: string;
  };
  tenants: string[];
  users: string[];
  actions: string[];
  resources: string[];
  severity: string[];
  eventTypes: SecurityEventType[];
  ipAddress: string;
  searchTerm: string;
}

interface ViewMode {
  type: 'audit_logs' | 'security_events' | 'real_time' | 'analytics';
  realTimeEnabled: boolean;
}

export function AuditViewer() {
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'audit_logs', realTimeEnabled: false });
  const [filters, setFilters] = useState<AuditFilters>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    tenants: [],
    users: [],
    actions: [],
    resources: [],
    severity: [],
    eventTypes: [],
    ipAddress: '',
    searchTerm: ''
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [aggregations, setAggregations] = useState<AuditAggregation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | SecurityEvent | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { availableTenants, isSuperAdmin } = useTenantManager();

  // 🔍 Load audit data based on current filters and view mode
  const loadAuditData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (viewMode.type === 'audit_logs' || viewMode.type === 'analytics') {
        // Load audit logs (mock implementation since auditService doesn't have searchLogs)
        const mockLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
          id: `audit-${i}`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          tenantId: 'default',
          userId: `user-${Math.floor(Math.random() * 100)}`,
          action: ['create', 'update', 'delete', 'login', 'export'][Math.floor(Math.random() * 5)] as any,
          resource: ['user', 'tenant', 'questionnaire', 'report'][Math.floor(Math.random() * 4)] as any,
          resourceId: `resource-${Math.floor(Math.random() * 1000)}`,
          category: ['authentication', 'configuration', 'data', 'system', 'compliance'][Math.floor(Math.random() * 5)] as any,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Mock Browser)',
          metadata: { 
            mockData: true 
          }
        }));
        
        let logs = mockLogs;
        
        // Apply additional filters
        let filteredLogs = logs;
        
        if (filters.tenants.length > 0) {
          filteredLogs = filteredLogs.filter(log => 
            filters.tenants.includes(log.metadata?.tenantId || 'default')
          );
        }
        
        if (filters.users.length > 0) {
          filteredLogs = filteredLogs.filter(log => 
            filters.users.includes(log.metadata?.userId || '')
          );
        }
        
        if (filters.resources.length > 0) {
          filteredLogs = filteredLogs.filter(log => 
            filters.resources.includes(log.resource)
          );
        }
        
        if (filters.ipAddress) {
          filteredLogs = filteredLogs.filter(log => 
            log.ipAddress?.includes(filters.ipAddress)
          );
        }
        
        setAuditLogs(filteredLogs);
        
        // Generate aggregations for analytics
        if (viewMode.type === 'analytics') {
          setAggregations(generateAggregations(filteredLogs));
        }
      }

      if (viewMode.type === 'security_events' || viewMode.type === 'real_time') {
        // Load security events
        const events = securityMonitor.getSecurityEvents({
          startDate: new Date(filters.dateRange.start),
          endDate: new Date(filters.dateRange.end),
          type: filters.eventTypes.length === 1 ? filters.eventTypes[0] : undefined,
          severity: filters.severity.length === 1 ? filters.severity[0] : undefined,
          limit: 500
        });
        
        setSecurityEvents(events);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de auditoria');
    } finally {
      setIsLoading(false);
    }
  }, [filters, viewMode]);

  // 🔄 Auto-refresh for real-time mode
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && (viewMode.type === 'real_time' || viewMode.realTimeEnabled)) {
      interval = setInterval(loadAuditData, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, viewMode, loadAuditData]);

  // Load data on filter changes
  useEffect(() => {
    loadAuditData();
  }, [loadAuditData]);

  // 📊 Export functionality
  const exportAuditData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const dataToExport = viewMode.type === 'security_events' ? securityEvents : auditLogs;
      
      if (format === 'csv') {
        downloadCSV(dataToExport, `audit-${viewMode.type}-${new Date().toISOString().split('T')[0]}.csv`);
      } else if (format === 'json') {
        downloadJSON(dataToExport, `audit-${viewMode.type}-${new Date().toISOString().split('T')[0]}.json`);
      } else {
        alert('Exportação PDF será implementada em breve');
      }

      // Log the export action
      auditService.log({
        action: 'create' as any,
        resource: 'audit_export',
        resourceId: `export_${Date.now()}`,
        category: 'compliance',
        severity: 'medium',
        metadata: {
          exportType: viewMode.type,
          format,
          recordCount: dataToExport.length,
          filters
        }
      });
      
    } catch (err) {
      setError('Erro ao exportar dados');
    }
  }, [viewMode.type, auditLogs, securityEvents, filters]);

  // 🔍 Available filter options (computed)
  const filterOptions = useMemo(() => {
    const allLogs = [...auditLogs, ...securityEvents];
    
    return {
      actions: Array.from(new Set(auditLogs.map(log => log.action))),
      resources: Array.from(new Set(auditLogs.map(log => log.resource))),
      users: Array.from(new Set(allLogs.map(log => 
        'metadata' in log ? log.metadata?.securityUserId || log.metadata?.userId : undefined
      ).filter(Boolean))),
      ipAddresses: Array.from(new Set(allLogs.map(log => 
        log.ipAddress
      ).filter(Boolean))),
      eventTypes: [
        'login_success', 'login_failure', 'mfa_challenge', 'mfa_success', 'mfa_failure',
        'session_created', 'session_expired', 'suspicious_activity', 'brute_force_attempt',
        'geolocation_anomaly', 'device_change', 'privilege_escalation', 'data_export',
        'configuration_change', 'security_breach'
      ] as SecurityEventType[]
    };
  }, [auditLogs, securityEvents]);

  // 🎯 Security check
  if (!isSuperAdmin) {
    return (
      <InstitutionalLayout
        title="Acesso Negado"
        subtitle="Apenas super administradores podem acessar os logs de auditoria"
        breadcrumbs={[
          { label: 'Dashboard', href: '#dashboard' },
          { label: 'Auditoria' }
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
      title="Visualizador de Auditoria Avançado"
      subtitle="Análise detalhada de logs e eventos de segurança"
      breadcrumbs={[
        { label: 'Dashboard', href: '#dashboard' },
        { label: 'Segurança', href: '#security' },
        { label: 'Auditoria' }
      ]}
      actions={
        <div className="flex items-center space-x-2">
          {/* View Mode Selector */}
          <select
            value={viewMode.type}
            onChange={(e) => setViewMode(prev => ({ ...prev, type: e.target.value as any }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="audit_logs">Logs de Auditoria</option>
            <option value="security_events">Eventos de Segurança</option>
            <option value="real_time">Monitoramento em Tempo Real</option>
            <option value="analytics">Analytics</option>
          </select>

          {/* Auto-refresh toggle */}
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            Auto-refresh
          </label>

          {/* Export buttons */}
          <button
            onClick={() => exportAuditData('csv')}
            className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
          >
            CSV
          </button>
          <button
            onClick={() => exportAuditData('json')}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            JSON
          </button>
          
          {/* Refresh button */}
          <button
            onClick={loadAuditData}
            disabled={isLoading}
            className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm flex items-center space-x-1"
          >
            {isLoading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
            <span>Atualizar</span>
          </button>
        </div>
      }
    >
      {/* Advanced Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros Avançados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Term */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Busca</label>
            <input
              type="text"
              placeholder="Buscar em logs..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tenants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organizações</label>
            <select
              multiple
              value={filters.tenants}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                tenants: Array.from(e.target.selectedOptions, (option: any) => option.value)
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              size={3}
            >
              {availableTenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Actions/Event Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {viewMode.type === 'security_events' ? 'Tipos de Evento' : 'Ações'}
            </label>
            <select
              multiple
              value={viewMode.type === 'security_events' ? filters.eventTypes : filters.actions}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option: any) => option.value);
                if (viewMode.type === 'security_events') {
                  setFilters(prev => ({ ...prev, eventTypes: values as SecurityEventType[] }));
                } else {
                  setFilters(prev => ({ ...prev, actions: values }));
                }
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              size={3}
            >
              {(viewMode.type === 'security_events' ? filterOptions.eventTypes : filterOptions.actions).map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severidade</label>
            <select
              multiple
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                severity: Array.from(e.target.selectedOptions, (option: any) => option.value)
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              size={3}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          {/* IP Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
            <input
              type="text"
              placeholder="192.168.1.1"
              value={filters.ipAddress}
              onChange={(e) => setFilters(prev => ({ ...prev, ipAddress: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Clear Filters */}
        <div className="mt-4">
          <button
            onClick={() => setFilters({
              dateRange: {
                start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              },
              tenants: [],
              users: [],
              actions: [],
              resources: [],
              severity: [],
              eventTypes: [],
              ipAddress: '',
              searchTerm: ''
            })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

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
          <span className="ml-3 text-gray-600">Carregando dados de auditoria...</span>
        </div>
      ) : (
        <>
          {viewMode.type === 'analytics' && (
            <AnalyticsView aggregations={aggregations} />
          )}
          
          {(viewMode.type === 'audit_logs' || viewMode.type === 'real_time') && (
            <AuditLogsTable 
              logs={auditLogs} 
              onSelectLog={setSelectedLog}
              realTime={viewMode.type === 'real_time'}
            />
          )}
          
          {viewMode.type === 'security_events' && (
            <SecurityEventsTable 
              events={securityEvents} 
              onSelectEvent={setSelectedLog}
            />
          )}
        </>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
        />
      )}
    </InstitutionalLayout>
  );
}

// 📊 Analytics View Component
function AnalyticsView({ aggregations }: { aggregations: AuditAggregation[] }) {
  return (
    <div className="space-y-6">
      {aggregations.map((agg, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
            {agg.field.replace('_', ' ')}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {agg.buckets.slice(0, 8).map((bucket, i) => (
              <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">{bucket.count}</div>
                <div className="text-sm text-gray-500 truncate" title={bucket.key}>
                  {bucket.key}
                </div>
                <div className="text-xs text-gray-400">{bucket.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 📋 Audit Logs Table Component
function AuditLogsTable({ 
  logs, 
  onSelectLog, 
  realTime = false 
}: { 
  logs: AuditLog[]; 
  onSelectLog: (log: AuditLog) => void;
  realTime?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {realTime ? 'Monitoramento em Tempo Real' : 'Logs de Auditoria'}
          </h3>
          <span className="text-sm text-gray-500">{logs.length} registros</span>
        </div>
      </div>
      
      {logs.length === 0 ? (
        <div className="p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum log encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">Ajuste os filtros para visualizar os logs.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.resource}
                    {log.resourceId && <span className="text-gray-400"> ({log.resourceId})</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.severity === 'high' ? 'bg-red-100 text-red-800' :
                      log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onSelectLog(log)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver Detalhes
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

// 🚨 Security Events Table Component
function SecurityEventsTable({ 
  events, 
  onSelectEvent 
}: { 
  events: SecurityEvent[]; 
  onSelectEvent: (event: SecurityEvent) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Eventos de Segurança</h3>
          <span className="text-sm text-gray-500">{events.length} eventos</span>
        </div>
      </div>
      
      {events.length === 0 ? (
        <div className="p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum evento encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">Não há eventos de segurança no período selecionado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      event.severity === 'error' ? 'bg-orange-100 text-orange-800' :
                      event.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {event.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.resolved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.resolved ? 'Resolvido' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onSelectEvent(event)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver Detalhes
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

// 🔍 Log Detail Modal
function LogDetailModal({ 
  log, 
  onClose 
}: { 
  log: AuditLog | SecurityEvent; 
  onClose: () => void;
}) {
  const isSecurityEvent = 'type' in log;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {isSecurityEvent ? 'Detalhes do Evento de Segurança' : 'Detalhes do Log de Auditoria'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID</label>
              <p className="text-sm text-gray-900">{log.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timestamp</label>
              <p className="text-sm text-gray-900">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {isSecurityEvent ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Evento</label>
                  <p className="text-sm text-gray-900">{log.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severidade</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    log.severity === 'error' ? 'bg-orange-100 text-orange-800' :
                    log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.severity}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <p className="text-sm text-gray-900">{log.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuário</label>
                  <p className="text-sm text-gray-900">{log.userId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tenant</label>
                  <p className="text-sm text-gray-900">{log.tenantId}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ação</label>
                  <p className="text-sm text-gray-900">{log.action}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recurso</label>
                  <p className="text-sm text-gray-900">
                    {log.resource}
                    {log.resourceId && <span className="text-gray-400"> ({log.resourceId})</span>}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <p className="text-sm text-gray-900">{log.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severidade</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    log.severity === 'high' ? 'bg-red-100 text-red-800' :
                    log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {log.severity}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">IP Address</label>
              <p className="text-sm text-gray-900">{log.ipAddress || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User Agent</label>
              <p className="text-sm text-gray-900 truncate" title={log.userAgent}>
                {log.userAgent || 'N/A'}
              </p>
            </div>
          </div>

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metadados</label>
              <div className="bg-gray-50 rounded-md p-3">
                <pre className="text-xs text-gray-800 overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// 🔧 Helper Functions
function generateAggregations(logs: AuditLog[]): AuditAggregation[] {
  const aggregations: AuditAggregation[] = [];
  
  // Action aggregation
  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  aggregations.push({
    field: 'action',
    buckets: Object.entries(actionCounts).map(([key, count]) => ({
      key,
      count,
      percentage: (count / logs.length) * 100
    })).sort((a, b) => b.count - a.count)
  });

  // Resource aggregation
  const resourceCounts = logs.reduce((acc, log) => {
    acc[log.resource] = (acc[log.resource] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  aggregations.push({
    field: 'resource',
    buckets: Object.entries(resourceCounts).map(([key, count]) => ({
      key,
      count,
      percentage: (count / logs.length) * 100
    })).sort((a, b) => b.count - a.count)
  });

  // Severity aggregation
  const severityCounts = logs.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  aggregations.push({
    field: 'severity',
    buckets: Object.entries(severityCounts).map(([key, count]) => ({
      key,
      count,
      percentage: (count / logs.length) * 100
    })).sort((a, b) => b.count - a.count)
  });

  return aggregations;
}

function downloadCSV(data: any[], filename: string) {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      return `"${String(value || '').replace(/"/g, '""')}"`;
    }).join(','))
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

export default AuditViewer;