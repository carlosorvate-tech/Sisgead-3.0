/**
 * React Hook for Enhanced Printing in SISGEAD 2.0
 */

import { useCallback } from 'react';
import { printReport, printProposal, type PrintOptions } from '../printUtils';
import { generateReportFileName, generateDownloadFileName, type ReportNameOptions } from '../reportNaming';

export interface UsePrintOptions extends PrintOptions {
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  onPrintError?: (error: Error) => void;
  // Opções para nomenclatura de relatórios
  reportType?: 'profile' | 'team-proposal' | 'ai-consultation' | 'mediation-plan' | 'communication-analysis';
  reportOptions?: ReportNameOptions;
}

export const usePrint = (options: UsePrintOptions = {}) => {
  const { onBeforePrint, onAfterPrint, onPrintError, reportType, reportOptions, ...printOptions } = options;

  // Função auxiliar para criar janela de impressão
  const createPrintWindow = useCallback((content: string, title: string) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (!printWindow) {
      alert('Erro: Não foi possível abrir janela de impressão. Verifique bloqueador de popup.');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4 portrait;
              margin: 1.5cm 2cm 1.5cm 2cm;
            }
            
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              font-size: 11pt;
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background: white;
            }
            
            .print-hidden, .no-print, button, .btn, nav, footer {
              display: none !important;
            }
            
            h1 { 
              color: #1e40af !important; 
              border-bottom: 2px solid #e5e7eb !important; 
              padding-bottom: 10px; 
              break-after: avoid;
            }
            
            h2, h3, h4 { 
              color: #1f2937 !important; 
              break-after: avoid;
            }
            
            .report-header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: #f8fafc !important;
              border-radius: 8px;
              border: 1px solid #e2e8f0 !important;
              break-inside: avoid;
            }
            
            .bg-blue-50, .bg-indigo-50, .bg-gray-50, .bg-green-50, .bg-amber-50, .bg-red-50 {
              background-color: #f8fafc !important;
              border: 1px solid #e2e8f0 !important;
              padding: 15px !important;
              border-radius: 6px !important;
              margin: 10px 0 !important;
              break-inside: avoid;
            }
            
            .prose {
              max-width: none;
            }
            
            ul, ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            
            li {
              margin-bottom: 5px;
            }
            
            @media print {
              body { margin: 0; padding: 15mm; }
              .report-header { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>${title}</h1>
            <p>SISGEAD 2.0 - Sistema de Gestão de Equipes de Alto Desempenho</p>
            <p>© ${new Date().getFullYear()} INFINITUS Sistemas Inteligentes LTDA</p>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div class="content">
            ${content}
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  }, []);

  const handlePrint = useCallback((type: 'report' | 'proposal' = 'report') => {
    try {
      onBeforePrint?.();
      
      // Gerar nome do relatório baseado no tipo
      let title = printOptions.title;
      if (reportType && reportOptions) {
        title = generateReportFileName(reportType, reportOptions);
      }
      
      const enhancedOptions = {
        ...printOptions,
        title: title || printOptions.title
      };
      
      if (type === 'report') {
        printReport(enhancedOptions);
      } else {
        printProposal(enhancedOptions);
      }
      
      // onAfterPrint will be called from the print window
      setTimeout(() => {
        onAfterPrint?.();
      }, 1000);
      
    } catch (error) {
      onPrintError?.(error instanceof Error ? error : new Error('Print failed'));
    }
  }, [onBeforePrint, onAfterPrint, onPrintError, reportType, reportOptions, printOptions]);

  const printReportHandler = useCallback(() => {
    handlePrint('report');
  }, [handlePrint]);

  const printProposalHandler = useCallback(() => {
    handlePrint('proposal');
  }, [handlePrint]);

  // Funções específicas para cada tipo de relatório
  const printProfileReport = useCallback((personName: string) => {
    try {
      const element = document.querySelector('.printable-section');
      if (!element) {
        alert('Erro: Conteúdo para impressão não encontrado.');
        return;
      }
      
      const title = generateReportFileName('profile', { personName });
      createPrintWindow(element.innerHTML, title);
    } catch (error) {
      console.error('Failed to print profile report:', error);
      alert('Erro ao imprimir relatório de perfil. Tente novamente.');
    }
  }, [createPrintWindow]);

  const printTeamProposalReport = useCallback((teamName?: string, projectName?: string) => {
    try {
      const element = document.querySelector('.printable-section');
      if (!element) {
        alert('Erro: Conteúdo para impressão não encontrado.');
        return;
      }
      
      const title = generateReportFileName('team-proposal', { teamName: teamName || 'Equipe', projectName });
      createPrintWindow(element.innerHTML, title);
    } catch (error) {
      console.error('Failed to print team report:', error);
      alert('Erro ao imprimir relatório de equipe. Tente novamente.');
    }
  }, [createPrintWindow]);

  const printAIConsultation = useCallback((query: string) => {
    try {
      const element = document.querySelector('.printable-section');
      if (!element) {
        alert('Erro: Conteúdo para impressão não encontrado.');
        return;
      }
      
      const title = generateReportFileName('ai-consultation', { query });
      createPrintWindow(element.innerHTML, title);
    } catch (error) {
      console.error('Failed to print AI consultation:', error);
      alert('Erro ao imprimir consulta IA. Tente novamente.');
    }
  }, [createPrintWindow]);

  const printMediationPlan = useCallback((problem: string, teamName?: string, projectName?: string) => {
    try {
      const element = document.querySelector('.printable-section');
      if (!element) {
        alert('Erro: Conteúdo para impressão não encontrado.');
        return;
      }
      
      const title = generateReportFileName('mediation-plan', { problem, teamName, projectName });
      createPrintWindow(element.innerHTML, title);
    } catch (error) {
      console.error('Failed to print mediation plan:', error);
      alert('Erro ao imprimir plano de mediação. Tente novamente.');
    }
  }, [createPrintWindow]);

  const printCommunicationAnalysis = useCallback((teamName?: string, projectName?: string) => {
    try {
      const element = document.querySelector('.printable-section');
      if (!element) {
        alert('Erro: Conteúdo para impressão não encontrado.');
        return;
      }
      
      const title = generateReportFileName('communication-analysis', { teamName, projectName });
      createPrintWindow(element.innerHTML, title);
    } catch (error) {
      console.error('Failed to print communication analysis:', error);
      alert('Erro ao imprimir análise de comunicação. Tente novamente.');
    }
  }, [createPrintWindow]);

  return {
    printReport: printReportHandler,
    printProposal: printProposalHandler,
    print: handlePrint,
    // Funções específicas com nomenclatura automática
    printProfileReport,
    printTeamProposalReport,
    printAIConsultation,
    printMediationPlan,
    printCommunicationAnalysis,
    // Utilitários de nomenclatura
    generateReportName: (type: any, options: ReportNameOptions) => generateReportFileName(type, options),
    generateDownloadName: (type: any, options: ReportNameOptions, ext?: string) => generateDownloadFileName(type, options, ext)
  };
};



/**
 * Hook specifically for ResultsScreen printing
 * Atualizado para usar sistema de nomenclatura padronizada
 */
export const useResultsPrint = (personName?: string) => {
  const printReport = useCallback(() => {
    try {
      console.log('Preparing report for printing...');
      
      // Buscar o elemento principal da página de resultados
      const element = document.querySelector('.printable-section') || 
                     document.querySelector('[data-testid="results-screen"]') ||
                     document.querySelector('main') ||
                     document.body;
      
      if (!element) {
        console.error('Print element not found');
        alert('Erro: Não foi possível encontrar o conteúdo para impressão.');
        return;
      }

      // Gerar título do relatório
      const title = personName 
        ? generateReportFileName('profile', { personName })
        : 'SISGEAD 2.0 - Relatório de Perfil Comportamental';

      // Criar janela de impressão
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      if (!printWindow) {
        console.error('Failed to open print window - popup blocked?');
        alert('Erro: Não foi possível abrir a janela de impressão. Verifique se o bloqueador de popup está desabilitado.');
        return;
      }

      // Capturar estilos da página atual
      const styleSheets = Array.from(document.styleSheets);
      let styles = '';
      
      styleSheets.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            styles += Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
          }
        } catch (e) {
          // Ignorar erros de CORS para folhas de estilo externas
        }
      });

      // HTML da janela de impressão
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta charset="utf-8">
            <style>
              ${styles}
              
              @page {
                size: A4 portrait;
                margin: 1.5cm 2cm 1.5cm 2cm;
              }
              
              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
                font-size: 11pt;
                line-height: 1.4;
                color: #000;
                background: white;
                margin: 0;
                padding: 20px;
              }
              
              .print-hidden, .no-print, button, .btn, nav, footer {
                display: none !important;
              }
              
              .print-page-break {
                page-break-before: always;
              }
              
              .print-avoid-break {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              
              h1, h2, h3 { 
                break-after: avoid; 
                color: #1e40af !important;
              }
              
              .report-header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: #f8fafc !important;
                border: 1px solid #e2e8f0 !important;
                border-radius: 8px;
              }
              
              .chart-container {
                break-inside: avoid;
                margin: 20px 0;
              }
              
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 10px 0;
              }
              
              th, td {
                border: 1px solid #ddd !important;
                padding: 8px;
                text-align: left;
              }
              
              th {
                background-color: #f8f9fa !important;
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              <h1>${title}</h1>
              <p>SISGEAD 2.0 - Sistema de Gestão de Equipes de Alto Desempenho</p>
              <p>© ${new Date().getFullYear()} INFINITUS Sistemas Inteligentes LTDA</p>
              <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            ${element.innerHTML}
            
            <script>
              window.onload = function() {
                // Aguardar um momento para garantir que tudo foi carregado
                setTimeout(() => {
                  window.print();
                  
                  // Fechar janela após impressão
                  window.onafterprint = function() {
                    window.close();
                  };
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      console.log('Report print completed');
      
    } catch (error) {
      console.error('Failed to print report:', error);
      alert('Erro ao imprimir relatório. Tente novamente ou use Ctrl+P.');
    }
  }, [personName]);

  return { printReport };
};

/**
 * Hook específico para impressão de propostas com nomenclatura automática
 * Atualizado para usar sistema de nomenclatura padronizada
 */
export const useProposalPrint = () => {
  const printProposal = useCallback(() => {
    try {
      console.log('Preparing proposal for printing...');
      
      // Buscar o elemento principal da proposta (geralmente dentro de um modal)
      const element = document.querySelector('.printable-section') || 
                     document.querySelector('[data-testid="proposal-content"]') ||
                     document.querySelector('.modal-content .space-y-4') ||
                     document.querySelector('.prose');
      
      if (!element) {
        console.error('Print element not found for proposal');
        alert('Erro: Não foi possível encontrar o conteúdo da proposta para impressão.');
        return;
      }

      // Gerar título da proposta
      const title = 'SISGEAD 2.0 - Proposta de Equipe';

      // Criar janela de impressão
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      if (!printWindow) {
        console.error('Failed to open print window for proposal');
        alert('Erro: Não foi possível abrir a janela de impressão. Verifique se o bloqueador de popup está desabilitado.');
        return;
      }

      // HTML da janela de impressão
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta charset="utf-8">
            <style>
              @page {
                size: A4 portrait;
                margin: 1.5cm 2cm 1.5cm 2cm;
              }
              
              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                font-size: 11pt;
                line-height: 1.6; 
                color: #333; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px;
                background: white;
              }
              
              .print-hidden, .no-print, button, .btn, nav, footer {
                display: none !important;
              }
              
              h1 { 
                color: #1e40af !important; 
                border-bottom: 2px solid #e5e7eb !important; 
                padding-bottom: 10px; 
                break-after: avoid;
              }
              
              h2 { 
                color: #1f2937 !important; 
                margin-top: 30px; 
                break-after: avoid;
              }
              
              h3 { 
                color: #374151 !important; 
                break-after: avoid;
              }
              
              h4 { 
                color: #4b5563 !important; 
                break-after: avoid;
              }
              
              .report-header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: #f8fafc !important;
                border-radius: 8px;
                border: 1px solid #e2e8f0 !important;
                break-inside: avoid;
              }
              
              .content { 
                white-space: pre-wrap; 
              }
              
              p {
                margin-bottom: 12px;
              }
              
              ul, ol {
                margin: 10px 0;
                padding-left: 20px;
              }
              
              li {
                margin-bottom: 5px;
              }
              
              strong, b {
                color: #1f2937 !important;
              }
              
              .bg-blue-50, .bg-indigo-50, .bg-gray-50 {
                background-color: #f8fafc !important;
                border: 1px solid #e2e8f0 !important;
                padding: 15px !important;
                border-radius: 6px !important;
                margin: 10px 0 !important;
              }
              
              .text-blue-600, .text-indigo-600 {
                color: #2563eb !important;
              }
              
              .text-gray-600 {
                color: #4b5563 !important;
              }
              
              .prose {
                max-width: none;
              }
              
              @media print {
                body { margin: 0; padding: 15mm; }
                .report-header { break-inside: avoid; }
                .bg-blue-50, .bg-indigo-50, .bg-gray-50 {
                  break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              <h1>${title}</h1>
              <p>SISGEAD 2.0 - Sistema de Gestão de Equipes de Alto Desempenho</p>
              <p>© ${new Date().getFullYear()} INFINITUS Sistemas Inteligentes LTDA</p>
              <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div class="content">
              ${element.innerHTML}
            </div>
            
            <script>
              window.onload = function() {
                // Aguardar um momento para garantir que tudo foi carregado
                setTimeout(() => {
                  window.print();
                  
                  // Fechar janela após impressão
                  window.onafterprint = function() {
                    window.close();
                  };
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      console.log('Proposal print completed');
      
    } catch (error) {
      console.error('Failed to print proposal:', error);
      alert('Erro ao imprimir proposta. Tente novamente ou use Ctrl+P.');
    }
  }, []);

  return { printProposal };
};