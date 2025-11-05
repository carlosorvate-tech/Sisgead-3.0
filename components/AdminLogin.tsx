// 🔐 SISGEAD 2.0 - Enhanced Admin Login
// Sistema de login administrativo com validação multi-tenant

import React, { useState, useCallback, useEffect } from 'react';
import { cpfValidator, cleanCPF } from '../utils/cpfValidator';
import { auditService } from '../services/auditService';
import { useTenantManager } from '../hooks/useTenantManager';
import TenantSelector from './TenantSelector';
import type { CPFValidationResult } from '../utils/cpfValidator';

interface AdminLoginProps {
  onLogin: (userData: any) => void;
  onCancel?: () => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

interface LoginFormData {
  cpf: string;
  password?: string;
  rememberMe: boolean;
}

export function AdminLogin({
  onLogin,
  onCancel,
  className = '',
  title = 'Acesso Administrativo',
  subtitle = 'Entre com suas credenciais administrativas'
}: AdminLoginProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    cpf: '',
    password: '',
    rememberMe: false
  });
  
  const [validation, setValidation] = useState<CPFValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'cpf' | 'tenant' | 'password'>('cpf');
  const [showPassword, setShowPassword] = useState(false);

  const {
    currentTenant,
    availableTenants,
    switchTenant,
    isMultiTenant,
    isSuperAdmin
  } = useTenantManager();

  // 🔄 Reset form when component mounts
  useEffect(() => {
    setFormData({ cpf: '', password: '', rememberMe: false });
    setValidation(null);
    setError(null);
    setStep('cpf');
  }, []);

  // 🆔 Handle CPF validation and progression
  const handleCPFValidation = useCallback(async () => {
    if (!formData.cpf.trim()) {
      setError('Por favor, informe o CPF');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate CPF with institutional data requirement
      const result = cpfValidator.validateAdminCPF(formData.cpf, 'tenant_admin');
      setValidation(result);

      if (!result.isValid) {
        setError(result.errors[0] || 'CPF inválido para acesso administrativo');
        
        // Log failed login attempt
        auditService.logAuth('login_failed', {
          cpf: cleanCPF(formData.cpf),
          reason: 'invalid_cpf',
          errors: result.errors
        });
        
        return;
      }

      // Check if user has multi-tenant access
      const hasMultiAccess = result.institutionalData?.role === 'super_admin' || 
                            (availableTenants.length > 1);

      if (hasMultiAccess && isMultiTenant) {
        setStep('tenant');
      } else {
        // For single tenant or users without multi-access, skip to password
        setStep('password');
      }

    } catch (error) {
      setError('Erro na validação do CPF. Tente novamente.');
      console.error('CPF validation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData.cpf, availableTenants.length, isMultiTenant]);

  // 🏢 Handle tenant selection
  const handleTenantSelection = useCallback(() => {
    if (!currentTenant) {
      setError('Por favor, selecione uma organização');
      return;
    }
    
    setStep('password');
    setError(null);
  }, [currentTenant]);

  // 🔐 Handle final login submission
  const handleLogin = useCallback(async () => {
    if (!validation?.isValid) {
      setError('Validação de CPF inválida');
      return;
    }

    if (!formData.password && step === 'password') {
      setError('Por favor, informe a senha');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would verify password against backend
      // For demo purposes, we'll accept any non-empty password for valid CPFs
      const isPasswordValid = formData.password && formData.password.length >= 4;

      if (!isPasswordValid) {
        setError('Senha deve ter pelo menos 4 caracteres');
        
        auditService.logAuth('login_failed', {
          cpf: cleanCPF(formData.cpf),
          tenantId: currentTenant?.id,
          reason: 'invalid_password'
        });
        
        return;
      }

      // Create user data object
      const userData = {
        cpf: cleanCPF(formData.cpf),
        name: validation.institutionalData?.name || 'Administrador',
        email: validation.institutionalData?.email || '',
        isAdmin: true,
        role: validation.institutionalData?.role || 'tenant_admin',
        tenantId: currentTenant?.id || 'default',
        tenantName: currentTenant?.displayName || 'Default',
        loginTime: new Date().toISOString(),
        permissions: validation.institutionalData?.permissions || []
      };

      // Log successful login
      auditService.logAuth('login', {
        cpf: userData.cpf,
        tenantId: userData.tenantId,
        role: userData.role,
        loginMethod: 'cpf_password'
      });

      // Save to localStorage (in real app, would use secure token)
      localStorage.setItem('sisgead_user', JSON.stringify(userData));
      
      onLogin(userData);

    } catch (error) {
      setError('Erro interno. Tente novamente.');
      console.error('Login error:', error);
      
      auditService.logAuth('login_failed', {
        cpf: cleanCPF(formData.cpf),
        tenantId: currentTenant?.id,
        reason: 'system_error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [validation, formData.password, currentTenant, step, onLogin, formData.cpf]);

  // 📝 Handle form input changes
  const handleInputChange = useCallback((field: keyof LoginFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  // ⏪ Handle step navigation
  const handleBack = useCallback(() => {
    if (step === 'password') {
      setStep(isMultiTenant && availableTenants.length > 1 ? 'tenant' : 'cpf');
    } else if (step === 'tenant') {
      setStep('cpf');
    }
    setError(null);
  }, [step, isMultiTenant, availableTenants.length]);

  // 🎨 Render CPF validation step
  const renderCPFStep = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
          CPF do Administrador
        </label>
        <input
          id="cpf"
          type="text"
          value={formData.cpf}
          onChange={(e) => handleInputChange('cpf', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCPFValidation()}
          placeholder="000.000.000-00"
          maxLength={14}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        {validation && !validation.isValid && validation.warnings.length > 0 && (
          <div className="mt-1 text-sm text-yellow-600">
            {validation.warnings[0]}
          </div>
        )}
      </div>
      
      <button
        onClick={handleCPFValidation}
        disabled={isLoading || !formData.cpf.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          'Validar CPF'
        )}
      </button>
    </div>
  );

  // 🏢 Render tenant selection step
  const renderTenantStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione a Organização
        </label>
        <TenantSelector
          className="w-full"
          showCreateButton={isSuperAdmin}
          compact={false}
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={handleBack}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Voltar
        </button>
        <button
          onClick={handleTenantSelection}
          disabled={!currentTenant}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );

  // 🔐 Render password step
  const renderPasswordStep = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Digite sua senha"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="rememberMe"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
          Lembrar-me neste dispositivo
        </label>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleBack}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Voltar
        </button>
        <button
          onClick={handleLogin}
          disabled={isLoading || !formData.password}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            'Entrar'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">{subtitle}</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${step === 'cpf' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-8 h-0.5 ${step !== 'cpf' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step === 'tenant' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-8 h-0.5 ${step === 'password' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step === 'password' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Step Content */}
      {step === 'cpf' && renderCPFStep()}
      {step === 'tenant' && renderTenantStep()}
      {step === 'password' && renderPasswordStep()}

      {/* Footer */}
      <div className="mt-6 text-center">
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* User Info Display (for validated users) */}
      {validation?.isValid && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <div className="font-medium">✓ CPF validado</div>
            {validation.institutionalData && (
              <div className="mt-1 text-green-600">
                Função: {validation.institutionalData.role || 'Administrador'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLogin;