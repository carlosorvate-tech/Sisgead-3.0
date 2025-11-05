// 🏢 SISGEAD 2.0 - Institutional Layout
// Layout especializado para painel de administração institucional

import React, { useState, useEffect } from 'react';
import { useTenantManager, usePermissions } from '../hooks/useTenantManager';
import { auditService } from '../services/auditService';
import TenantSelector from '../components/TenantSelector';

interface InstitutionalLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showTenantSelector?: boolean;
  showBreadcrumbs?: boolean;
  breadcrumbs?: Array<{ label: string; href?: string; icon?: React.ReactNode }>;
  actions?: React.ReactNode;
  className?: string;
}

export function InstitutionalLayout({
  children,
  title = 'Painel Institucional',
  subtitle,
  showTenantSelector = true,
  showBreadcrumbs = true,
  breadcrumbs = [],
  actions,
  className = ''
}: InstitutionalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const {
    currentTenant,
    isMultiTenant,
    isSuperAdmin,
    context
  } = useTenantManager();
  
  const { hasPermission } = usePermissions();

  // 📊 Load recent notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const criticalAlerts = await auditService.getCriticalAlerts(5);
        setNotifications(criticalAlerts);
      } catch (error) {
        console.warn('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, [currentTenant]);

  // 🎨 Navigation items based on permissions
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '#dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
      show: true
    },
    {
      name: 'Organizações',
      href: '#tenants',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-2a1 1 0 011-1h1a1 1 0 011 1v2" />
        </svg>
      ),
      show: isSuperAdmin || hasPermission('tenants', 'read')
    },
    {
      name: 'Usuários',
      href: '#users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      show: hasPermission('users', 'read')
    },
    {
      name: 'Relatórios',
      href: '#reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      show: hasPermission('reports', 'read')
    },
    {
      name: 'Auditoria',
      href: '#audit',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      show: isSuperAdmin || hasPermission('audit', 'read')
    },
    {
      name: 'Configurações',
      href: '#settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      show: hasPermission('configuration', 'read')
    }
  ].filter(item => item.show);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Logo & branding */}
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">SG</span>
              </div>
            </div>
            <div className="ml-3 text-white">
              <div className="text-sm font-semibold">SISGEAD</div>
              <div className="text-xs opacity-75">Institucional</div>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-blue-700 p-1 rounded-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400 group-hover:text-gray-500 mr-3">
                  {item.icon}
                </span>
                {item.name}
              </a>
            ))}
          </div>
        </nav>

        {/* Tenant info in sidebar */}
        {currentTenant && isMultiTenant && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Organização Ativa</div>
            <div className="text-sm font-medium text-gray-900 truncate">
              {currentTenant.displayName}
            </div>
            {currentTenant.cnpj && (
              <div className="text-xs text-gray-500">
                CNPJ: {formatCNPJ(currentTenant.cnpj)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Page title and breadcrumbs */}
              <div className="ml-4 lg:ml-0">
                {showBreadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="flex mb-2" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                      {breadcrumbs.map((crumb, index) => (
                        <li key={index} className="flex items-center">
                          {index > 0 && (
                            <svg className="flex-shrink-0 h-4 w-4 text-gray-300 mx-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <div className="flex items-center">
                            {crumb.icon && (
                              <span className="text-gray-400 mr-2">{crumb.icon}</span>
                            )}
                            {crumb.href ? (
                              <a href={crumb.href} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                                {crumb.label}
                              </a>
                            ) : (
                              <span className="text-sm font-medium text-gray-900">{crumb.label}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
                
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right side of top bar */}
            <div className="flex items-center space-x-4">
              {/* Tenant selector */}
              {showTenantSelector && isMultiTenant && (
                <div className="hidden sm:block">
                  <TenantSelector 
                    compact={true}
                    showCreateButton={isSuperAdmin}
                    showManageButton={isSuperAdmin}
                  />
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h5m4 0v2M7 7v10M15 7v4" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>

              {/* User menu */}
              <div className="relative">
                <button className="flex items-center p-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                    <span className="text-sm font-medium text-gray-700">
                      {context.userRole === 'super_admin' ? 'SA' : 'AD'}
                    </span>
                  </div>
                  <span className="hidden sm:block">
                    {context.userRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </button>
              </div>

              {/* Actions */}
              {actions && (
                <div className="flex items-center space-x-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// 🔧 Utility function for CNPJ formatting
function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export default InstitutionalLayout;