/**
 * Step4Users - Adicionar usuários iniciais (opcional)
 */

import React, { useState } from 'react';
import { userService } from '../../../services/premium';
import type { Institution } from '../../../types/premium/institution';
import type { User } from '../../../types/premium/user';
import type { Organization } from '../../../types/premium/organization';
import { UserRole } from '../../../types/premium/user';

interface Step4Props {
  institution: Institution;
  organizations: Organization[];
  masterUser: User;
  onNext: (users: User[]) => void;
  onSkip: () => void;
  onBack: () => void;
}

export const Step4Users: React.FC<Step4Props> = ({
  institution,
  organizations,
  masterUser,
  onNext,
  onSkip,
  onBack
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    role: 'user' as UserRole,
    organizationIds: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddUser = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.cpf.trim()) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newUser = await userService.create({
        institutionId: institution.id,
        organizationIds: formData.organizationIds,
        profile: {
          name: formData.name.trim(),
          cpf: formData.cpf.replace(/\D/g, ''),
          email: formData.email.toLowerCase().trim()
        },
        password: 'temporal123', // Senha temporária
        role: formData.role,
        createdBy: masterUser.id
      });

      setUsers([...users, newUser]);
      setFormData({
        name: '',
        email: '',
        cpf: '',
        role: 'user' as UserRole,
        organizationIds: []
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Adicionar Usuários Iniciais (Opcional)
            </h3>
            <p className="text-sm text-blue-800">
              Adicione outros usuários que terão acesso ao sistema. Você pode gerenciar usuários depois no painel administrativo.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome completo"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            placeholder="000.000.000-00"
            maxLength={14}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="user">Usuário (responde avaliações)</option>
            <option value="org_admin">Admin Organizacional</option>
            <option value="viewer">Visualizador (apenas leitura)</option>
          </select>
        </div>

        {organizations.length > 0 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Organizações</label>
            <select
              multiple
              value={formData.organizationIds}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions, 
                  (option: HTMLOptionElement) => option.value
                );
                setFormData({ ...formData, organizationIds: selected });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              size={3}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Ctrl+Click para selecionar múltiplas</p>
          </div>
        )}

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={handleAddUser}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Adicionando...' : '+ Adicionar Usuário'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Lista de usuários */}
      {users.length > 0 && (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{user.profile.name}</p>
                <p className="text-sm text-gray-600">{user.profile.email} • {user.role}</p>
              </div>
              <button
                onClick={() => handleRemove(user.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {users.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">Nenhum usuário adicionado ainda</p>
        </div>
      )}

      {/* Botões */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
        >
          ← Voltar
        </button>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Pular esta etapa
          </button>
          <button
            type="button"
            onClick={() => onNext(users)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Concluir Configuração →
          </button>
        </div>
      </div>
    </div>
  );
};
