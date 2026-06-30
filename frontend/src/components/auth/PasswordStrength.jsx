import React from 'react';

export default function PasswordStrength({ password }) {
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
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="strength-bar" style={{ background: i <= strength ? colors[strength] : 'var(--bg-tertiary)' }} />
        ))}
      </div>
      <span style={{ color: colors[strength], fontSize: '0.75rem', fontWeight: 600 }}>{labels[strength]}</span>
    </div>
  );
}
