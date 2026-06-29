import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Signature } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import ThemeToggle from '../../components/common/ThemeToggle/ThemeToggle';
import './Auth.css';

function PasswordStrength({ password }) {
  const getStrength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p))  s++;
    return s;
  };
  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  if (!password) return null;
  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1,2,3,4].map((i) => (
          <div key={i} className="strength-bar" style={{ background: i <= strength ? colors[strength] : 'var(--bg-tertiary)' }} />
        ))}
      </div>
      <span style={{ color: colors[strength], fontSize: '0.75rem', fontWeight: 600 }}>{labels[strength]}</span>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const session = registerUser(data);
      login(session);
      toast.success('Account created! Welcome to Career Document Hub 🎉');
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

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Your all-in-one career document workspace — free forever</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <Input
            label="Full name"
            id="reg-name"
            type="text"
            placeholder="John Doe"
            icon={User}
            error={errors.name?.message}
            {...register('name', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />

          <Input
            label="Email address"
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
            })}
          />

          <div>
            <Input
              label="Password"
              id="reg-password"
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              icon={Lock}
              error={errors.password?.message}
              iconRight={
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-tertiary)' }} tabIndex={-1}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters required' },
              })}
            />
            <PasswordStrength password={password} />
          </div>

          <Input
            label="Confirm password"
            id="reg-confirm"
            type={showConf ? 'text' : 'password'}
            placeholder="Repeat password"
            icon={Lock}
            error={errors.confirmPassword?.message}
            iconRight={
              <button type="button" onClick={() => setShowConf(!showConf)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-tertiary)' }} tabIndex={-1}>
                {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            })}
          />

          <label className="auth-checkbox" style={{ marginTop: '0.25rem' }}>
            <input type="checkbox" {...register('terms', { required: 'You must accept the terms' })} />
            <span>
              I agree to the{' '}
              <Link to="#" className="auth-link">Terms of Service</Link>
              {' '}and{' '}
              <Link to="#" className="auth-link">Privacy Policy</Link>
            </span>
          </label>
          {errors.terms && <span style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>{errors.terms.message}</span>}

          <Button type="submit" fullWidth loading={loading} size="lg">
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
