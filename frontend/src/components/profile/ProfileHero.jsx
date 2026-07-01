import React from 'react';
import { Mail, Calendar, Edit2, Save } from 'lucide-react';

export default function ProfileHero({
  initials,
  editName,
  setEditName,
  name,
  setName,
  saving,
  handleSaveName,
  user,
  profile,
  sigsCount,
  docTotal,
  docSigned
}) {
  return (
    <div className="profile-hero card animate-fade-in-up">
      <div className="profile-hero-banner" />
      <div className="profile-hero-body">
        <div className="profile-avatar-lg">{initials}</div>
        <div className="profile-hero-info">
          {editName ? (
            <div className="profile-name-edit">
              <input
                className="profile-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
              />
              <button className="profile-name-save" onClick={handleSaveName} disabled={saving}>
                <Save size={16} />
              </button>
              <button className="profile-name-cancel" onClick={() => { setEditName(false); setName(user?.name || ''); }}>
                ×
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 className="profile-name">{user?.name}</h2>
              <button className="profile-edit-btn" onClick={() => setEditName(true)} title="Edit name">
                <Edit2 size={14} />
              </button>
            </div>
          )}
          <p className="profile-email">
            <Mail size={14} /> {user?.email}
          </p>
          <p className="profile-since">
            <Calendar size={13} />
            Member since {profile ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">{sigsCount}</span>
            <span className="profile-stat-label">Signatures</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{docTotal}</span>
            <span className="profile-stat-label">Documents</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{docSigned}</span>
            <span className="profile-stat-label">Signed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
