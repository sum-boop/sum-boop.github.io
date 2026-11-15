import { ArrowLeft, Radio } from 'lucide-react';

interface NotFoundProps {
  onReturn: () => void;
}

export function NotFound({ onReturn }: NotFoundProps) {
  return (
    <main className="not-found-shell" id="main-content">
      <div className="not-found-card">
        <p className="mono-label">
          <Radio aria-hidden="true" size={14} /> SIGNAL 404 · ROUTE NOT FOUND
        </p>
        <h1>This channel is offline.</h1>
        <p>
          The requested path does not match a portfolio route. Return to the main command center to
          inspect deployments, operational history, credentials, and direct contact channels.
        </p>
        <button className="button button--primary" onClick={onReturn} type="button">
          <ArrowLeft aria-hidden="true" size={16} />
          Return to portfolio
        </button>
      </div>
    </main>
  );
}
