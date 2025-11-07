/**
 * MasterDashboard - Dashboard Premium 3.0 para usuários MASTER
 * Dashboard completo com visão institucional, métricas avançadas e gestão
 */

import React, { useEffect, useState } from 'react';
import { authService, institutionService, organizationService, userService } from '../../services/premium';
import type { User, UserRole } from '../../types/premium/user';
import type { Institution } from '../../types/premium/institution';
import type { Organization } from '../../types/premium/organization';
import { CreateOrganizationModal, CreateUserModal, EditOrganizationModal, EditUserModal } from './modals';
import { InstitutionConsolidationView } from './consolidation/InstitutionConsolidationView';
import { AIAssistantModal } from './modals/AIAssistantModal';
import { useAI } from '../../src/contexts/AIContext';
import AIFloatingButton from '../shared/AIFloatingButton';
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  activeOrganizations: number;
  masterUsers: number;
  orgAdmins: number;
  regularUsers: number;
  viewers: number;
  recentActivity: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
}

export const MasterDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'organizations' | 'users' | 'activity' | 'consolidation'>('overview');
  
  // AI Context
  const { setCurrentUser: setAIUser, setCurrentInstitution: setAIInstitution, setCurrentOrganizations: setAIOrganizations } = useAI();
  
  // Estados dos modais
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteOrgModal, setShowDeleteOrgModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [consolidationData, setConsolidationData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = authService.getCurrentUser();
      const inst = authService.getCurrentInstitution();
      
      if (!user || !inst) {
        handleLogout();
        return;
      }

      setCurrentUser(user);
      setInstitution(inst);

      // Carregar organizações
      const orgs = await organizationService.list({ institutionId: inst.id });
      setOrganizations(orgs);

      // Carregar usuários
      let usersData = await userService.list({ institutionId: inst.id });
      
      // Garantir que o usuário atual está na lista
      if (!usersData.find(u => u.id === user.id)) {
        usersData = [user, ...usersData];
      }
      
      setUsers(usersData);

      // Sincronizar com AI Context
      setAIUser(user);
      setAIInstitution(inst);
      setAIOrganizations(orgs);

      // Calcular métricas
      calculateMetrics(usersData, orgs);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (usersData: User[], orgsData: Organization[]) => {
    const metrics: DashboardMetrics = {
      totalUsers: usersData.length,
      activeUsers: usersData.filter(u => u.isActive).length,
      totalOrganizations: orgsData.length,
      activeOrganizations: orgsData.filter(o => o.status === 'active').length,
      masterUsers: usersData.filter(u => u.role === 'master').length,
      orgAdmins: usersData.filter(u => u.role === 'org_admin').length,
      regularUsers: usersData.filter(u => u.role === 'user').length,
      viewers: usersData.filter(u => u.role === 'viewer').length,
      recentActivity: usersData.filter(u => u.lastActivityAt && 
        new Date(u.lastActivityAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };
    setMetrics(metrics);
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrg) return;
    
    setIsDeleting(true);
    try {
      const result = await organizationService.delete(selectedOrg.id);
      if (result.success) {
        setShowDeleteOrgModal(false);
        setSelectedOrg(null);
        await loadData(); // Recarregar dados
      } else {
        alert(`Erro ao excluir: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro ao excluir organização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsDeleting(true);
    try {
      await userService.delete(selectedUser.id);
      setShowDeleteUserModal(false);
      setSelectedUser(null);
      await loadData(); // Recarregar dados
    } catch (error) {
      alert(`Erro ao excluir usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSwitchToStandard = () => {
    authService.setVersionPreference('standard');
    window.location.reload();
  };

  const quickActions: QuickAction[] = [
    {
      id: 'create-org',
      title: 'Nova Organização',
      description: 'Criar uma nova organização na instituição',
      icon: '🏢',
      action: () => setShowCreateOrgModal(true),
      variant: 'primary'
    },
    {
      id: 'create-user',
      title: 'Novo Usuário',
      description: 'Adicionar um novo usuário ao sistema',
      icon: '👤',
      action: () => setShowCreateUserModal(true),
      variant: 'success'
    },
    {
      id: 'view-audit',
      title: 'Auditoria',
      description: 'Visualizar logs de auditoria do sistema',
      icon: '📋',
      action: () => {
        setActiveTab('activity');
        // Scroll para a seção de atividades
        setTimeout(() => {
          const activitySection = document.getElementById('activity-section');
          if (activitySection) {
            activitySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      },
      variant: 'secondary'
    },
    {
      id: 'institutional-report',
      title: 'Relatório Institucional',
      description: 'Gerar relatório consolidado da instituição',
      icon: '📊',
      action: () => {
        // Abrir a aba Visão Geral que já tem KPIs e estatísticas
        setActiveTab('overview');
        setTimeout(() => {
          alert(`📊 Relatório Institucional - ${institution?.name}\n\n` +
                `Total de Organizações: ${organizations.length}\n` +
                `Total de Usuários: ${users.length}\n` +
                `Usuários Ativos: ${users.filter(u => u.status === 'active').length}\n\n` +
                `Para exportar dados completos, use os botões de exportação em cada aba.`);
        }, 100);
      },
      variant: 'warning'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">Carregando Dashboard Master...</p>
          <p className="mt-2 text-sm text-gray-500">Preparando visão institucional</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !institution) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sessão Inválida</h2>
          <p className="text-gray-600 mb-6">Não foi possível carregar os dados da sessão.</p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Fazer Login Novamente
          </button>
        </div>
      </div>
    );
  }

  const getVariantClasses = (variant: QuickAction['variant']) => {
    switch (variant) {
      case 'primary': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'success': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'secondary': return 'bg-gray-600 hover:bg-gray-700 text-white';
      default: return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Premium - Versão Compacta */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏢</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {institution.name}
                </h1>
                <p className="text-blue-100 text-xs mt-0.5">
                  SISGEAD Premium 3.0 - Dashboard Master
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{currentUser.profile.name}</p>
                <div className="flex items-center justify-end mt-0.5">
                  <span className="text-lg mr-1">👑</span>
                  <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                    Master
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSwitchToStandard}
                  className="px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg text-xs font-medium hover:bg-opacity-30 transition-all duration-200"
                >
                  ← Modo Standard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                >
                  🚪 Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: '📊' },
              { id: 'organizations', label: 'Organizações', icon: '🏢' },
              { id: 'users', label: 'Usuários', icon: '👥' },
              { id: 'consolidation', label: 'Consolidação', icon: '📋' },
              { id: 'activity', label: 'Atividade', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content - Versão Compacta */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Success Banner - Compacto */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-green-900">
                🎉 Sistema Premium Configurado com Sucesso!
              </h3>
              <p className="text-xs text-green-800 mt-0.5">
                Sua instituição <strong>{institution.name}</strong> está operacional. 
                Você tem acesso completo a todas as funcionalidades multi-tenant.
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Cards - Versão Compacta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metrics && [
                {
                  title: 'Total de Usuários',
                  value: metrics.totalUsers,
                  subtitle: `${metrics.activeUsers} ativos`,
                  icon: '👥',
                  color: 'blue',
                  trend: '+12%'
                },
                {
                  title: 'Organizações',
                  value: metrics.totalOrganizations,
                  subtitle: `${metrics.activeOrganizations} ativas`,
                  icon: '🏢',
                  color: 'green',
                  trend: '+5%'
                },
                {
                  title: 'Administradores',
                  value: metrics.masterUsers + metrics.orgAdmins,
                  subtitle: `${metrics.masterUsers} Masters`,
                  icon: '👑',
                  color: 'purple',
                  trend: '0%'
                },
                {
                  title: 'Atividade (7d)',
                  value: metrics.recentActivity,
                  subtitle: 'Usuários ativos',
                  icon: '📈',
                  color: 'yellow',
                  trend: '+8%'
                }
              ].map((metric, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                      <span className="text-xl">{metric.icon}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      metric.trend.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {metric.trend}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{metric.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Role Distribution Chart */}
            {metrics && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição de Papéis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { role: 'Master', count: metrics.masterUsers, icon: '👑', color: 'bg-purple-500' },
                    { role: 'Admin Org', count: metrics.orgAdmins, icon: '⚙️', color: 'bg-blue-500' },
                    { role: 'Usuário', count: metrics.regularUsers, icon: '👤', color: 'bg-green-500' },
                    { role: 'Visualizador', count: metrics.viewers, icon: '👁️', color: 'bg-gray-500' }
                  ].map((role, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <span className="text-2xl">{role.icon}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{role.count}</p>
                      <p className="text-sm text-gray-600">{role.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions - Versão Compacta */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Ações Rápidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`p-4 rounded-lg transition-all duration-200 text-left ${getVariantClasses(action.variant)} hover:shadow-md hover:transform hover:scale-105`}
                  >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <h4 className="font-semibold text-sm mb-1 text-white">{action.title}</h4>
                    <p className="text-xs text-white font-medium">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'organizations' && (
          <div id="organizations-section" className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Organizações da Instituição</h2>
                <button 
                  onClick={() => setShowCreateOrgModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  + Nova Organização
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {organizations.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma Organização</h3>
                  <p className="text-gray-600">Crie sua primeira organização para começar.</p>
                </div>
              ) : (
                organizations.map((org) => (
                  <div key={org.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`} 
                             style={{ backgroundColor: org.color + '20' }}>
                          <span className="text-xl">{org.icon || '🏢'}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{org.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {org.description || 'Sem descrição'}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium mr-1">ID:</span>
                              <span className="font-mono">{org.id}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Membros:</span>
                              <span>{org.stats?.totalMembers || 0}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Criada em:</span>
                              <span>{new Date(org.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                            {org.parentId && (
                              <div className="flex items-center">
                                <span className="font-medium mr-1">Sub-organização</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedOrg(org);
                            setShowEditOrgModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {org.status === 'active' ? 'Ativa' : org.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div id="users-section" className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Usuários da Instituição</h2>
                <button 
                  onClick={() => setShowCreateUserModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  + Novo Usuário
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum Usuário</h3>
                  <p className="text-gray-600">Convide usuários para sua instituição.</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-white">
                            {user.profile.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{user.profile.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{user.profile.email}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium mr-1">ID:</span>
                              <span className="font-mono">{user.id}</span>
                            </div>
                            {user.profile.department && (
                              <div className="flex items-center">
                                <span className="font-medium mr-1">Depto:</span>
                                <span>{user.profile.department}</span>
                              </div>
                            )}
                            {user.profile.phone && (
                              <div className="flex items-center">
                                <span className="font-medium mr-1">Tel:</span>
                                <span>{user.profile.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Organizações:</span>
                              <span>{user.organizationIds.length}</span>
                            </div>
                            {user.createdAt && (
                              <div className="flex items-center">
                                <span className="font-medium mr-1">Criado em:</span>
                                <span>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditUserModal(true);
                          }}
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'master' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'org_admin' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'member' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'master' ? '👑 Master' :
                           user.role === 'org_admin' ? '👔 Admin' :
                           user.role === 'member' ? '👤 Membro' : '👁️ Viewer'}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-gray-400'}`} 
                              title={user.isActive ? 'Ativo' : 'Inativo'}></span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'consolidation' && (
          <div id="consolidation-section">
            <InstitutionConsolidationView />
          </div>
        )}

        {activeTab === 'activity' && (
          <div id="activity-section" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Atividade Recente</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema de Auditoria</h3>
              <p className="text-gray-600 mb-6">
                O sistema de auditoria será implementado na próxima fase.
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Configurar Auditoria
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            SISGEAD Premium 3.0 • Desenvolvido por <strong>INFINITUS Sistemas Inteligentes</strong> • CNPJ: 09.371.580/0001-06
          </p>
        </div>
      </footer>
      
      {/* Modais */}
      {showCreateOrgModal && institution && (
        <CreateOrganizationModal
          institutionId={institution.id}
          onClose={() => setShowCreateOrgModal(false)}
          onSuccess={() => {
            setShowCreateOrgModal(false);
            loadData(); // Recarregar dados após criar organização
          }}
        />
      )}
      
      {showCreateUserModal && institution && (
        <CreateUserModal
          institutionId={institution.id}
          onClose={() => setShowCreateUserModal(false)}
          onSuccess={() => {
            setShowCreateUserModal(false);
            loadData(); // Recarregar dados após criar usuário
          }}
        />
      )}
      
      {/* Modais de Edição */}
      {showEditOrgModal && selectedOrg && (
        <EditOrganizationModal
          organization={selectedOrg}
          onClose={() => {
            setShowEditOrgModal(false);
            setSelectedOrg(null);
          }}
          onSuccess={(updatedOrg) => {
            setShowEditOrgModal(false);
            setSelectedOrg(null);
            loadData(); // Recarregar dados após editar
          }}
        />
      )}
      
      {showEditUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditUserModal(false);
            setSelectedUser(null);
          }}
          onSuccess={(updatedUser) => {
            setShowEditUserModal(false);
            setSelectedUser(null);
            loadData(); // Recarregar dados após editar
          }}
        />
      )}
      
      {/* Modal de Assistente de IA */}
      {showAIAssistant && (
        <AIAssistantModal
          onClose={() => setShowAIAssistant(false)}
          consolidation={consolidationData}
          organizations={organizations}
          users={users}
        />
      )}
      
      {/* Botão Flutuante Universal de IA */}
      <AIFloatingButton />
    </div>
  );
};

export default MasterDashboard;