import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Importar a configuração do i18next

console.log("main.tsx: Iniciando renderização do JumboIA");

// Tipos para o ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Adiciona manipulador de erros global
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Erro capturado pelo ErrorBoundary:", error);
    console.error("Informações do componente:", errorInfo);
    this.setState({ errorInfo });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ 
          margin: '20px', 
          padding: '20px', 
          border: '2px solid #f44336',
          borderRadius: '8px',
          backgroundColor: '#ffebee'
        }}>
          <h2 style={{ color: '#d32f2f' }}>Algo deu errado.</h2>
          <p>O aplicativo encontrou um erro. Por favor, tente atualizar a página.</p>
          <details style={{ marginTop: '15px', whiteSpace: 'pre-wrap' }}>
            <summary>Detalhes do erro</summary>
            <div>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recarregar Aplicação
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Verifica se o elemento root existe
const rootElement = document.getElementById('root');
console.log("main.tsx: Elemento root encontrado?", !!rootElement);

if (rootElement) {
  try {
    console.log("main.tsx: Criando root e renderizando aplicação");
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("main.tsx: Renderização iniciada com sucesso");
  } catch (error) {
    console.error("main.tsx: Erro durante a renderização:", error);
  }
} else {
  console.error("main.tsx: Elemento root não encontrado!");
} 