import React, { useState } from 'react';
import { organizationService } from '../../../services/premium';
import type { Organization } from '../../../types/premium';

interface CreateOrganizationModalProps {
  institutionId: string;
  onClose: () => void;
  onSuccess: (organization: Organization) => void;
}

export function CreateOrganizationModal({ institutionId, onClose, onSuccess }: CreateOrganizationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerName: '',
    managerEmail: ''
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
      if (formData.managerEmail && !formData.managerEmail.includes('@')) {
        throw new Error('E-mail do gestor inválido');
      }

      // Criar organização
      const result = await organizationService.create({
        name: formData.name,
        description: formData.description || undefined,
        institutionId,
        settings: {
          maxUsers: 100,
          allowedFeatures: ['assessments', 'teams', 'reports'],
          allowSubOrganizations: false,
          requireAssessmentApproval: true,
          allowCrossUserView: false,
          allowDataExport: true,
          notificationsEnabled: true
        },
        createdBy: 'master-user'
      });

      if (result.success && result.organization) {
        onSuccess(result.organization);
        onClose();
      } else {
        throw new Error(result.error || 'Erro ao criar organização');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar organização');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🏢</div>
              <div>
                <h2 className="text-xl font-bold text-white">Nova Organização</h2>
                <p className="text-blue-100 text-sm">Adicionar uma organização à instituição</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Nome da Organização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Organização *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Departamento de TI"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o propósito e responsabilidades desta organização"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Dados do Gestor */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Dados do Gestor (Opcional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Gestor
                </label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="Nome completo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail do Gestor
                </label>
                <input
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                  placeholder="gestor@exemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Criar Organização</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
