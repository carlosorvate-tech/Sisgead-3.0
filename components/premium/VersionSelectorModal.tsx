/**
 * SISGEAD Premium 3.0 - Version Selector Modal
 * Modal para escolha entre Standard 2.0 e Premium 3.0
 */

import React, { useState } from 'react';
import { Version } from '../../types/premium';

interface VersionSelectorModalProps {
  isOpen: boolean;
  onSelect: (version: Version) => void;
  onClose: () => void;
}

export const VersionSelectorModal: React.FC<VersionSelectorModalProps> = ({
  isOpen,
  onSelect,
  onClose
}) => {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  if (!isOpen) return null;

  const handleSelect = (version: Version) => {
    setSelectedVersion(version);
  };

  const handleConfirm = () => {
    if (selectedVersion) {
      onSelect(selectedVersion);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <h2 className="text-3xl font-bold mb-2">🚀 Bem-vindo ao SISGEAD!</h2>
          <p className="text-blue-100">Escolha a experiência ideal para sua organização</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Standard 2.0 */}
            <div
              onClick={() => handleSelect('standard')}
              className={`
                border-2 rounded-lg p-6 cursor-pointer transition-all duration-200
                ${selectedVersion === 'standard'
                  ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                  : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">📊</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Standard 2.0</h3>
                    <p className="text-sm text-gray-600">Uso Individual</p>
                  </div>
                </div>
                {selectedVersion === 'standard' && (
                  <div className="text-blue-500 text-2xl">✓</div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-gray-700 font-medium">Ideal para:</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Uso individual ou equipes pequenas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Configuração rápida e simples</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Avaliações DISC completas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Relatórios profissionais</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Backup e restauração</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  ⚡ Comece a usar imediatamente
                </p>
              </div>
            </div>

            {/* Premium 3.0 */}
            <div
              onClick={() => handleSelect('premium')}
              className={`
                border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 relative
                ${selectedVersion === 'premium'
                  ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                  : 'border-gray-300 hover:border-purple-400 hover:shadow-md'
                }
              `}
            >
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                NOVO! 🎉
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">🏢</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Premium 3.0</h3>
                    <p className="text-sm text-gray-600">Multi-Tenant Institucional</p>
                  </div>
                </div>
                {selectedVersion === 'premium' && (
                  <div className="text-purple-500 text-2xl">✓</div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-gray-700 font-medium">Ideal para:</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    <span>Instituições e organizações complexas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    <span>Múltiplas organizações hierárquicas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    <span>Gestão de usuários e privilégios</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    <span>Relatórios consolidados institucionais</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    <span>Sistema de auditoria completo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    <span>Controle de acesso granular (RBAC)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-purple-200">
                <p className="text-xs text-gray-500">
                  🔧 Requer configuração inicial (5-10 minutos)
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  Você pode alternar entre versões a qualquer momento
                </h4>
                <p className="text-sm text-blue-700">
                  Teste a versão Standard agora e migre para Premium quando precisar de recursos avançados.
                  Todos os seus dados serão preservados.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Comparação Rápida:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Funcionalidade</th>
                    <th className="text-center p-2">Standard</th>
                    <th className="text-center p-2">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Avaliações DISC</td>
                    <td className="text-center text-green-500">✓</td>
                    <td className="text-center text-green-500">✓</td>
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-2">Múltiplas organizações</td>
                    <td className="text-center text-gray-400">✗</td>
                    <td className="text-center text-green-500">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Gestão de usuários</td>
                    <td className="text-center text-gray-400">✗</td>
                    <td className="text-center text-green-500">✓</td>
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-2">Relatórios institucionais</td>
                    <td className="text-center text-gray-400">✗</td>
                    <td className="text-center text-green-500">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Sistema de auditoria</td>
                    <td className="text-center text-gray-400">✗</td>
                    <td className="text-center text-green-500">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Decidir depois
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedVersion}
            className={`
              px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200
              ${selectedVersion
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            {selectedVersion === 'standard' && 'Continuar com Standard →'}
            {selectedVersion === 'premium' && 'Configurar Premium →'}
            {!selectedVersion && 'Selecione uma versão'}
          </button>
        </div>
      </div>
    </div>
  );
};
