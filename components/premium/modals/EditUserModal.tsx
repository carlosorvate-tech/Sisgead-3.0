// Modal de Edição de Usuário
import React, { useState, useEffect } from 'react';
import { userService, organizationService } from '../../../services/premium';
import type { User, UserRole } from '../../../types/premium';
import type { Organization } from '../../../types/premium';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (updated: User) => void;
}

export function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    name: user.profile.name,
    email: user.profile.email,
    role: user.role,
    phone: user.profile.phone || '',
    department: user.profile.department || '',
    organizationIds: user.organizationIds,
    isActive: user.isActive
  });
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, [user.institutionId]);

  const loadOrganizations = async () => {
    try {
      const allOrgs = await organizationService.list({ institutionId: user.institutionId });
      const activeOrgs = allOrgs.filter(org => org.status === 'active');
      setOrganizations(activeOrgs);
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
      if (!formData.name.trim()) throw new Error('Nome é obrigatório');
      if (!formData.email.includes('@')) throw new Error('E-mail inválido');
      if (formData.organizationIds.length === 0) throw new Error('Selecione pelo menos uma organização');

      const updatedUser = await userService.update(user.id, {
        role: formData.role,
        organizationIds: formData.organizationIds,
        isActive: formData.isActive,
        profile: {
          name: formData.name,
          email: formData.email,
          cpf: user.profile.cpf,
          phone: formData.phone || undefined,
          department: formData.department || undefined
        },
        updatedBy: 'master-dashboard'
      });

      onSuccess(updatedUser);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrganization = (orgId: string) => {
    setFormData(prev => ({
      ...prev,
      organizationIds: prev.organizationIds.includes(orgId)
        ? prev.organizationIds.filter(id => id !== orgId)
        : [...prev.organizationIds, orgId]
    }));
  };

  const roleOptions = [
    { value: 'member' as UserRole, label: 'Membro', icon: '👤' },
    { value: 'org_admin' as UserRole, label: 'Administrador', icon: '👔' },
    { value: 'master' as UserRole, label: 'Master', icon: '👑' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">👤</div>
              <div>
                <h2 className="text-xl font-bold text-white">Editar Usuário</h2>
                <p className="text-green-100 text-sm">Modificar dados de {user.profile.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <span className="text-xl mr-2">⚠️</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Papel *</label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer ${
                    formData.role === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={formData.role === opt.value}
                    onChange={() => setFormData({ ...formData, role: opt.value })}
                    className="sr-only"
                  />
                  <span className="text-xl mr-2">{opt.icon}</span>
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="active">✅ Ativo</option>
              <option value="inactive">⏸️ Inativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organizações *</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
              {loadingOrgs ? (
                <div className="text-center text-gray-500">Carregando...</div>
              ) : organizations.length === 0 ? (
                <div className="text-center text-yellow-600">Nenhuma organização ativa</div>
              ) : (
                organizations.map(org => (
                  <label key={org.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.organizationIds.includes(org.id)}
                      onChange={() => toggleOrganization(org.id)}
                      className="mr-3"
                    />
                    <span className="text-sm">{org.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
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
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
