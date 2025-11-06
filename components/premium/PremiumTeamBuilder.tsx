/**
 * SISGEAD Premium 3.0 - Premium TeamBuilder
 * Wrapper multi-tenant do TeamBuilder v2.0
 */

import React, { useState, useEffect } from 'react';
import { TeamBuilder } from '../TeamBuilder';
import type { AuditRecord } from '../../types';

interface PremiumTeamBuilderProps {
  institutionId: string;
  organizationId: string;
  onTeamCreated?: (team: any) => void;
}

export const PremiumTeamBuilder: React.FC<PremiumTeamBuilderProps> = ({
  institutionId,
  organizationId,
  onTeamCreated
}) => {
  const [records, setRecords] = useState<AuditRecord[]>([]);

  useEffect(() => {
    loadRecords();
  }, [institutionId, organizationId]);

  const loadRecords = () => {
    const storageKey = `premium-audit-${institutionId}-${organizationId}`;
    const data = localStorage.getItem(storageKey);
    const allRecords: AuditRecord[] = data ? JSON.parse(data) : [];
    
    // Filtrar apenas aprovados ou sem necessidade de aprovação
    const approvedRecords = allRecords.filter((r: any) => 
      !r.requiresApproval || r.approvalStatus === 'approved'
    );
    
    setRecords(approvedRecords);
  };

  const handleTeamSubmit = (team: any) => {
    // Adiciona contexto multi-tenant
    const enhancedTeam = {
      ...team,
      institutionId,
      organizationId,
      createdAt: new Date().toISOString()
    };
    
    // Salva com isolamento
    const storageKey = `premium-teams-${institutionId}-${organizationId}`;
    const teams = JSON.parse(localStorage.getItem(storageKey) || '[]');
    teams.push(enhancedTeam);
    localStorage.setItem(storageKey, JSON.stringify(teams));
    
    onTeamCreated?.(enhancedTeam);
  };

  return (
    <div data-institution={institutionId} data-organization={organizationId}>
      <TeamBuilder 
        initialRecords={records}
        onTeamSubmit={handleTeamSubmit}
      />
    </div>
  );
};
