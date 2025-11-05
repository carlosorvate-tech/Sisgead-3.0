/**
 * SetupComplete - Tela de conclusão do wizard
 */

import React from 'react';
import type { WizardData } from './SetupWizard';

interface SetupCompleteProps {
  wizardData: WizardData;
  onFinish: () => void;
}

export const SetupComplete: React.FC<SetupCompleteProps> = ({ wizardData, onFinish }) => {
  const { masterUser, institution, organizations = [], users = [] } = wizardData;

  return (
    <div className="space-y-8 py-4">
      {/* Success icon */}
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          Configuração Concluída!
        </h2>
        <p className="mt-2 text-gray-600">
          Sua instituição Premium 3.0 está pronta para uso.
        </p>
      </div>

      {/* Resumo da configuração */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Configuração</h3>
        
        {/* Instituição */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-gray-900">Instituição</span>
          </div>
          <p className="text-gray-700 ml-7">{institution?.name || 'N/A'}</p>
        </div>

        {/* Usuário Master */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-gray-900">Usuário Master</span>
          </div>
          <p className="text-gray-700 ml-7">{masterUser?.profile.name || 'N/A'}</p>
          <p className="text-sm text-gray-500 ml-7">{masterUser?.profile.email || 'N/A'}</p>
        </div>

        {/* Organizações */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="font-semibold text-gray-900">Organizações</span>
          </div>
          <p className="text-gray-700 ml-7">
            {organizations.length > 0
              ? `${organizations.length} organização(ões) criada(s)`
              : 'Nenhuma organização criada (pode adicionar depois)'}
          </p>
          {organizations.length > 0 && (
            <ul className="ml-7 mt-2 space-y-1">
              {organizations.map((org) => (
                <li key={org.id} className="text-sm text-gray-600">• {org.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Usuários */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="font-semibold text-gray-900">Usuários Adicionais</span>
          </div>
          <p className="text-gray-700 ml-7">
            {users.length > 0
              ? `${users.length} usuário(s) adicionado(s)`
              : 'Nenhum usuário adicional (pode adicionar depois)'}
          </p>
        </div>
      </div>

      {/* Próximos passos */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">Próximos Passos</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>✓ Acesse o painel administrativo</li>
              <li>✓ Configure suas avaliações</li>
              <li>✓ Adicione mais usuários e organizações</li>
              <li>✓ Explore os recursos Premium</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botão finalizar */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onFinish}
          className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          Ir para o Dashboard →
        </button>
      </div>
    </div>
  );
};
