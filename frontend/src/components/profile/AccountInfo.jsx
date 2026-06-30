import React from 'react';
import { User, Shield } from 'lucide-react';

export default function AccountInfo({ name, email, userId }) {
  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '60ms' }}>
      <div className="card-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} style={{ color: 'var(--brand-primary)' }} /> Account Info
        </h3>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="info-row">
          <span className="info-label">Full Name</span>
          <span className="info-value">{name}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email</span>
          <span className="info-value">{email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Account ID</span>
          <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            {userId?.slice(0, 8)}...
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Status</span>
          <span className="badge badge-success"><Shield size={11} /> Active</span>
        </div>
      </div>
    </div>
  );
}
