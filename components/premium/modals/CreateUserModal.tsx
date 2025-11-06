import React, { useState, useEffect } from 'react';
import { userService, organizationService } from '../../../services/premium';
import type { User, UserRole } from '../../../types/premium';
import type { Organization } from '../../../types/premium';

interface CreateUserModalProps {
  institutionId: string;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function CreateUserModal({ institutionId, onClose, onSuccess }: CreateUserModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member' as UserRole,
    organizationId: '',
    phone: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, [institutionId]);

  const loadOrganizations = async () => {
    try {
      const allOrgs = await organizationService.list({ institutionId });
      const activeOrgs = allOrgs.filter(org => org.status === 'active');
      setOrganizations(activeOrgs);
      if (activeOrgs.length > 0) {
        setFormData(prev => ({ ...prev, organizationId: activeOrgs[0].id }));
      }
    } catch (err) {
      console.error('Erro ao carregar organizações:', err);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validações
      if (!formData.name.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        throw new Error('E-mail válido é obrigatório');
      }
      if (!formData.organizationId) {
        throw new Error('Selecione uma organização');
      }

      // Criar usuário
      const newUser = await userService.create({
        institutionId,
        organizationIds: [formData.organizationId],
        role: formData.role,
        password: 'temp123', // Senha temporária - usuário deve trocar no primeiro login
        createdBy: 'master-dashboard',
        profile: {
          name: formData.name,
          email: formData.email,
          cpf: '', // CPF será solicitado no primeiro login
          phone: formData.phone || undefined,
          department: formData.department || undefined
        }
      });

      onSuccess(newUser);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'member' as UserRole, label: 'Membro', icon: '👤', description: 'Usuário comum' },
    { value: 'org_admin' as UserRole, label: 'Administrador', icon: '👔', description: 'Admin da organização' },
    { value: 'master' as UserRole, label: 'Master', icon: '👑', description: 'Acesso total' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">👤</div>
              <div>
                <h2 className="text-xl font-bold text-white">Novo Usuário</h2>
                <p className="text-green-100 text-sm">Adicionar usuário à instituição</p>
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

          {loadingOrgs && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">Carregando organizações...</span>
              </div>
            </div>
          )}

          {!loadingOrgs && organizations.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                <span className="text-sm font-medium">
                  Nenhuma organização ativa encontrada. Crie uma organização primeiro.
                </span>
              </div>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: João da Silva"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@exemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Será usado para login e comunicações
            </p>
          </div>

          {/* Organização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organização *
            </label>
            <select
              value={formData.organizationId}
              onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={loading || loadingOrgs}
            >
              <option value="">Selecione uma organização</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Papel/Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Papel do Usuário *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={formData.role === option.value}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="mr-3"
                    disabled={loading}
                  />
                  <span className="text-2xl mr-2">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Dados Adicionais */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Dados Adicionais (Opcional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ex: TI"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading || loadingOrgs || organizations.length === 0}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Criar Usuário</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
