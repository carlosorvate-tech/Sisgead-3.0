/**
 * Step2Institution - Configuração da instituição
 */

import React, { useState } from 'react';
import { institutionService } from '../../../services/premium';
import type { User } from '../../../types/premium/user';
import type { Institution, InstitutionType } from '../../../types/premium/institution';
import { InstitutionType as InstitutionTypeEnum } from '../../../types/premium/institution';

interface Step2Props {
  masterUser: User;
  onNext: (institution: Institution) => void;
  onBack: () => void;
}

const INSTITUTION_TYPES: Array<{ value: InstitutionType; label: string; icon: string }> = [
  { value: InstitutionTypeEnum.PUBLIC, label: 'Órgão Público', icon: '🏛️' },
  { value: InstitutionTypeEnum.PRIVATE, label: 'Empresa Privada', icon: '🏢' },
  { value: InstitutionTypeEnum.NGO, label: 'ONG / Terceiro Setor', icon: '🤝' },
  { value: InstitutionTypeEnum.EDUCATIONAL, label: 'Instituição de Ensino', icon: '🎓' },
  { value: InstitutionTypeEnum.HEALTHCARE, label: 'Saúde', icon: '🏥' },
  { value: InstitutionTypeEnum.OTHER, label: 'Outro', icon: '🏭' }
];

export const Step2Institution: React.FC<Step2Props> = ({ masterUser, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    type: InstitutionTypeEnum.PUBLIC as InstitutionType,
    description: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!/^\d{14}$/.test(formData.cnpj.replace(/\D/g, ''))) {
      newErrors.cnpj = 'CNPJ inválido';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email de contato é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const institution = await institutionService.create({
        name: formData.name.trim(),
        cnpj: formData.cnpj.replace(/\D/g, ''),
        type: formData.type,
        description: formData.description.trim() || undefined,
        contact: {
          email: formData.contactEmail.toLowerCase().trim(),
          phone: formData.contactPhone.trim() || undefined
        },
        createdBy: masterUser.id
      });

      onNext(institution);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erro ao criar instituição' });
    } finally {
      setLoading(false);
    }
  };

  const formatCnpj = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Configurar Instituição
            </h3>
            <p className="text-sm text-blue-800">
              Defina as informações da sua instituição. Esses dados aparecerão nos relatórios e documentos gerados.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Instituição *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Secretaria Municipal de Educação"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* CNPJ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CNPJ *
          </label>
          <input
            type="text"
            value={formatCnpj(formData.cnpj)}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.cnpj ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="00.000.000/0000-00"
            maxLength={18}
          />
          {errors.cnpj && (
            <p className="mt-1 text-sm text-red-600">{errors.cnpj}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Instituição *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as InstitutionType })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {INSTITUTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email de contato */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de Contato *
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.contactEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="contato@instituicao.gov.br"
          />
          {errors.contactEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
          )}
        </div>

        {/* Telefone de contato */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone de Contato (opcional)
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(11) 1234-5678"
          />
        </div>

        {/* Descrição */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Breve descrição da instituição..."
          />
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{errors.submit}</p>
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
        
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Salvando...' : 'Próximo →'}
        </button>
      </div>
    </form>
  );
};
