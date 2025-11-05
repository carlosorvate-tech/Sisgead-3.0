/**
 * SetupWizard - Wizard de configuração inicial do Premium 3.0
 * 
 * Guia o usuário através de 3 etapas:
 * 1. Criar usuário MASTER
 * 2. Configurar instituição
 * 3. Criar organizações (opcional)
 * 
 * Nota: Usuários para responder avaliações recebem link externo,
 * não precisam ser cadastrados no sistema.
 */

import React, { useState } from 'react';
import { Step1MasterUser } from './Step1MasterUser';
import { Step2Institution } from './Step2Institution';
import { Step3Organizations } from './Step3Organizations';
import { SetupComplete } from './SetupComplete';
import { authService } from '../../../services/premium';
import type { Institution } from '../../../types/premium/institution';
import type { User } from '../../../types/premium/user';
import type { Organization } from '../../../types/premium/organization';

interface SetupWizardProps {
  onComplete: () => void;
  onCancel?: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

export interface WizardData {
  masterUser?: User;
  institution?: Institution;
  organizations?: Organization[];
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [wizardData, setWizardData] = useState<WizardData>({});

  const handleStep1Complete = (masterUser: User) => {
    setWizardData({ ...wizardData, masterUser });
    setCurrentStep(2);
  };

  const handleStep2Complete = (institution: Institution) => {
    setWizardData({ ...wizardData, institution });
    setCurrentStep(3);
  };

  const handleStep3Complete = (organizations: Organization[]) => {
    setWizardData({ ...wizardData, organizations });
    setCurrentStep(4); // Vai direto para tela de conclusão
  };

  const handleSkipOrganizations = () => {
    setWizardData({ ...wizardData, organizations: [] });
    setCurrentStep(4); // Vai direto para tela de conclusão
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleFinish = async () => {
    // Fazer login automático do master user criado
    if (wizardData.masterUser) {
      // Obter senha temporária do sessionStorage (salva durante criação)
      const tempPassword = sessionStorage.getItem('temp-master-password');
      
      if (tempPassword) {
        const result = await authService.login({
          cpf: wizardData.masterUser.profile.cpf,
          password: tempPassword
        });
        
        // Limpar senha temporária
        sessionStorage.removeItem('temp-master-password');
        
        if (!result.success) {
          console.error('Erro no login automático:', result.error);
        }
      }
    }
    
    // Marcar setup como completo
    localStorage.setItem('premium-setup-completed', 'true');
    
    // Notificar conclusão
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Configuração Premium 3.0
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentStep === 1 && 'Etapa 1: Usuário Master'}
                {currentStep === 2 && 'Etapa 2: Configurar Instituição'}
                {currentStep === 3 && 'Etapa 3: Organizações (Opcional)'}
                {currentStep === 4 && 'Configuração Concluída!'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                INFINITUS Sistemas Inteligentes • CNPJ: 09.371.580/0001-06
              </p>
            </div>
            
            {onCancel && currentStep < 4 && (
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Cancelar
              </button>
            )}
          </div>

          {/* Progress bar */}
          {currentStep < 4 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center ${
                      step < 3 ? 'flex-1' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step < currentStep
                          ? 'bg-green-500 text-white'
                          : step === currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step < currentStep ? '✓' : step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-8 py-6 flex-1 overflow-y-auto">
          {currentStep === 1 && (
            <Step1MasterUser
              onNext={handleStep1Complete}
              onBack={onCancel}
            />
          )}

          {currentStep === 2 && (
            <Step2Institution
              masterUser={wizardData.masterUser!}
              onNext={handleStep2Complete}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <Step3Organizations
              institution={wizardData.institution!}
              masterUser={wizardData.masterUser!}
              onNext={handleStep3Complete}
              onSkip={handleSkipOrganizations}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <SetupComplete
              wizardData={wizardData}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
};
