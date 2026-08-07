import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getCurrentSession, logoutUser } from '../../../services/authService';

/**
 * Ensures a valid session exists in both React state and localStorage user directory.
 * Session is re-validated when `user` identity changes — not on every parent re-render.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, logout } = useAuth();

  const gate = useMemo(() => {
    if (!user?.userId) {
      return { ok: false, clear: false };
    }
    const persisted = getCurrentSession();
    if (!persisted || persisted.userId !== user.userId) {
      return { ok: false, clear: Boolean(user && !persisted) };
    }
    return { ok: true, clear: false };
  }, [user]);

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

  if (!gate.ok) {
    if (gate.clear) {
      logoutUser();
      logout();
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
