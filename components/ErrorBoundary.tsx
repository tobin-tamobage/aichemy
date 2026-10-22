/**
 * ErrorBoundary - Catches rendering errors and displays a fallback UI
 * instead of crashing the entire application.
 */

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="page-loading">
          <div className="empty-state">
            <h1>
              Ada kendala pada halaman ini.
            </h1>
            <p className="muted">
              Muat ulang untuk kembali ke ruang kreasimu. Draft yang sudah tersimpan tetap ada di akun.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="button button-primary"
            >
              Muat Ulang Aichemy
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
