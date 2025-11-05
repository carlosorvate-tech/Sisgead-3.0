// 🏢 SISGEAD 2.0 - Tenant Manager Component
// Interface CRUD completa para gestão de organizações (tenants)

import React, { useState, useEffect, useCallback } from 'react';
import { useTenantManager } from '../hooks/useTenantManager';
import { auditService } from '../services/auditService';
import { cpfValidator, formatCPF } from '../utils/cpfValidator';
import InstitutionalLayout from '../layouts/InstitutionalLayout';
import type { Tenant, TenantOperationResult } from '../types/institutional';

interface TenantFormData {
  name: string;
  displayName: string;
  cnpj: string;
  domain: string;
  isActive: boolean;
  settings: {
    branding: {
      primaryColor: string;
      secondaryColor: string;
      logo: string;
    };
    features: {
      smartHintsEnabled: boolean;
      auditLoggingLevel: 'basic' | 'detailed' | 'comprehensive';
      maxUsers: number;
      dataRetentionDays: number;
    };
    security: {
      requireTwoFactor: boolean;
      sessionTimeout: number;
      ipWhitelist: string[];
    };
    locale: {
      language: string;
      currency: string;
      timezone: string;
      dateFormat: string;
    };
  };
  metadata: {
    contactEmail: string;
    contactPhone: string;
    address: {
      street: string;
      number: string;
      complement: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    lgpdCompliant: boolean;
    dataRegion: 'br-south' | 'br-southeast' | 'br-northeast';
  };
}

type ViewMode = 'list' | 'create' | 'edit' | 'details';

export function TenantManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<TenantFormData>(getEmptyFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const {
    availableTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    isSuperAdmin
  } = useTenantManager();

  // 🔍 Filtered tenants based on search and status
  const filteredTenants = availableTenants.filter(tenant => {
    const matchesSearch = !searchTerm || 
      tenant.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.cnpj?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && tenant.isActive) ||
      (filterStatus === 'inactive' && !tenant.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // 📝 Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result: TenantOperationResult<Tenant>;
      
      if (viewMode === 'create') {
        result = await createTenant(formData);
      } else if (viewMode === 'edit' && selectedTenant) {
        result = await updateTenant(selectedTenant.id, formData);
      } else {
        throw new Error('Invalid operation');
      }

      if (result.success) {
        // Log the operation
        auditService.log({
          action: viewMode === 'create' ? 'create' : 'update',
          resource: 'tenant',
          resourceId: result.data?.id,
          newValue: formData,
          oldValue: viewMode === 'edit' ? selectedTenant : undefined,
          category: 'configuration',
          severity: 'medium',
          metadata: {
            operation: viewMode,
            tenantName: formData.displayName
          }
        });

        setViewMode('list');
        setSelectedTenant(null);
        setFormData(getEmptyFormData());
      } else {
        setError(result.error || 'Erro ao salvar organização');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, selectedTenant, formData, createTenant, updateTenant]);

  // 🗑️ Handle tenant deletion
  const handleDelete = useCallback(async (tenant: Tenant) => {
    if (!confirm(`Tem certeza que deseja excluir a organização "${tenant.displayName}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteTenant(tenant.id);
      
      if (result.success) {
        auditService.log({
          action: 'delete',
          resource: 'tenant',
          resourceId: tenant.id,
          oldValue: tenant,
          category: 'configuration',
          severity: 'high',
          metadata: {
            operation: 'delete',
            tenantName: tenant.displayName
          }
        });
      } else {
        setError(result.error || 'Erro ao excluir organização');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  }, [deleteTenant]);

  // ✏️ Edit tenant
  const handleEdit = useCallback((tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      displayName: tenant.displayName,
      cnpj: tenant.cnpj || '',
      domain: tenant.domain || '',
      isActive: tenant.isActive,
      settings: {
        branding: {
          primaryColor: tenant.settings.branding?.primaryColor || '#3B82F6',
          secondaryColor: tenant.settings.branding?.secondaryColor || '#64748B',
          logo: tenant.settings.branding?.logo || ''
        },
        features: {
          smartHintsEnabled: tenant.settings.features?.smartHintsEnabled ?? true,
          auditLoggingLevel: tenant.settings.features?.auditLoggingLevel || 'basic',
          maxUsers: tenant.settings.features?.maxUsers || 100,
          dataRetentionDays: tenant.settings.features?.dataRetentionDays || 90
        },
        security: {
          requireTwoFactor: tenant.settings.security?.requireTwoFactor ?? false,
          sessionTimeout: tenant.settings.security?.sessionTimeout || 480,
          ipWhitelist: tenant.settings.security?.ipWhitelist || []
        },
        locale: {
          language: tenant.settings.locale?.language || 'pt-BR',
          currency: tenant.settings.locale?.currency || 'BRL',
          timezone: tenant.settings.locale?.timezone || 'America/Sao_Paulo',
          dateFormat: tenant.settings.locale?.dateFormat || 'DD/MM/YYYY'
        }
      },
      metadata: {
        contactEmail: tenant.metadata?.contactEmail || '',
        contactPhone: tenant.metadata?.contactPhone || '',
        address: {
          street: tenant.metadata?.address?.street || '',
          number: tenant.metadata?.address?.number || '',
          complement: tenant.metadata?.address?.complement || '',
          neighborhood: tenant.metadata?.address?.neighborhood || '',
          city: tenant.metadata?.address?.city || '',
          state: tenant.metadata?.address?.state || '',
          zipCode: tenant.metadata?.address?.zipCode || '',
          country: tenant.metadata?.address?.country || 'Brasil'
        },
        lgpdCompliant: tenant.metadata?.lgpdCompliant ?? true,
        dataRegion: tenant.metadata?.dataRegion || 'br-southeast'
      }
    });
    setViewMode('edit');
    setError(null);
  }, []);

  // 📄 View tenant details
  const handleViewDetails = useCallback((tenant: Tenant) => {
    setSelectedTenant(tenant);
    setViewMode('details');
  }, []);

  // 🔙 Go back to list
  const handleBack = useCallback(() => {
    setViewMode('list');
    setSelectedTenant(null);
    setFormData(getEmptyFormData());
    setError(null);
  }, []);

  // 🎨 Render based on current view mode
  if (viewMode === 'list') {
    return (
      <InstitutionalLayout
        title="Gestão de Organizações"
        subtitle={`${availableTenants.length} organizações cadastradas`}
        breadcrumbs={[
          { label: 'Dashboard', href: '#dashboard' },
          { label: 'Organizações' }
        ]}
        actions={
          isSuperAdmin ? (
            <button
              onClick={() => setViewMode('create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nova Organização</span>
            </button>
          ) : undefined
        }
      >
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar organizações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
              </select>
              
              <div className="text-sm text-gray-500">
                {filteredTenants.length} de {availableTenants.length}
              </div>
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

        {/* Tenants list */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredTenants.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-2a1 1 0 011-1h1a1 1 0 011 1v2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Nenhuma organização encontrada' : 'Nenhuma organização cadastrada'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece criando uma nova organização'}
              </p>
            </div>
          ) : (
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
                      Configurações
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
                  {filteredTenants.map((tenant) => 
                    <TenantRow
                      key={tenant.id}
                      tenant={tenant}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewDetails={handleViewDetails}
                      canEdit={isSuperAdmin}
                      canDelete={isSuperAdmin && tenant.id !== 'default'}
                    />
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </InstitutionalLayout>
    );
  }

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <InstitutionalLayout
        title={viewMode === 'create' ? 'Nova Organização' : 'Editar Organização'}
        subtitle={viewMode === 'create' ? 'Criar uma nova organização no sistema' : `Editando: ${selectedTenant?.displayName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '#dashboard' },
          { label: 'Organizações', href: '#tenants' },
          { label: viewMode === 'create' ? 'Nova' : 'Editar' }
        ]}
        actions={
          <button
            onClick={handleBack}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
        }
      >
        <TenantForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          mode={viewMode}
        />
      </InstitutionalLayout>
    );
  }

  if (viewMode === 'details' && selectedTenant) {
    return (
      <InstitutionalLayout
        title={selectedTenant.displayName}
        subtitle="Detalhes da organização"
        breadcrumbs={[
          { label: 'Dashboard', href: '#dashboard' },
          { label: 'Organizações', href: '#tenants' },
          { label: selectedTenant.displayName }
        ]}
        actions={
          <div className="flex space-x-2">
            {isSuperAdmin && (
              <button
                onClick={() => handleEdit(selectedTenant)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Editar
              </button>
            )}
            <button
              onClick={handleBack}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Voltar
            </button>
          </div>
        }
      >
        <TenantDetails tenant={selectedTenant} />
      </InstitutionalLayout>
    );
  }

  return null;
}

// 📋 Tenant Row Component
interface TenantRowProps {
  key: string;
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onViewDetails: (tenant: Tenant) => void;
  canEdit: boolean;
  canDelete: boolean;
}

function TenantRow({ tenant, onEdit, onDelete, onViewDetails, canEdit, canDelete }: TenantRowProps) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-3 w-3 rounded-full ${
            tenant.isActive ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {tenant.displayName}
            </div>
            <div className="text-sm text-gray-500">
              ID: {tenant.name}
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="space-y-1">
          <div>Smart Hints: {tenant.settings.features?.smartHintsEnabled ? '✓' : '✗'}</div>
          <div>Audit Level: {tenant.settings.features?.auditLoggingLevel || 'basic'}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(tenant)}
            className="text-blue-600 hover:text-blue-900"
          >
            Ver
          </button>
          {canEdit && (
            <button
              onClick={() => onEdit(tenant)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Editar
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(tenant)}
              className="text-red-600 hover:text-red-900"
            >
              Excluir
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// 📝 Tenant Form Component (simplified for space)
interface TenantFormProps {
  formData: TenantFormData;
  setFormData: (data: TenantFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  mode: 'create' | 'edit';
}

function TenantForm({ formData, setFormData, onSubmit, isLoading, error, mode }: TenantFormProps) {
  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    const newData = { ...formData };
    let current = newData as any;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setFormData(newData);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Organização *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Interno *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={mode === 'edit'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNPJ
            </label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => updateField('cnpj', formatCPF(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domínio
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => updateField('domain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="organizacao.com.br"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Organização ativa</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : null}
          {mode === 'create' ? 'Criar Organização' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
}

// 📄 Tenant Details Component (simplified)
function TenantDetails({ tenant }: { tenant: Tenant }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">Nome</dt>
            <dd className="text-sm text-gray-900">{tenant.displayName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="text-sm text-gray-900">{tenant.name}</dd>
          </div>
          {tenant.cnpj && (
            <div>
              <dt className="text-sm font-medium text-gray-500">CNPJ</dt>
              <dd className="text-sm text-gray-900">{formatCNPJ(tenant.cnpj)}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="text-sm text-gray-900">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                tenant.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {tenant.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Criada em</dt>
            <dd className="text-sm text-gray-900">{new Date(tenant.createdAt).toLocaleString('pt-BR')}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Última atualização</dt>
            <dd className="text-sm text-gray-900">{new Date(tenant.updatedAt).toLocaleString('pt-BR')}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔧 Helper function to get empty form data
function getEmptyFormData(): TenantFormData {
  return {
    name: '',
    displayName: '',
    cnpj: '',
    domain: '',
    isActive: true,
    settings: {
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#64748B',
        logo: ''
      },
      features: {
        smartHintsEnabled: true,
        auditLoggingLevel: 'basic',
        maxUsers: 100,
        dataRetentionDays: 90
      },
      security: {
        requireTwoFactor: false,
        sessionTimeout: 480,
        ipWhitelist: []
      },
      locale: {
        language: 'pt-BR',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        dateFormat: 'DD/MM/YYYY'
      }
    },
    metadata: {
      contactEmail: '',
      contactPhone: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil'
      },
      lgpdCompliant: true,
      dataRegion: 'br-southeast'
    }
  };
}

// 🔧 CNPJ formatting utility
function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length <= 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return cnpj;
}

export default TenantManager;