import { useEffect, useState } from 'react';

export default function PasswordStrength({ password }) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!password) {
      setScore(0);
      return undefined;
    }

    let cancelled = false;
    import('zxcvbn').then((mod) => {
      if (cancelled) return;
      const zxcvbn = mod.default || mod;
      setScore(zxcvbn(password).score);
    });

    return () => {
      cancelled = true;
    };
  }, [password]);

  if (!password) return null;

  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="password-strength" aria-live="polite">
      <div className="strength-bars" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="strength-bar"
            style={{ background: i <= score ? colors[score] : 'var(--bg-tertiary)' }}
          />
        ))}
      </div>
      <span style={{ color: colors[score], fontSize: '0.75rem', fontWeight: 600 }}>{labels[score]}</span>
    </div>
  );
}
