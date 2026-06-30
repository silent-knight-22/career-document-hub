import React from 'react';
import { Signature } from 'lucide-react';

export default function AuthHeader({ title, subtitle }) {
  return (
    <>
      <div className="auth-logo">
        <div className="auth-logo-icon">
          <Signature size={22} color="white" />
        </div>
        <span className="auth-logo-text">Career Doc Hub</span>
      </div>
      <h2 className="auth-title">{title}</h2>
      <p className="auth-subtitle">{subtitle}</p>
    </>
  );
}
