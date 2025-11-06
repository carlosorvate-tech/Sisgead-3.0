/**
 * SISGEAD Premium 3.0 - Transfer UI
 * Interface para transferências inter-organizacionais
 */

import React, { useState } from 'react';
import type { User } from '../../types/premium/user';

interface TransferUIProps {
  institutionId: string;
  sourceOrgId: string;
  currentUser: User;
  onTransferComplete?: (transferId: string) => void;
}

export const TransferUI: React.FC<TransferUIProps> = ({
  institutionId,
  sourceOrgId,
  currentUser,
  onTransferComplete
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [targetOrgId, setTargetOrgId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!selectedMemberId || !targetOrgId || !reason.trim()) {
      alert('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrar com teamMemberService.transferMember()
      const transferId = crypto.randomUUID();
      
      console.log(`✅ Transferência ${transferId}: Membro ${selectedMemberId} de ${sourceOrgId} para ${targetOrgId}`);
      console.log(`   Motivo: ${reason}`);
      console.log(`   Executado por: ${currentUser.email}`);
      
      alert('Transferência realizada com sucesso!');
      onTransferComplete?.(transferId);
      
      setSelectedMemberId('');
      setTargetOrgId('');
      setReason('');
    } catch (error) {
      console.error('Erro na transferência:', error);
      alert('Erro ao realizar transferência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Transferência Inter-Organizacional</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>Sem necessidade de aprovação:</strong> Transferências entre organizações da mesma instituição são processadas imediatamente.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Membro a Transferir
          </label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Selecione um membro...</option>
            <option value="member_001">João Silva (DISC: D-I)</option>
            <option value="member_002">Maria Santos (DISC: I-S)</option>
            <option value="member_003">Carlos Oliveira (DISC: S-C)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organização Destino
          </label>
          <select
            value={targetOrgId}
            onChange={(e) => setTargetOrgId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Selecione a organização...</option>
            <option value="org_ti_001">TI - Desenvolvimento</option>
            <option value="org_rh_002">RH - Recrutamento</option>
            <option value="org_ops_003">Operações</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo da Transferência
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="Descreva o motivo da transferência..."
          />
        </div>

        <button
          onClick={handleTransfer}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processando...' : 'Transferir Membro'}
        </button>
      </div>
    </div>
  );
};
