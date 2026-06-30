import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Signature } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser, getRememberedEmail } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import ThemeToggle from '../../components/common/ThemeToggle/ThemeToggle';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: getRememberedEmail(), remember: !!getRememberedEmail() } });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const session = loginUser(data);
      login(session);
      toast.success(`Welcome back, ${session.name.split(' ')[0]}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-decoration" />

      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-card animate-scale-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Signature size={22} color="white" />
          </div>
          <span className="auth-logo-text">Career Doc Hub</span>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <Input
            label="Email address"
            id="login-email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
            })}
          />

          <Input
            label="Password"
            id="login-password"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            iconRight={
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-tertiary)' }}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register('password', { required: 'Password is required' })}
          />

          <div className="auth-row">
            <label className="auth-checkbox">
              <input type="checkbox" {...register('remember')} />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
