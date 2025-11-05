// 🏢 SISGEAD 2.0 - Tenant Selector Component
// Interface responsiva para seleção e gestão de tenants

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTenantManager } from '../hooks/useTenantManager';
import { auditService } from '../services/auditService';
import type { Tenant } from '../types/institutional';

interface TenantSelectorProps {
  className?: string;
  showCreateButton?: boolean;
  showManageButton?: boolean;
  compact?: boolean;
  onTenantChange?: (tenant: Tenant) => void;
  onCreateTenant?: () => void;
  onManageTenants?: () => void;
}

export function TenantSelector({
  className = '',
  showCreateButton = false,
  showManageButton = false,
  compact = false,
  onTenantChange,
  onCreateTenant,
  onManageTenants
}: TenantSelectorProps) {
  const {
    currentTenant,
    availableTenants,
    switchTenant,
    isMultiTenant,
    isSuperAdmin,
    isLoading,
    error
  } = useTenantManager();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  // 🔍 Filter tenants based on search
  const filteredTenants = useMemo(() => {
    if (!searchTerm) return availableTenants;
    
    return availableTenants.filter(tenant =>
      tenant.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.cnpj?.includes(searchTerm)
    );
  }, [availableTenants, searchTerm]);

  // 🔄 Handle tenant switching
  const handleTenantSwitch = useCallback(async (tenantId: string) => {
    if (tenantId === currentTenant?.id) {
      setIsOpen(false);
      return;
    }

    setSwitchingTo(tenantId);
    
    try {
      const result = await switchTenant(tenantId);
      
      if (result.success && result.data) {
        // Log tenant switch for audit
        auditService.log({
          action: 'system_access',
          resource: 'tenant',
          resourceId: tenantId,
          category: 'authentication',
          severity: 'medium',
          metadata: {
            previousTenant: currentTenant?.id,
            newTenant: tenantId,
            operation: 'tenant_switch'
          }
        });

        onTenantChange?.(result.data);
        setIsOpen(false);
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error switching tenant:', error);
    } finally {
      setSwitchingTo(null);
    }
  }, [currentTenant, switchTenant, onTenantChange]);

  // 🎨 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as Element;
        const dropdown = document.getElementById('tenant-selector-dropdown');
        const button = document.getElementById('tenant-selector-button');
        
        if (dropdown && button && 
            !dropdown.contains(target) && 
            !button.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 🚫 Don't render if only one tenant and not super admin
  if (!isMultiTenant && !isSuperAdmin && !showCreateButton) {
    return null;
  }

  // 🎯 Compact mode for mobile/small spaces
  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          id="tenant-selector-button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          disabled={isLoading}
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="truncate max-w-[120px]">
            {currentTenant?.displayName || 'Selecionar'}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div 
            id="tenant-selector-dropdown"
            className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <TenantDropdownContent
              tenants={filteredTenants}
              currentTenant={currentTenant}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleTenantSwitch={handleTenantSwitch}
              switchingTo={switchingTo}
              showCreateButton={showCreateButton}
              showManageButton={showManageButton}
              onCreateTenant={onCreateTenant}
              onManageTenants={onManageTenants}
              isSuperAdmin={isSuperAdmin}
            />
          </div>
        )}
      </div>
    );
  }

  // 🖥️ Full mode for desktop
  return (
    <div className={`relative ${className}`}>
      <button
        id="tenant-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        disabled={isLoading}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {currentTenant?.displayName || 'Selecionar Organização'}
            </div>
            {currentTenant?.cnpj && (
              <div className="text-sm text-gray-500">
                CNPJ: {formatCNPJ(currentTenant.cnpj)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {error && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}

      {isOpen && (
        <div 
          id="tenant-selector-dropdown"
          className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
        >
          <TenantDropdownContent
            tenants={filteredTenants}
            currentTenant={currentTenant}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleTenantSwitch={handleTenantSwitch}
            switchingTo={switchingTo}
            showCreateButton={showCreateButton}
            showManageButton={showManageButton}
            onCreateTenant={onCreateTenant}
            onManageTenants={onManageTenants}
            isSuperAdmin={isSuperAdmin}
          />
        </div>
      )}
    </div>
  );
}

// 📋 Internal dropdown content component
interface TenantDropdownContentProps {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleTenantSwitch: (tenantId: string) => void;
  switchingTo: string | null;
  showCreateButton: boolean;
  showManageButton: boolean;
  onCreateTenant?: () => void;
  onManageTenants?: () => void;
  isSuperAdmin: boolean;
}

function TenantDropdownContent({
  tenants,
  currentTenant,
  searchTerm,
  setSearchTerm,
  handleTenantSwitch,
  switchingTo,
  showCreateButton,
  showManageButton,
  onCreateTenant,
  onManageTenants,
  isSuperAdmin
}: TenantDropdownContentProps) {
  return (
    <>
      {/* Search Input */}
      {tenants.length > 3 && (
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar organização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Tenant List */}
      <div className="max-h-64 overflow-y-auto">
        {tenants.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'Nenhuma organização encontrada' : 'Nenhuma organização disponível'}
          </div>
        ) : (
          tenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => handleTenantSwitch(tenant.id)}
              disabled={switchingTo === tenant.id}
              className={`w-full text-left p-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                currentTenant?.id === tenant.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                      tenant.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {tenant.displayName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {tenant.cnpj ? `CNPJ: ${formatCNPJ(tenant.cnpj)}` : tenant.name}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {switchingTo === tenant.id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  )}
                  {currentTenant?.id === tenant.id && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Action Buttons */}
      {(showCreateButton || showManageButton) && (
        <div className="border-t border-gray-100 p-2 space-y-1">
          {showCreateButton && isSuperAdmin && (
            <button
              onClick={() => {
                onCreateTenant?.();
                // Close dropdown would be handled by parent
              }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Criar Nova Organização</span>
            </button>
          )}
          
          {showManageButton && isSuperAdmin && (
            <button
              onClick={() => {
                onManageTenants?.();
                // Close dropdown would be handled by parent
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Gerenciar Organizações</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}

// 🎨 Quick tenant indicator for status bars
export function TenantIndicator({ className = '' }: { className?: string }) {
  const { currentTenant, isMultiTenant } = useTenantManager();
  
  if (!isMultiTenant || !currentTenant) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      <span className="text-sm text-gray-600 truncate">
        {currentTenant.displayName}
      </span>
    </div>
  );
}

// 🎨 Tenant badge component
export function TenantBadge({ 
  tenant, 
  size = 'md',
  showCNPJ = true,
  className = ''
}: {
  tenant: Tenant;
  size?: 'sm' | 'md' | 'lg';
  showCNPJ?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={`inline-flex items-center space-x-2 bg-gray-100 rounded-full ${sizeClasses[size]} ${className}`}>
      <div className={`w-2 h-2 rounded-full ${tenant.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      <span className="font-medium text-gray-900">{tenant.displayName}</span>
      {showCNPJ && tenant.cnpj && size !== 'sm' && (
        <span className="text-gray-500">
          {formatCNPJ(tenant.cnpj)}
        </span>
      )}
    </div>
  );
}

// 🔧 Utility function for CNPJ formatting
function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export default TenantSelector;