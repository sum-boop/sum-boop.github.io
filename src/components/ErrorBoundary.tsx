import { Component, type PropsWithChildren } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { contact } from '@/data/contact';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="error-boundary-shell" role="alert">
        <div className="error-boundary-card">
          <div className="error-boundary-icon">
            <AlertTriangle aria-hidden="true" size={24} />
          </div>
          <p className="mono-label">VIEWPORT RECOVERY</p>
          <h1>Something interrupted the view.</h1>
          <p>
            Reload the page to restore the portfolio, or reach Sumit Anand directly at{' '}
            <a href={`mailto:${contact.email}`}>{contact.email}</a>.
          </p>
          <div className="error-boundary-actions">
            <button
              className="button button--primary"
              onClick={() => window.location.reload()}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={16} />
              Reload portfolio
            </button>
            <a className="button button--quiet" href={`mailto:${contact.email}`}>
              Email Sumit
            </a>
          </div>
        </div>
      </main>
    );
  }
}
