import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Signature } from 'lucide-react';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import ThemeToggle from '../../components/common/ThemeToggle/ThemeToggle';
import Alert from '../../components/common/Alert/Alert';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import './Auth.css';

/**
 * Password reset is not wired to a backend yet.
 * This page documents the limitation honestly instead of faking an email send.
 */
export default function ForgotPassword() {
  useDocumentTitle('Forgot password');
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setAcknowledged(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-decoration" aria-hidden="true" />
      <div className="auth-theme-toggle"><ThemeToggle /></div>

      <main id="main-content" className="auth-card animate-scale-in" tabIndex={-1}>
        <div className="auth-logo">
          <div className="auth-logo-icon"><Signature size={22} color="white" /></div>
          <span className="auth-logo-text">Career Doc Hub</span>
        </div>

        {acknowledged ? (
          <div className="forgot-success">
            <Alert tone="info">
              Password reset email is not available in this local-first demo.
              When the Spring Boot API ships, reset links will be sent from the server.
              For now, create a new account or use your existing local credentials.
            </Alert>
            <div style={{ marginTop: '1.25rem' }}>
              <Link to="/login">
                <Button variant="outline">Back to Sign In</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="auth-title">Forgot password?</h2>
            <p className="auth-subtitle">
              Enter your email. Server-side reset is coming with the backend — this demo will explain next steps.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
              <Input
                label="Email address"
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
                })}
              />
              <Button type="submit" fullWidth loading={loading} size="lg">
                Continue
              </Button>
            </form>

            <div className="auth-footer">
              <Link to="/login">← Back to Sign In</Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
