/**
 * Step3Organizations - Criar organizações iniciais (opcional)
 */

import React, { useState } from 'react';
import { organizationService } from '../../../services/premium';
import type { Institution } from '../../../types/premium/institution';
import type { User } from '../../../types/premium/user';
import type { Organization } from '../../../types/premium/organization';

interface Step3Props {
  institution: Institution;
  masterUser: User;
  onNext: (organizations: Organization[]) => void;
  onSkip: () => void;
  onBack: () => void;
}

export const Step3Organizations: React.FC<Step3Props> = ({
  institution,
  masterUser,
  onNext,
  onSkip,
  onBack
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddOrganization = async () => {
    if (!orgName.trim()) {
      setError('Nome da organização é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await organizationService.create({
        institutionId: institution.id,
        name: orgName.trim(),
        parentOrgId: undefined,
        createdBy: masterUser.id
      });

      if (result.success && result.organization) {
        setOrganizations([...organizations, result.organization]);
        setOrgName('');
      } else {
        setError(result.error || 'Erro ao criar organização');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar organização');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (orgId: string) => {
    setOrganizations(organizations.filter(o => o.id !== orgId));
  };

  const handleNext = () => {
    onNext(organizations);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Criar Organizações (Opcional)
            </h3>
            <p className="text-sm text-blue-800">
              Adicione as organizações (departamentos, secretarias, diretorias) da sua instituição.
              Você pode criar hierarquias mais complexas depois.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário para adicionar */}
      <div className="flex gap-3">
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddOrganization()}
          placeholder="Nome da organização (ex: Diretoria de Ensino)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleAddOrganization}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? '...' : '+ Adicionar'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Lista de organizações adicionadas */}
      {organizations.length > 0 && (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {organizations.map((org) => (
            <div key={org.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">{org.name}</span>
              </div>
              <button
                onClick={() => handleRemove(org.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {organizations.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">Nenhuma organização adicionada ainda</p>
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
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Próximo →
          </button>
        </div>
      </div>
    </div>
  );
};
