import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

/** Redirects authenticated users away from login/register. */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
        role="status"
        aria-label="Loading"
      >
        <div
          className="animate-spin"
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--brand-primary)',
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}
