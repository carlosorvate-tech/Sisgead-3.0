// 📊 SISGEAD 2.0 - Super Admin Dashboard
// Dashboard principal para administração institucional multi-tenant

import React, { useState, useEffect, useMemo } from 'react';
import { useTenantManager } from '../hooks/useTenantManager';
import { auditService } from '../services/auditService';
import { tenantStorage } from '../utils/tenantStorage';
import InstitutionalLayout from '../layouts/InstitutionalLayout';
import type { TenantAnalytics } from '../types/institutional';

interface AuditStatistics {
  totalLogs: number;
  logsByAction: Record<string, number>;
  logsByCategory: Record<string, number>;
  logsBySeverity: Record<string, number>;
  recentActivity: any[];
  topUsers: Array<{ userId: string; count: number; name?: string }>;
  criticalAlerts: any[];
}

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalAssessments: number;
  recentActivity: any[];
  systemHealth: 'healthy' | 'warning' | 'error';
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditStats, setAuditStats] = useState<AuditStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  
  const {
    availableTenants,
    currentTenant,
    isMultiTenant,
    isSuperAdmin
  } = useTenantManager();

  // 📊 Load dashboard statistics
  useEffect(() => {
    const loadDashboardStats = async () => {
      setIsLoading(true);
      
      try {
        // Get audit statistics
        const auditData = await auditService.generateStatistics(
          selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
        );
        setAuditStats(auditData);

        // Calculate system statistics
        const storageStats = tenantStorage.getStorageStatistics();
        
        // Mock assessment data (in real app, would come from API)
        const mockAssessments = generateMockAssessmentData();
        
        const dashboardStats: DashboardStats = {
          totalTenants: availableTenants.length,
          activeTenants: availableTenants.filter(t => t.isActive).length,
          totalUsers: auditData.topUsers.length || 5, // Mock data
          totalAssessments: mockAssessments.total,
          recentActivity: auditData.recentActivity,
          systemHealth: calculateSystemHealth(auditData, storageStats),
          storageUsage: {
            used: storageStats.totalSizeKB,
            total: 10240, // 10MB limit for demo
            percentage: (storageStats.totalSizeKB / 10240) * 100
          }
        };

        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardStats();
  }, [availableTenants, selectedPeriod]);

  // 📈 Generate mock assessment data
  const generateMockAssessmentData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        assessments: Math.floor(Math.random() * 50) + 10,
        completions: Math.floor(Math.random() * 40) + 5
      });
    }
    
    return {
      data: data.reverse(),
      total: data.reduce((sum, item) => sum + item.assessments, 0),
      completions: data.reduce((sum, item) => sum + item.completions, 0)
    };
  };

  // 🩺 Calculate system health
  const calculateSystemHealth = (audit: AuditStatistics, storage: any): 'healthy' | 'warning' | 'error' => {
    const criticalIssues = audit.criticalAlerts.length;
    const storageUsage = (storage.totalSizeKB / 10240) * 100;
    
    if (criticalIssues > 0 || storageUsage > 90) return 'error';
    if (storageUsage > 75 || audit.logsBySeverity.high > 10) return 'warning';
    return 'healthy';
  };

  // 🎨 Render loading state
  if (isLoading) {
    return (
      <InstitutionalLayout
        title="Dashboard"
        subtitle="Carregando dados do sistema..."
      >
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </InstitutionalLayout>
    );
  }

  if (!stats || !auditStats) {
    return (
      <InstitutionalLayout
        title="Dashboard"
        subtitle="Erro ao carregar dados"
      >
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Erro ao carregar estatísticas do sistema</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </InstitutionalLayout>
    );
  }

  return (
    <InstitutionalLayout
      title="Dashboard Institucional"
      subtitle={`Visão geral do sistema • ${availableTenants.length} organizações`}
      breadcrumbs={[
        { label: 'Início', href: '#', icon: <HomeIcon /> },
        { label: 'Dashboard' }
      ]}
      actions={
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
            Exportar Relatório
          </button>
        </div>
      }
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Organizações"
          value={stats.activeTenants}
          total={stats.totalTenants}
          icon={<BuildingIcon />}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        
        <StatCard
          title="Usuários Ativos"
          value={stats.totalUsers}
          icon={<UsersIcon />}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        
        <StatCard
          title="Avaliações"
          value={stats.totalAssessments}
          icon={<ChartIcon />}
          trend={{ value: 15, isPositive: true }}
          color="purple"
        />
        
        <StatCard
          title="Status do Sistema"
          value={stats.systemHealth}
          icon={<HealthIcon />}
          color={stats.systemHealth === 'healthy' ? 'green' : 
                 stats.systemHealth === 'warning' ? 'yellow' : 'red'}
          isStatus={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* System Health Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Saúde do Sistema</h3>
          </div>
          <div className="p-6 space-y-4">
            <HealthMetric
              label="Armazenamento"
              value={stats.storageUsage.percentage}
              max={100}
              unit="%"
              status={stats.storageUsage.percentage > 90 ? 'error' : 
                     stats.storageUsage.percentage > 75 ? 'warning' : 'healthy'}
            />
            
            <HealthMetric
              label="Alertas Críticos"
              value={auditStats.criticalAlerts.length}
              max={10}
              unit="alertas"
              status={auditStats.criticalAlerts.length > 5 ? 'error' : 
                     auditStats.criticalAlerts.length > 2 ? 'warning' : 'healthy'}
            />
            
            <HealthMetric
              label="Organizações Ativas"
              value={(stats.activeTenants / stats.totalTenants) * 100}
              max={100}
              unit="%"
              status="healthy"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
          </div>
          <div className="p-6">
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma atividade recente
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index}>
                    <ActivityItem activity={activity} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tenant Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Organizações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criada em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {availableTenants.slice(0, 5).map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-3 w-3 rounded-full ${
                        tenant.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.displayName}
                        </div>
                        {tenant.cnpj && (
                          <div className="text-sm text-gray-500">
                            CNPJ: {formatCNPJ(tenant.cnpj)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tenant.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tenant.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(Math.random() * 50) + 1} usuários
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Ver Detalhes
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Configurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </InstitutionalLayout>
  );
}

// 📊 Statistics Card Component
interface StatCardProps {
  title: string;
  value: number | string;
  total?: number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
  isStatus?: boolean;
}

function StatCard({ title, value, total, icon, trend, color, isStatus }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  const displayValue = isStatus ? 
    (value === 'healthy' ? 'Saudável' : 
     value === 'warning' ? 'Atenção' : 'Crítico') :
    value;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`rounded-md p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {typeof value === 'number' && total ? `${value}/${total}` : displayValue}
            </p>
            {trend && (
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="sr-only">
                  {trend.isPositive ? 'Aumentou' : 'Diminuiu'} em
                </span>
                {trend.isPositive ? '↗' : '↘'} {trend.value}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🩺 Health Metric Component
interface HealthMetricProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  status: 'healthy' | 'warning' | 'error';
}

function HealthMetric({ label, value, max, unit, status }: HealthMetricProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const statusColors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-700 mb-1">
        <span>{label}</span>
        <span>{value} {unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${statusColors[status]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// 📝 Activity Item Component
function ActivityItem({ activity }: { activity: any }) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return '🔓';
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      default: return '📝';
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-lg">{getActionIcon(activity.action)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {activity.metadata?.userName || 'Usuário'} • {activity.action}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {activity.resource} • {new Date(activity.timestamp).toLocaleString('pt-BR')}
        </p>
      </div>
      <div className={`text-xs px-2 py-1 rounded ${
        activity.severity === 'critical' ? 'bg-red-100 text-red-800' :
        activity.severity === 'high' ? 'bg-orange-100 text-orange-800' :
        activity.severity === 'medium' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {activity.severity}
      </div>
    </div>
  );
}

// 🎨 Icon Components
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-2a1 1 0 011-1h1a1 1 0 011 1v2" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const HealthIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// 🔧 Utility function
function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export default SuperAdminDashboard;