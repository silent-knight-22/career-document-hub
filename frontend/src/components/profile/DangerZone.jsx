import React from 'react';
import { LogOut, Trash2 } from 'lucide-react';
import Button from '../common/Button/Button';

export default function DangerZone({ onLogout, onDeleteClick }) {
  return (
    <div className="card danger-zone animate-fade-in-up" style={{ animationDelay: '140ms' }}>
      <div className="card-header">
        <h3 style={{ color: 'var(--color-error)' }}>Danger Zone</h3>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="danger-item">
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Sign out everywhere</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Log out of this session</p>
          </div>
          <Button variant="secondary" size="sm" icon={LogOut} onClick={onLogout}>
            Logout
          </Button>
        </div>
        <div className="divider" />
        <div className="danger-item">
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Delete account</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Permanently remove your account and all data</p>
          </div>
          <Button variant="danger" size="sm" icon={Trash2} onClick={onDeleteClick}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
