import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <main className="min-h-screen bg-brand-light flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none">
                {children}
            </div>
            <style>{`
                @media print {
                  body, html {
                    background-color: white !important;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                  }
                  
                  main {
                    padding: 0 !important;
                    margin: 0 !important;
                    max-width: none !important;
                  }
                  
                  .print-hidden {
                    display: none !important;
                  }
                  
                  #root, #root > div {
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                  }
                  
                  .printable-section {
                    position: static !important;
                    left: auto !important;
                    top: auto !important;
                    width: 100% !important;
                    height: auto !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    visibility: visible !important;
                    display: block !important;
                  }
                  
                  .printable-section * {
                    visibility: visible !important;
                  }
                  
                  /* Ensure content flows naturally across pages */
                  .printable-section > div {
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 1rem !important;
                  }
                }
            `}</style>
        </main>
    );
};
// bycao (ogrorvatigão) 2025