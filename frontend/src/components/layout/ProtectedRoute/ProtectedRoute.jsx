import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getCurrentSession, logoutUser } from '../../../services/authService';

/**
 * Ensures a valid session exists in both React state and localStorage user directory.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, logout } = useAuth();

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
        aria-label="Checking session"
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

  const persisted = getCurrentSession();
  if (!user || !persisted || persisted.userId !== user.userId) {
    if (user && !persisted) {
      logoutUser();
      logout();
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
