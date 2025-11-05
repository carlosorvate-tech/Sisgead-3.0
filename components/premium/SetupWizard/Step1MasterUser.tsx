/**
 * Step1MasterUser - Criação do usuário Master inicial
 */

import React, { useState } from 'react';
import { authService } from '../../../services/premium';
import type { User } from '../../../types/premium/user';
import { UserRole } from '../../../types/premium/user';

interface Step1Props {
  onNext: (masterUser: User) => void;
  onBack?: () => void;
}

export const Step1MasterUser: React.FC<Step1Props> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Função de validação CPF simples e robusta
  const validateCPF = (cpf: string): { isValid: boolean; error?: string } => {
    // Remove caracteres não numéricos
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCpf.length !== 11) {
      return { isValid: false, error: 'CPF deve ter 11 dígitos' };
    }
    
    // Verifica se não são todos números iguais
    if (/^(\d)\1+$/.test(cleanCpf)) {
      return { isValid: false, error: 'CPF inválido - números iguais' };
    }
    
    // Calcula primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) {
      return { isValid: false, error: 'CPF inválido - primeiro dígito' };
    }
    
    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) {
      return { isValid: false, error: 'CPF inválido - segundo dígito' };
    }
    
    return { isValid: true };
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else {
      const cpfValidation = validateCPF(formData.cpf);
      if (!cpfValidation.isValid) {
        newErrors.cpf = cpfValidation.error || 'CPF inválido';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Criar usuário master inicial
      const result = await authService.createMasterUser({
        institutionId: 'temp', // Será atualizado após criar instituição
        organizationIds: [],
        profile: {
          name: formData.name.trim(),
          cpf: formData.cpf.replace(/\D/g, ''),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim() || undefined
        },
        password: formData.password,
        role: 'master' as UserRole,
        createdBy: 'system'
      });

      if (!result.success || !result.user) {
        throw new Error(result.error || 'Erro ao criar usuário master');
      }

      // Salvar senha temporariamente para login automático após wizard
      sessionStorage.setItem('temp-master-password', formData.password);

      onNext(result.user);
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar usuário master';
      
      // Se CPF já existe, oferecer opção de limpar dados
      if (errorMessage.includes('CPF já cadastrado')) {
        setErrors({ 
          submit: `${errorMessage}. Dados de uma configuração anterior foram encontrados.`
        });
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearExistingData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados da configuração anterior? Esta ação não pode ser desfeita.')) {
      // Limpar dados do Premium
      localStorage.removeItem('premium-users');
      localStorage.removeItem('premium-institutions');
      localStorage.removeItem('premium-organizations');
      localStorage.removeItem('premium-audit-logs');
      
      alert('Dados limpos! Agora você pode prosseguir com a configuração.');
      setErrors({});
    }
  };

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    setFormData({ ...formData, cpf: formatted });
    // Limpar erro ao digitar
    if (errors.cpf) {
      setErrors({ ...errors, cpf: '' });
    }
  };

  const handleCpfBlur = () => {
    // Validar CPF quando sair do campo
    if (formData.cpf.trim()) {
      const cpfValidation = validateCPF(formData.cpf);
      if (!cpfValidation.isValid) {
        setErrors({ ...errors, cpf: cpfValidation.error || 'CPF inválido' });
      }
    }
  };

  return (
    <div className="h-full">
      <form onSubmit={handleSubmit} className="space-y-3 h-full flex flex-col">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex-shrink-0">
          <div className="flex items-start">
            <svg className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Criar Usuário Master
              </h3>
              <p className="text-xs text-blue-800">
                Usuário principal com acesso total ao sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Nome completo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="José da Silva"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* CPF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPF *
          </label>
          <input
            type="text"
            value={formData.cpf}
            onChange={handleCpfChange}
            onBlur={handleCpfBlur}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.cpf ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="000.000.000-00"
            maxLength={14}
          />
          {errors.cpf && (
            <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="jose@exemplo.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone (opcional)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(00) 00000-0000"
          />
        </div>

        {/* Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Mínimo 8 caracteres"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirmar senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Senha *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite a senha novamente"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 mb-3">{errors.submit}</p>
            {errors.submit.includes('CPF já cadastrado') && (
              <button
                type="button"
                onClick={handleClearExistingData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                🗑️ Limpar Dados Anteriores
              </button>
            )}
          </div>
        )}

        {/* Botões - Fixos na parte inferior */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4 flex-shrink-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              ← Voltar
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="ml-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Criando...' : 'Próximo →'}
          </button>
        </div>
      </form>
    </div>
  );
};
