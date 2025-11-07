import React, { useState, useEffect } from 'react';
import { organizationService } from '../../../services/premium';
import type { Organization } from '../../../types/premium';

interface EditOrganizationModalProps {
  organization: Organization;
  onClose: () => void;
  onSuccess: (updated: Organization) => void;
}

export function EditOrganizationModal({ organization, onClose, onSuccess }: EditOrganizationModalProps) {
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || '',
    status: organization.status,
    maxUsers: organization.settings.maxUsers,
    allowedFeatures: organization.settings.allowedFeatures,
    requireAssessmentApproval: organization.settings.requireAssessmentApproval
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validações
      if (!formData.name.trim()) {
        throw new Error('Nome da organização é obrigatório');
      }
      if (formData.name.length < 3) {
        throw new Error('Nome deve ter no mínimo 3 caracteres');
      }
      if (formData.maxUsers < 1) {
        throw new Error('Máximo de usuários deve ser pelo menos 1');
      }

      // Atualizar organização
      const result = await organizationService.update(organization.id, {
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        settings: {
          ...organization.settings,
          maxUsers: formData.maxUsers,
          allowedFeatures: formData.allowedFeatures,
          requireAssessmentApproval: formData.requireAssessmentApproval
        },
        updatedBy: 'master-dashboard'
      });

      if (result.success && result.organization) {
        onSuccess(result.organization);
        onClose();
      } else {
        throw new Error(result.error || 'Erro ao atualizar organização');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar organização');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      allowedFeatures: prev.allowedFeatures.includes(feature)
        ? prev.allowedFeatures.filter(f => f !== feature)
        : [...prev.allowedFeatures, feature]
    }));
  };

  const availableFeatures = [
    { id: 'assessments', label: 'Avaliações DISC', icon: '📊' },
    { id: 'reports', label: 'Relatórios', icon: '📈' },
    { id: 'analytics', label: 'Analytics', icon: '📉' },
    { id: 'team-builder', label: 'Construtor de Equipes', icon: '👥' },
    { id: 'ai-assistant', label: 'Assistente IA', icon: '🤖' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🏢</div>
              <div>
                <h2 className="text-xl font-bold text-white">Editar Organização</h2>
                <p className="text-indigo-100 text-sm">Modificar configurações de {organization.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Informações Básicas</h3>
            
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Organização *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Departamento de Vendas"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o propósito e responsabilidades"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Organization['status'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="active">✅ Ativa</option>
                <option value="inactive">⏸️ Inativa</option>
                <option value="suspended">🚫 Suspensa</option>
              </select>
            </div>
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Configurações</h3>
            
            {/* Máximo de Usuários */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Usuários
              </label>
              <input
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                min="1"
                max="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Usuários atuais: {organization.metadata?.memberCount || 0}
              </p>
            </div>

            {/* Funcionalidades Permitidas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Funcionalidades Permitidas
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableFeatures.map(feature => (
                  <label
                    key={feature.id}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.allowedFeatures.includes(feature.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.allowedFeatures.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="mr-3"
                      disabled={loading}
                    />
                    <span className="text-xl mr-2">{feature.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Switches */}
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Requer Aprovação de Avaliações</span>
                  <p className="text-xs text-gray-500">Avaliações precisam ser aprovadas antes de iniciar</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.requireAssessmentApproval}
                  onChange={(e) => setFormData({ ...formData, requireAssessmentApproval: e.target.checked })}
                  className="h-5 w-5 text-indigo-600 rounded"
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Informações do Sistema</h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <span className="font-medium">ID:</span> <span className="font-mono">{organization.id}</span>
              </div>
              <div>
                <span className="font-medium">Criado em:</span> {new Date(organization.createdAt).toLocaleDateString('pt-BR')}
              </div>
              <div>
                <span className="font-medium">Membros:</span> {organization.metadata?.memberCount || 0}
              </div>
              <div>
                <span className="font-medium">Avaliações:</span> {organization.metadata?.assessmentCount || 0}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
