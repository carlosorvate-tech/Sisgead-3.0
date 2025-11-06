/**
 * SISGEAD Premium 3.0 - Approval Dashboard
 * Dashboard para gestores aprovarem/rejeitarem avaliações
 */

import React, { useState, useEffect } from 'react';
import type { AuditRecord } from '../../types';
import type { User } from '../../types/premium/user';

interface ApprovalDashboardProps {
  currentUser: User;
  institutionId: string;
  organizationId: string;
  onApprove?: (recordId: string) => void;
  onReject?: (recordId: string, reason: string) => void;
}

interface PendingRecord extends AuditRecord {
  requiresApproval?: boolean;
  approverId?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({
  currentUser,
  institutionId,
  organizationId,
  onApprove,
  onReject
}) => {
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PendingRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPendingApprovals();
  }, [institutionId, organizationId, currentUser.id]);

  const loadPendingApprovals = () => {
    const storageKey = `premium-audit-${institutionId}-${organizationId}`;
    const data = localStorage.getItem(storageKey);
    const records: PendingRecord[] = data ? JSON.parse(data) : [];
    
    const pending = records.filter(
      r => r.requiresApproval && 
           r.approvalStatus === 'pending' && 
           r.approverId === currentUser.id
    );
    
    setPendingRecords(pending);
  };

  const handleApprove = (recordId: string) => {
    const storageKey = `premium-audit-${institutionId}-${organizationId}`;
    const data = localStorage.getItem(storageKey);
    const records: PendingRecord[] = data ? JSON.parse(data) : [];
    
    const updated = records.map(r => 
      r.id === recordId 
        ? { ...r, approvalStatus: 'approved' as const, approvedAt: new Date().toISOString() }
        : r
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setPendingRecords(prev => prev.filter(r => r.id !== recordId));
    setSelectedRecord(null);
    onApprove?.(recordId);
  };

  const handleReject = (recordId: string) => {
    if (!rejectionReason.trim()) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }

    const storageKey = `premium-audit-${institutionId}-${organizationId}`;
    const data = localStorage.getItem(storageKey);
    const records: PendingRecord[] = data ? JSON.parse(data) : [];
    
    const updated = records.map(r => 
      r.id === recordId 
        ? { 
            ...r, 
            approvalStatus: 'rejected' as const, 
            rejectedAt: new Date().toISOString(),
            rejectionReason 
          }
        : r
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setPendingRecords(prev => prev.filter(r => r.id !== recordId));
    setSelectedRecord(null);
    setRejectionReason('');
    onReject?.(recordId, rejectionReason);
  };

  if (pendingRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma aprovação pendente</h3>
        <p className="text-gray-500">Todas as avaliações foram processadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Aprovações Pendentes ({pendingRecords.length})
      </h2>

      <div className="grid gap-4">
        {pendingRecords.map(record => (
          <div key={record.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{record.name}</h3>
                <p className="text-sm text-gray-600 mt-1">CPF: {record.cpf}</p>
                <p className="text-sm text-gray-600">
                  Data: {new Date(record.date).toLocaleDateString('pt-BR')}
                </p>
                <div className="mt-3 flex gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Perfil Principal</span>
                    <p className="font-medium">{record.primaryProfile}</p>
                  </div>
                  {record.secondaryProfile && (
                    <div>
                      <span className="text-xs text-gray-500">Perfil Secundário</span>
                      <p className="font-medium">{record.secondaryProfile}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Revisar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">Revisar Avaliação</h3>
            
            <dl className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <dt className="text-sm text-gray-500">Nome</dt>
                <dd className="font-medium">{selectedRecord.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">CPF</dt>
                <dd className="font-medium">{selectedRecord.cpf}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Perfil Principal</dt>
                <dd className="font-medium">{selectedRecord.primaryProfile}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Perfil Secundário</dt>
                <dd className="font-medium">{selectedRecord.secondaryProfile || 'N/A'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-gray-500">Scores DISC</dt>
                <dd className="font-medium">
                  D: {selectedRecord.scores.D} | I: {selectedRecord.scores.I} | 
                  S: {selectedRecord.scores.S} | C: {selectedRecord.scores.C}
                </dd>
              </div>
            </dl>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da rejeição (se aplicável)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Descreva o motivo caso vá rejeitar..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(selectedRecord.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Rejeitar
              </button>
              <button
                onClick={() => handleApprove(selectedRecord.id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
