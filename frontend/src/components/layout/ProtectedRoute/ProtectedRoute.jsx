import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getCurrentSession, logoutUser } from '../../../services/authService';
import PageLoader from '../../common/PageLoader/PageLoader';

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
    return <PageLoader label="Checking session" minHeight="100vh" />;
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
