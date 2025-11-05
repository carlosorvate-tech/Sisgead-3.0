import React, { useMemo } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { type AuditRecord, type DISCProfile } from '../types';
import { PROFILE_COLORS } from '../constants';
import { CsvIcon, PrintIcon } from './icons';
import { usePrint } from '../utils/hooks/usePrint';

interface TeamReportViewProps {
    auditLog: AuditRecord[];
}
export const TeamReportView: React.FC<TeamReportViewProps> = ({ auditLog }) => {
    const { printTeamProposalReport } = usePrint();
    
    const { counts, total } = useMemo(() => {
        const calculatedCounts = auditLog.reduce((acc, record) => {
            acc[record.primaryProfile] = (acc[record.primaryProfile] || 0) + 1;
            return acc;
        }, {} as Record<DISCProfile, number>);
        return { counts: calculatedCounts, total: auditLog.length };
    }, [auditLog]);

    const chartData = useMemo(() => {
        return (['D', 'I', 'S', 'C'] as DISCProfile[]).map(p => ({
            name: `Perfil ${p}`,
            value: counts[p] || 0,
        }));
    }, [counts]);
    
    const handleExportReport = () => {
        const header = ['Perfil', 'Contagem', 'Porcentagem'];
        const rows = chartData.map(d => {
            const percentage = total > 0 ? ((d.value / total) * 100).toFixed(2) + '%' : '0%';
            return [d.name, d.value, percentage].join(',');
        });
        const csvContent = "data:text/csv;charset=utf-8," + [header.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `disc_team_report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (total === 0) {
        return <div className="p-8 text-center text-gray-500">Nenhum dado de avaliação disponível para gerar o relatório.</div>
    }

    return (
        <div className="printable-section p-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <p className="text-brand-secondary">Análise da distribuição de perfis comportamentais na equipe.</p>
                <div className="flex gap-2 print-hidden">
                    <button 
                        onClick={() => printTeamProposalReport('Relatório de Equipe')} 
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
                    >
                        <PrintIcon className="w-4 h-4" />
                        Imprimir
                    </button>
                    <button onClick={handleExportReport} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">
                        <CsvIcon /> Exportar Relatório
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                     <h4 className="font-semibold mb-4 text-brand-dark">Distribuição de Perfis</h4>
                     <div className="grid grid-cols-2 gap-4">
                        {(['D', 'I', 'S', 'C'] as DISCProfile[]).map(p => (
                            <div key={p} className="p-4 rounded-lg" style={{backgroundColor: `${PROFILE_COLORS[p]}1A`}}>
                                <div className="text-3xl font-bold" style={{color: PROFILE_COLORS[p]}}>{counts[p] || 0}</div>
                                <div className="text-sm font-semibold" style={{color: PROFILE_COLORS[p]}}>Perfil {p} ({total > 0 ? (( (counts[p] || 0) / total) * 100).toFixed(1) : 0}%)</div>
                            </div>
                        ))}
                     </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                             <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PROFILE_COLORS[entry.name.slice(-1) as DISCProfile]} />
                                ))}
                             </Pie>
                             <Tooltip />
                             <Legend />
                         </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
// bycao (ogrorvatigão) 2025