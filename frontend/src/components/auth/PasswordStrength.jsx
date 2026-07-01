import React from 'react';
import zxcvbn from 'zxcvbn';

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const score = zxcvbn(password).score; // 0 to 4
  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="strength-bar" style={{ background: i <= score ? colors[score] : 'var(--bg-tertiary)' }} />
        ))}
      </div>
      <span style={{ color: colors[score], fontSize: '0.75rem', fontWeight: 600 }}>{labels[score]}</span>
    </div>
  );
}
