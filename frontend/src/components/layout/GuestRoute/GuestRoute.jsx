import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getCurrentSession } from '../../../services/authService';
import PageLoader from '../../common/PageLoader/PageLoader';

/** Redirects authenticated users away from login/register. */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Loading" minHeight="100vh" />;
  }

  const persisted = getCurrentSession();
  const isAuthed = Boolean(user && persisted && persisted.userId === user.userId);

  return isAuthed ? <Navigate to="/dashboard" replace /> : children;
}
