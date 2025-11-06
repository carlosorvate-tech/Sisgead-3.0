/**
 * SISGEAD Premium 3.0 - Premium AdminDashboard
 * Wrapper multi-tenant do AdminDashboard v2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminDashboard } from '../AdminDashboard';
import type { AuditRecord } from '../../types';
import type { User } from '../../types/premium/user';

interface PremiumAdminDashboardProps {
  institutionId: string;
  organizationId: string;
  currentUser: User;
}

export const PremiumAdminDashboard: React.FC<PremiumAdminDashboardProps> = ({
  institutionId,
  organizationId,
  currentUser
}) => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [institutionId, organizationId]);

  const loadData = () => {
    // Carrega avaliações
    const auditKey = `premium-audit-${institutionId}-${organizationId}`;
    const auditData = localStorage.getItem(auditKey);
    const auditRecords: AuditRecord[] = auditData ? JSON.parse(auditData) : [];
    
    // Filtrar aprovados
    const approvedRecords = auditRecords.filter((r: any) => 
      !r.requiresApproval || r.approvalStatus === 'approved'
    );
    setRecords(approvedRecords);

    // Carrega times
    const teamsKey = `premium-teams-${institutionId}-${organizationId}`;
    const teamsData = localStorage.getItem(teamsKey);
    setTeams(teamsData ? JSON.parse(teamsData) : []);
  };

  const handleRecordUpdate = (updatedRecords: AuditRecord[]) => {
    const storageKey = `premium-audit-${institutionId}-${organizationId}`;
    const allRecords = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Atualiza apenas os aprovados
    const updated = allRecords.map((r: any) => {
      const found = updatedRecords.find(ur => ur.id === r.id);
      return found || r;
    });
    
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setRecords(updatedRecords);
  };

  const handleTeamUpdate = (updatedTeams: any[]) => {
    const storageKey = `premium-teams-${institutionId}-${organizationId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedTeams));
    setTeams(updatedTeams);
  };

  return (
    <div data-institution={institutionId} data-organization={organizationId}>
      <AdminDashboard
        initialRecords={records}
        initialTeams={teams}
        onRecordsUpdate={handleRecordUpdate}
        onTeamsUpdate={handleTeamUpdate}
      />
    </div>
  );
};
