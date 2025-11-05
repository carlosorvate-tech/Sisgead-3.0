import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 p-8">
          <h1 className="text-3xl font-bold text-red-700 mb-4">Ocorreu um erro inesperado.</h1>
          <p className="text-red-600 mb-6">A aplicação encontrou um problema e não pode continuar. Por favor, recarregue a página.</p>
          <details className="p-4 bg-white border border-red-200 rounded-md w-full max-w-2xl text-left">
            <summary className="font-semibold cursor-pointer">Detalhes do Erro</summary>
            <pre className="mt-4 text-sm text-gray-700 whitespace-pre-wrap break-all">
              {this.state.error?.toString()}
            </pre>
          </details>
           <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700"
            >
                Recarregar Aplicação
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}