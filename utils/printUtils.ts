/**
 * Enhanced Print Utility for SISGEAD 2.0
 * Provides improved printing capabilities for multi-page documents
 */

export interface PrintOptions {
  title?: string;
  includeStyles?: boolean;
  customStyles?: string;
  paperSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

/**
 * Enhanced print function that creates a dedicated print window
 * with optimized styles for multi-page documents
 */
export const enhancedPrint = (elementSelector: string, options: PrintOptions = {}) => {
  const {
    title = 'SISGEAD 2.0 - Relatório',
    includeStyles = true,
    customStyles = '',
    paperSize = 'A4',
    orientation = 'portrait',
    margins = { top: '1.5cm', right: '2cm', bottom: '1.5cm', left: '2cm' }
  } = options;

  // Get the element to print
  const element = document.querySelector(elementSelector);
  if (!element) {
    console.error('Print element not found:', elementSelector);
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  // Get current page styles
  const currentStyles = includeStyles ? Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        // Handle CORS issues with external stylesheets
        const linkElement = document.querySelector(`link[href="${styleSheet.href}"]`);
        return linkElement ? `<link rel="stylesheet" href="${styleSheet.href}">` : '';
      }
    })
    .join('\n') : '';

  // Enhanced print styles
  const printStyles = `
    <style>
      @page {
        size: ${paperSize} ${orientation};
        margin: ${margins.top || '1.5cm'} ${margins.right || '2cm'} ${margins.bottom || '1.5cm'} ${margins.left || '2cm'};
      }
      
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.4;
        color: #000;
        background: white;
        margin: 0;
        padding: 0;
      }
      
      /* Hide elements not meant for print */
      .print-hidden, .no-print, button, .btn {
        display: none !important;
      }
      
      /* Page break controls */
      .print-page-break {
        page-break-before: always;
      }
      
      .print-avoid-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        break-after: avoid;
        color: #000 !important;
      }
      
      h1 { font-size: 18pt; margin: 0 0 12pt 0; }
      h2 { font-size: 16pt; margin: 16pt 0 8pt 0; }
      h3 { font-size: 14pt; margin: 12pt 0 6pt 0; }
      h4, h5, h6 { font-size: 12pt; margin: 8pt 0 4pt 0; }
      
      /* Content blocks */
      .card, .bg-white, .bg-slate-100, .bg-indigo-50, .bg-blue-50, 
      .bg-green-50, .bg-amber-50, .bg-gray-800 {
        background: white !important;
        border: 1px solid #d1d5db !important;
        border-radius: 4pt !important;
        padding: 8pt !important;
        margin-bottom: 8pt !important;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      /* Charts and complex elements */
      .recharts-wrapper, .recharts-container {
        page-break-inside: avoid;
        break-inside: avoid;
        margin-bottom: 12pt;
      }
      
      /* Grid layouts for print */
      .grid {
        display: block !important;
      }
      
      .grid > * {
        margin-bottom: 8pt;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      /* Lists */
      ul, ol {
        margin: 4pt 0;
        padding-left: 16pt;
      }
      
      li {
        margin-bottom: 2pt;
      }
      
      /* Tables */
      table {
        width: 100%;
        border-collapse: collapse;
        page-break-inside: auto;
      }
      
      th, td {
        border: 1px solid #000;
        padding: 4pt;
        text-align: left;
      }
      
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      /* Text formatting */
      p {
        margin: 4pt 0;
        orphans: 3;
        widows: 3;
      }
      
      /* Links */
      a {
        color: #000 !important;
        text-decoration: underline;
      }
      
      /* Code blocks */
      code, pre {
        font-family: "Courier New", monospace;
        font-size: 9pt;
        background: #f5f5f5 !important;
        padding: 2pt;
        border: 1px solid #ccc;
      }
      
      /* Ensure content visibility */
      .printable-section {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
      }
      
      /* Custom styles */
      ${customStyles}
    </style>
  `;

  // Build the complete HTML document
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${includeStyles ? `<style>${currentStyles}</style>` : ''}
      ${printStyles}
    </head>
    <body>
      ${element.outerHTML}
      <script>
        // Wait for content to load, then print
        window.onload = function() {
          // Small delay to ensure all content is rendered
          setTimeout(function() {
            window.print();
            // Close window after printing (optional)
            // window.close();
          }, 500);
        };
        
        // Handle print dialog close
        window.onafterprint = function() {
          // Optionally close the window after printing
          // window.close();
        };
      </script>
    </body>
    </html>
  `;

  // Write content and trigger print
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Focus the print window
  printWindow.focus();
};

/**
 * Simple print function that uses the enhanced print utility
 * for the main printable section
 */
export const printReport = (options: PrintOptions = {}) => {
  enhancedPrint('.printable-section', {
    title: 'SISGEAD 2.0 - Relatório de Perfil',
    ...options
  });
};

/**
 * Print function specifically for proposals
 */
export const printProposal = (options: PrintOptions = {}) => {
  enhancedPrint('.printable-section', {
    title: 'SISGEAD 2.0 - Proposta de Equipe',
    ...options
  });
};