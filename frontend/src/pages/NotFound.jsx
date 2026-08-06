import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button/Button';

export default function NotFound() {
  const { user } = useAuth();
  const home = user ? '/dashboard' : '/login';

  return (
    <main
      className="auth-page"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: 420 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
          404
        </p>
        <h1 style={{ margin: '0.5rem 0', fontSize: '1.5rem' }}>Page not found</h1>
        <p style={{ marginBottom: '1.5rem' }}>
          The page you requested does not exist or has been moved.
        </p>
        <Link to={home}>
          <Button>{user ? 'Back to Dashboard' : 'Go to Login'}</Button>
        </Link>
      </div>
    </main>
  );
}
