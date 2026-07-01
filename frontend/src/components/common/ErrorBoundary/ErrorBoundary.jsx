import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../Button/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '250px',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          margin: '2rem'
        }}>
          <div style={{
            color: '#ef4444',
            marginBottom: '1rem'
          }}>
            <AlertTriangle size={48} />
          </div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Unexpected Error</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            A rendering error occurred in this page section. Reload the page to retry.
          </p>
          <Button icon={RefreshCw} onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
