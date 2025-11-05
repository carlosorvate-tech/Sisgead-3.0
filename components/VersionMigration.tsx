import React, { useState } from 'react';
import { 
  AlertTriangleIcon as AlertTriangle, 
  ZapIcon as Zap, 
  ArrowRightIcon as ArrowRight, 
  CheckCircleIcon as CheckCircle, 
  InfoIcon as Info 
} from './icons';

interface VersionMigrationProps {
  currentVersion: 'standard' | 'premium';
  onMigrate: (newVersion: 'standard' | 'premium') => void;
}

export default function VersionMigration({ currentVersion, onMigrate }: VersionMigrationProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<'standard' | 'premium' | null>(null);

  const targetVersion = currentVersion === 'standard' ? 'premium' : 'standard';

  const handleMigrationClick = (version: 'standard' | 'premium') => {
    setSelectedVersion(version);
    setShowConfirmation(true);
  };

  const handleConfirmMigration = () => {
    if (selectedVersion) {
      // Save to localStorage
      localStorage.setItem('sisgead-version', selectedVersion);
      // Notify parent
      onMigrate(selectedVersion);
      // Reload page to apply changes
      window.location.reload();
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedVersion(null);
  };

  const migrationInfo = {
    'standard-to-premium': {
      title: 'Migrar para Versão Premium',
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      description: 'Desbloqueie recursos avançados para gestão multi-organizacional',
      benefits: [
        'Gestão de múltiplas organizações',
        'Relatórios institucionais consolidados',
        'Auditoria multi-organização',
        'Segurança avançada (MFA)',
        'Conformidade LGPD completa',
        'Monitoramento de ameaças',
      ],
      requirements: [
        'Mínimo 8GB RAM recomendado',
        'Conexão de internet ≥5 Mbps',
        'Navegador moderno atualizado',
        'Download adicional: ~100KB',
      ],
      warning: 'Esta migração é reversível. Você pode voltar para Standard a qualquer momento.',
      color: 'purple',
    },
    'premium-to-standard': {
      title: 'Migrar para Versão Standard',
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      description: 'Versão simplificada para organizações de pequeno e médio porte',
      benefits: [
        'Interface mais leve e rápida',
        'Menor consumo de recursos',
        'Ideal para dispositivos limitados',
        'Foco em recursos essenciais',
      ],
      requirements: [
        'Mínimo 4GB RAM',
        'Conexão de internet ≥2 Mbps',
        'Compatível com dispositivos móveis',
      ],
      warning: 'ATENÇÃO: Você perderá acesso aos recursos Premium (multi-tenant, relatórios institucionais, etc.). Os dados existentes serão preservados, mas funcionalidades avançadas ficarão indisponíveis.',
      color: 'orange',
    },
  };

  const migrationKey = currentVersion === 'standard' ? 'standard-to-premium' : 'premium-to-standard';
  const info = migrationInfo[migrationKey];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        {info.icon}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gerenciar Versão do Sistema</h3>
          <p className="text-sm text-gray-600">
            Versão atual: <span className="font-semibold capitalize">{currentVersion}</span>
          </p>
        </div>
      </div>

      {!showConfirmation ? (
        <div className="space-y-4">
          {/* Current Version Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Sobre Migração de Versão</h4>
                <p className="text-sm text-blue-800">
                  Você pode migrar entre as versões Standard e Premium a qualquer momento, 
                  dependendo das necessidades da sua organização. A migração preserva todos 
                  os seus dados e pode ser revertida quando necessário.
                </p>
              </div>
            </div>
          </div>

          {/* Migration Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Keep Current Version */}
            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900 capitalize">
                  Versão {currentVersion} (Atual)
                </h4>
              </div>
              <p className="text-sm text-green-800 mb-3">
                {currentVersion === 'standard' 
                  ? 'Ideal para pequenas e médias organizações com até 100 usuários.'
                  : 'Recursos avançados para grandes corporações multi-unidade.'}
              </p>
              <button
                disabled
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
              >
                Versão em Uso
              </button>
            </div>

            {/* Migrate to Other Version */}
            <div className={`border-2 border-${info.color}-300 bg-${info.color}-50 rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                {info.icon}
                <h4 className="font-semibold text-gray-900 capitalize">
                  Versão {targetVersion}
                </h4>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                {info.description}
              </p>
              <button
                onClick={() => handleMigrationClick(targetVersion)}
                className={`w-full py-2 px-4 bg-${info.color}-600 text-white rounded-lg font-medium hover:bg-${info.color}-700 transition-colors flex items-center justify-center gap-2`}
              >
                Migrar para {targetVersion === 'premium' ? 'Premium' : 'Standard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Confirmation Dialog */}
          <div className={`bg-${info.color}-50 border-2 border-${info.color}-300 rounded-lg p-4`}>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              {info.icon}
              {info.title}
            </h4>

            {/* Benefits */}
            <div className="mb-4">
              <h5 className="font-semibold text-gray-800 mb-2">Benefícios:</h5>
              <ul className="space-y-1">
                {info.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="mb-4">
              <h5 className="font-semibold text-gray-800 mb-2">Requisitos Técnicos:</h5>
              <ul className="space-y-1">
                {info.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warning */}
            <div className={`bg-${info.color === 'orange' ? 'red' : 'yellow'}-100 border border-${info.color === 'orange' ? 'red' : 'yellow'}-300 rounded-lg p-3 mb-4`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-5 h-5 text-${info.color === 'orange' ? 'red' : 'yellow'}-700 mt-0.5 flex-shrink-0`} />
                <div>
                  <h5 className={`font-semibold text-${info.color === 'orange' ? 'red' : 'yellow'}-900 mb-1`}>
                    {info.color === 'orange' ? 'Importante' : 'Observação'}
                  </h5>
                  <p className={`text-sm text-${info.color === 'orange' ? 'red' : 'yellow'}-800`}>
                    {info.warning}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmMigration}
                className={`flex-1 py-2 px-4 bg-${info.color}-600 text-white rounded-lg font-medium hover:bg-${info.color}-700 transition-colors flex items-center justify-center gap-2`}
              >
                Confirmar Migração
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Migration Process Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-2">O que acontece após confirmar:</h5>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900 min-w-[20px]">1.</span>
                <span>Sua escolha será salva no navegador</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900 min-w-[20px]">2.</span>
                <span>A página será recarregada automaticamente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900 min-w-[20px]">3.</span>
                <span>O sistema iniciará com a nova versão selecionada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900 min-w-[20px]">4.</span>
                <span>Todos os seus dados serão preservados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900 min-w-[20px]">5.</span>
                <span>Você poderá reverter a migração quando quiser</span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
