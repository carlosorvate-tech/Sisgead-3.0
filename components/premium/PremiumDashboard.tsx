/**
 * PremiumDashboard - Dashboard Master Premium 3.0
 * Dashboard completo com visão institucional, métricas e gestão
 */

import React, { useEffect, useState } from 'react';
import { authService, institutionService, organizationService, userService } from '../../services/premium';
import type { User, UserRole } from '../../types/premium/user';
import type { Institution } from '../../types/premium/institution';
import type { Organization } from '../../types/premium/organization';

export const PremiumDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
      const usersData = await userService.list({ institutionId: inst.id });
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  const handleChangeVersion = () => {
    // Fazer logout e limpar preferência de versão para mostrar seletor
    authService.logout();
    localStorage.removeItem('sisgead-version');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !institution) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                🏢 {institution.name}
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
                SISGEAD Premium 3.0 - Sistema Multi-tenant
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.profile.name}</p>
                <p className="text-xs text-gray-500">
                  {currentUser.role === 'master' ? '👑 Master' : 
                   currentUser.role === 'org_admin' ? '⚙️ Admin Organizacional' :
                   currentUser.role === 'user' ? '👤 Usuário' : '👁️ Visualizador'}
                </p>
              </div>

              <button
                onClick={handleChangeVersion}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
                title="Trocar versão do sistema"
              >
                🔄 Trocar Versão
              </button>
              
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Stats Cards - Compacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Organizações</p>
                <p className="text-xl font-bold text-gray-900">{organizations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Usuários</p>
                <p className="text-xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Seu Papel</p>
                <p className="text-base font-bold text-gray-900">
                  {currentUser.role === 'master' ? 'Master' : 
                   currentUser.role === 'org_admin' ? 'Admin Org' :
                   currentUser.role === 'user' ? 'Usuário' : 'Visualizador'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid - Funcionalidades Principais */}
        <div className="bg-white rounded-lg shadow mb-4">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Ações Principais</h2>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Nova Avaliação */}
            <button className="flex flex-col items-center p-3 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 group-hover:bg-blue-200">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Nova Avaliação</span>
              <span className="text-xs text-gray-500 mt-1 text-center">Criar e enviar links</span>
            </button>

            {/* Avaliações Ativas */}
            <button className="flex flex-col items-center p-3 rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2 group-hover:bg-green-200">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Avaliações Ativas</span>
              <span className="text-xs text-gray-500 mt-1 text-center">Acompanhar respostas</span>
            </button>

            {/* Relatórios */}
            <button className="flex flex-col items-center p-3 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2 group-hover:bg-purple-200">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Relatórios</span>
              <span className="text-xs text-gray-500 mt-1 text-center">Análises e gráficos</span>
            </button>

            {/* Organizações */}
            <button className="flex flex-col items-center p-3 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2 group-hover:bg-orange-200">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Organizações</span>
              <span className="text-xs text-gray-500 mt-1 text-center">Gerenciar {organizations.length}</span>
            </button>

            {/* Usuários */}
            <button className="flex flex-col items-center p-3 rounded-lg border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2 group-hover:bg-indigo-200">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Usuários</span>
              <span className="text-xs text-gray-500 mt-1 text-center">Gerenciar {users.length}</span>
            </button>

            {/* Documentos */}
            <button className="flex flex-col items-center p-3 rounded-lg border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-2 group-hover:bg-yellow-200">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Documentos</span>
              <span className="text-xs text-gray-500 mt-1 text-center">PDFs e Word</span>
            </button>

            {/* Configurações */}
            <button className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-gray-200">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Configurações</span>
              <span className="text-xs text-gray-500 mt-1 text-center">Inst e perfil</span>
            </button>

            {/* Ajuda */}
            <button className="flex flex-col items-center p-3 rounded-lg border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-2 group-hover:bg-pink-200">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Ajuda</span>
              <span className="text-xs text-gray-500 mt-1 text-center">Suporte e guias</span>
            </button>
          </div>
        </div>

        {/* Quick Summary - Organizações */}
        {organizations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Suas Organizações ({organizations.length})</h3>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Ver todas →</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {organizations.slice(0, 4).map((org) => (
                <div key={org.id} className="flex items-center p-2 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-base">{org.icon || '🏢'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{org.name}</p>
                    <p className="text-xs text-gray-500 truncate">{org.description || 'Sem descrição'}</p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                    org.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {org.status === 'ACTIVE' ? '●' : '○'}
                  </span>
                </div>
              ))}
            </div>
            {organizations.length > 4 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                +{organizations.length - 4} organização(ões) não exibida(s)
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
