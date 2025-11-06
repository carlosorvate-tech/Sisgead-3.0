/**
 * SISGEAD Premium 3.0 - KPI Dashboard (Simplified)
 * Dashboard visual de KPIs ISO 30414
 */

import React from 'react';

interface KPIDashboardProps {
  institutionId: string;
  organizationId: string;
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  institutionId,
  organizationId
}) => {
  // Mock data - TODO: Integrar com kpiService
  const mockData = {
    turnoverRate: 8.5,
    retentionRate: 91.5,
    transferRate: 12.3,
    averageTenureMonths: 15,
    activeMembers: 42,
    totalAssessments: 42
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">KPIs ISO 30414</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Taxa de Rotatividade</h3>
          <p className="text-3xl font-bold text-green-600">{mockData.turnoverRate}%</p>
          <p className="text-xs text-gray-600">ISO 30414 Compliant</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Taxa de Retenção</h3>
          <p className="text-3xl font-bold text-blue-600">{mockData.retentionRate}%</p>
          <p className="text-xs text-gray-600">Meta: &gt;90%</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Taxa de Transferência</h3>
          <p className="text-3xl font-bold text-purple-600">{mockData.transferRate}%</p>
          <p className="text-xs text-gray-600">Mobilidade Interna</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Tempo Médio</h3>
          <p className="text-3xl font-bold text-gray-900">{mockData.averageTenureMonths} meses</p>
          <p className="text-xs text-gray-600">Permanência</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Membros Ativos</h3>
          <p className="text-3xl font-bold text-gray-900">{mockData.activeMembers}</p>
          <p className="text-xs text-gray-600">Headcount</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avaliações</h3>
          <p className="text-3xl font-bold text-indigo-600">{mockData.totalAssessments}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
      </div>
    </div>
  );
};
