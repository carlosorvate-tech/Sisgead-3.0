/**
 * Debug script para testar o InstitutionService
 */

import { institutionService } from '../services/premium/institutionService';
import { InstitutionType } from '../types/premium/institution';

// Função de teste
export const testInstitutionCreation = async () => {
  console.log('🧪 Testando criação de instituição...');
  
  try {
    const result = await institutionService.create({
      name: 'Teste Instituição Premium',
      cnpj: '12345678000100',
      type: InstitutionType.PUBLIC,
      description: 'Instituição de teste para debug',
      contact: {
        email: 'teste@exemplo.com',
        phone: '(11) 1234-5678'
      },
      createdBy: 'debug-user-id'
    });

    console.log('✅ Resultado:', result);
    
    if (result.success && result.institution) {
      console.log('✅ Instituição criada com sucesso:', result.institution);
      return result.institution;
    } else {
      console.error('❌ Falha na criação:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return null;
  }
};

// Função para debug do Step2
export const debugStep2Issue = () => {
  console.log('🔍 Debugando problema do Step2...');
  
  // Verificar se os tipos estão corretos
  console.log('InstitutionType values:', Object.values(InstitutionType));
  
  // Verificar localStorage
  const institutions = localStorage.getItem('premium-institutions');
  console.log('Institutions in storage:', institutions);
  
  // Testar criação
  testInstitutionCreation();
};