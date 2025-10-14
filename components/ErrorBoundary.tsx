import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'sans-serif',
          backgroundColor: '#1a202c',
          color: '#e2e8f0',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#f56565', fontSize: '2.5rem', marginBottom: '1rem' }}>Oops! Something went wrong.</h1>
          <p style={{ fontSize: '1.2rem', color: '#a0aec0', maxWidth: '600px' }}>
            We're sorry for the inconvenience. An unexpected error occurred which prevented the application from loading.
            Please try refreshing the page. If the problem persists, please contact support.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#1a202c',
              backgroundColor: '#48bb78',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    // Fix: Corrected a TypeScript inference issue where `this.props` was not being recognized.
    return this.props.children; 
  }
}

export default ErrorBoundary;