/**
 * PremiumApp - Componente principal do Premium 3.0
 * Gerencia o fluxo: Login → Modal Seleção → Setup Wizard → Dashboard
 */

import React, { useEffect, useState } from 'react';
import { VersionSelectorModal } from './VersionSelectorModal';
import { SetupWizard } from './SetupWizard';
import { PremiumDashboard } from './PremiumDashboard';
import { authService } from '../../services/premium';

type PremiumView = 'version-selector' | 'setup-wizard' | 'dashboard';

export const PremiumApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<PremiumView>('version-selector');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = () => {
    try {
      // Verificar se já escolheu Premium
      const versionPreference = authService.getVersionPreference();
      
      if (versionPreference !== 'premium') {
        setCurrentView('version-selector');
        setIsLoading(false);
        return;
      }

      // Verificar se é primeira configuração
      const isFirstTime = authService.isFirstTimeSetup();
      
      if (isFirstTime) {
        setCurrentView('setup-wizard');
      } else {
        // Verificar autenticação
        const isAuth = authService.isAuthenticated();
        
        if (isAuth) {
          setCurrentView('dashboard');
        } else {
          // Precisa fazer login
          setCurrentView('version-selector');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status Premium:', error);
      setCurrentView('version-selector');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionSelect = (version: 'standard' | 'premium') => {
    authService.setVersionPreference(version);
    
    if (version === 'standard') {
      // Redirecionar para Standard 2.0
      window.location.reload();
    } else {
      // Iniciar setup Premium
      setCurrentView('setup-wizard');
    }
  };

  const handleSetupComplete = () => {
    setCurrentView('dashboard');
  };

  const handleCancelSetup = () => {
    authService.setVersionPreference('standard');
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Carregando SISGEAD Premium...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'version-selector' && (
        <VersionSelectorModal
          isOpen={true}
          onSelect={handleVersionSelect}
        />
      )}

      {currentView === 'setup-wizard' && (
        <SetupWizard
          onComplete={handleSetupComplete}
          onCancel={handleCancelSetup}
        />
      )}

      {currentView === 'dashboard' && (
        <PremiumDashboard />
      )}
    </>
  );
};
