import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard/funnel';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: 'var(--bg, #F4F6F8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: 520,
              width: '100%',
              background: 'var(--panel, #FFFFFF)',
              border: '1px solid var(--line, #E5EAEF)',
              borderRadius: 'var(--radius, 16px)',
              padding: '36px 28px',
              boxShadow: 'var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.08))',
              textAlign: 'center',
            }}
            className="animate-slide-up"
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
              }}
            >
              <AlertTriangle size={28} color="#EF4444" strokeWidth={2} />
            </div>

            <h2
              style={{
                fontFamily: 'Geist, sans-serif',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text, #11202A)',
                marginBottom: 8,
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                color: 'var(--text-2, #4A5A66)',
                fontSize: 14,
                lineHeight: 1.5,
                marginBottom: 24,
              }}
            >
              A UI rendering error occurred. You can reload the page or navigate back to the main dashboard.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'var(--panel-2, #F7F9FB)',
                  border: '1px solid var(--line, #E5EAEF)',
                  borderRadius: 'var(--radius-xs, 8px)',
                  padding: '12px',
                  fontSize: 12,
                  fontFamily: 'Geist Mono, monospace',
                  color: '#EF4444',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: 24,
                  maxHeight: 100,
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13 }}
              >
                <RotateCcw size={14} />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn btn-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13, border: '1px solid var(--line)' }}
              >
                <Home size={14} />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
