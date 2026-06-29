import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Signature, CheckCircle } from 'lucide-react';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import ThemeToggle from '../../components/common/ThemeToggle/ThemeToggle';
import './Auth.css';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // Simulate API
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-decoration" />
      <div className="auth-theme-toggle"><ThemeToggle /></div>

      <div className="auth-card animate-scale-in">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Signature size={22} color="white" /></div>
          <span className="auth-logo-text">Career Doc Hub</span>
        </div>

        {sent ? (
          <div className="forgot-success">
            <div className="forgot-success-icon"><CheckCircle size={32} /></div>
            <h2 className="auth-title">Check your inbox</h2>
            <p className="auth-subtitle">
              If an account exists for that email, a reset link has been sent.
              <br />Check your spam folder if you don&apos;t see it.
            </p>
            <Link to="/login">
              <Button variant="outline">Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="auth-title">Forgot password?</h2>
            <p className="auth-subtitle">Enter your email and we&apos;ll send a reset link.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
              <Input
                label="Email address"
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
                })}
              />
              <Button type="submit" fullWidth loading={loading} size="lg">
                Send Reset Link
              </Button>
            </form>

            <div className="auth-footer">
              <Link to="/login">← Back to Sign In</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
