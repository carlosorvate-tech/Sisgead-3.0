/**
 * SISGEAD Premium 3.0 - PremiumUserPortal
 * Wrapper multi-tenant do UserPortal v2.0
 * 
 * OBJETIVOS:
 * - Integrar UserPortal v2.0 com contexto multi-tenant (institutionId + organizationId)
 * - Manter 100% da lógica do fluxo DISC de 7 etapas
 * - Adicionar workflow de aprovação opcional por gestor imediato
 * - Registrar audit logs em todas as operações
 * - Armazenar dados com isolamento multi-tenant
 * 
 * NOTA: Esta é a versão inicial que mantém compatibilidade com v2.0 AuditRecord.
 * As integrações completas com assessmentService, auditService e teamMemberService
 * serão implementadas progressivamente conforme os serviços amadurecem.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UserPortal } from '../UserPortal';
import type { AuditRecord } from '../../types';
import type { User } from '../../types/premium/user';
import type { Organization } from '../../types/premium/organization';

interface PremiumUserPortalProps {
  /** ID da instituição (contexto multi-tenant) */
  institutionId: string;
  
  /** ID da organização (contexto multi-tenant) */
  organizationId: string;
  
  /** Usuário atual (opcional - para auto-avaliação) */
  currentUser?: User;
  
  /** Organização atual (para configurações de aprovação) */
  organization?: Organization;
  
  /** Callback quando avaliação é completada */
  onAssessmentComplete?: (record: AuditRecord) => void;
  
  /** Callback quando erro ocorre */
  onError?: (error: Error) => void;
}

/**
 * PremiumUserPortal - Wrapper multi-tenant do UserPortal v2.0
 */
export const PremiumUserPortal: React.FC<PremiumUserPortalProps> = ({
  institutionId,
  organizationId,
  currentUser,
  organization,
  onAssessmentComplete,
  onError
}) => {
  const [existingRecords, setExistingRecords] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApproval, setPendingApproval] = useState<AuditRecord | null>(null);

  /**
   * Carrega registros existentes da organização
   * TODO: Integrar com assessmentService quando a conversão Assessment -> AuditRecord estiver completa
   */
  useEffect(() => {
    loadExistingRecords();
  }, [institutionId, organizationId]);

  const loadExistingRecords = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Substituir por assessmentService.list() quando pronto
      // Por enquanto, carrega do localStorage com prefixo multi-tenant
      const storageKey = `premium-audit-${institutionId}-${organizationId}`;
      const data = localStorage.getItem(storageKey);
      const records: AuditRecord[] = data ? JSON.parse(data) : [];
      
      setExistingRecords(records);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifica se CPF já existe na organização (compatibilidade com v2.0)
   */
  const checkIfCpfExists = useCallback((cpf: string): AuditRecord | undefined => {
    return existingRecords.find(r => r.cpf === cpf);
  }, [existingRecords]);

  /**
   * Handler de submissão de avaliação (compatibilidade com v2.0)
   */
  const handleRecordSubmit = async (record: AuditRecord): Promise<void> => {
    try {
      const requiresApproval = organization?.settings?.assessments?.requireApproval ?? false;
      
      // TODO: Integrar com assessmentService, auditService e teamMemberService
      // Por enquanto, salva no localStorage com isolamento multi-tenant
      
      const storageKey = `premium-audit-${institutionId}-${organizationId}`;
      
      // Adiciona metadados multi-tenant ao record
      const enhancedRecord: AuditRecord & { 
        institutionId?: string; 
        organizationId?: string;
        requiresApproval?: boolean;
        approverId?: string;
        approvalStatus?: 'pending' | 'approved' | 'rejected';
      } = {
        ...record,
        institutionId,
        organizationId,
        requiresApproval,
        approverId: requiresApproval ? currentUser?.managerId : undefined,
        approvalStatus: requiresApproval ? 'pending' : undefined
      };
      
      // Atualiza ou adiciona record
      const existingIndex = existingRecords.findIndex(r => r.id === record.id);
      let updatedRecords: AuditRecord[];
      
      if (existingIndex >= 0) {
        // Atualização (expansão de perfis)
        updatedRecords = [...existingRecords];
        updatedRecords[existingIndex] = enhancedRecord;
      } else {
        // Novo record
        updatedRecords = [...existingRecords, enhancedRecord];
      }
      
      localStorage.setItem(storageKey, JSON.stringify(updatedRecords));
      setExistingRecords(updatedRecords);
      
      if (requiresApproval && existingIndex < 0) {
        // Novo record com aprovação pendente
        setPendingApproval(enhancedRecord);
        
        // TODO: Notificar gestor via notification system
        console.log(`📧 Notificação: Avaliação de ${record.name} aguarda aprovação de gestor ${currentUser?.managerId}`);
      } else {
        onAssessmentComplete?.(enhancedRecord);
      }
      
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      onError?.(error as Error);
      throw error; // Re-throw para UserPortal exibir erro
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <p className="text-lg text-brand-secondary animate-pulse">
          Carregando dados da organização...
        </p>
      </div>
    );
  }

  if (pendingApproval) {
    const requiresApprovalRecord = pendingApproval as AuditRecord & { 
      requiresApproval?: boolean;
      approvalStatus?: string;
    };
    
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Avaliação Aguardando Aprovação
              </h3>
              <p className="text-yellow-800 mb-4">
                A avaliação de <strong>{pendingApproval.name}</strong> foi enviada para aprovação
                do gestor imediato. O entrevistado será notificado quando a aprovação for concluída.
              </p>
              <div className="bg-white rounded-md p-4 mb-4">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Entrevistado</dt>
                    <dd className="text-gray-900">{pendingApproval.name}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Data</dt>
                    <dd className="text-gray-900">
                      {new Date(pendingApproval.date).toLocaleDateString('pt-BR')}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Perfil Principal</dt>
                    <dd className="text-gray-900">{pendingApproval.primaryProfile}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Status</dt>
                    <dd className="text-yellow-700 font-medium">Aguardando Aprovação</dd>
                  </div>
                </dl>
              </div>
              <button
                onClick={() => {
                  setPendingApproval(null);
                  onAssessmentComplete?.(pendingApproval);
                }}
                className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderiza UserPortal v2.0 original com handlers adaptados multi-tenant
  return (
    <div className="premium-user-portal" data-institution={institutionId} data-organization={organizationId}>
      <UserPortal
        checkIfCpfExists={checkIfCpfExists}
        onRecordSubmit={handleRecordSubmit}
      />
    </div>
  );
};
