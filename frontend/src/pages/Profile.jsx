import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Calendar, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, deleteAccount } from '../services/authService';
import { getSignatures } from '../services/signatureService';
import { getDocumentStats } from '../services/documentService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import ThemeToggle from '../components/common/ThemeToggle/ThemeToggle';
import DangerZone from '../components/profile/DangerZone';
import DeleteAccountModal from '../components/profile/DeleteAccountModal';
import AccountInfo from '../components/profile/AccountInfo';
import './Profile.css';

export default function Profile() {
  const { user, logout, updateSession } = useAuth();
  const navigate  = useNavigate();
  const profile   = getUserProfile(user?.userId || '');
  const sigs      = getSignatures(user?.userId || '');
  const docStats  = getDocumentStats(user?.userId || '');
  const [editName,    setEditName]    = useState(false);
  const [name,        setName]        = useState(user?.name || '');
  const [saving,      setSaving]      = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const handleSaveName = () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    updateUserProfile(user.userId, { name: name.trim() });
    updateSession({ name: name.trim() });
    toast.success('Name updated!');
    setSaving(false);
    setEditName(false);
  };
  const handleDeleteAccount = () => {
    if (deleteInput !== user.email) { toast.error('Email does not match'); return; }
    deleteAccount(user.userId);
    logout();
    toast.success('Account deleted');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Profile" />
        <div className="page-container">
          {/* Profile hero */}
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
                  <span className="profile-stat-value">{sigs.length}</span>
                  <span className="profile-stat-label">Signatures</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{docStats.total}</span>
                  <span className="profile-stat-label">Documents</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{docStats.signed}</span>
                  <span className="profile-stat-label">Signed</span>
                </div>
              </div>
            </div>
          </div>
          <div className="profile-grid">

            <AccountInfo
              name={user?.name}
              email={user?.email}
              userId={user?.userId}
            />

            {/* Theme */}
            <div className="card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="card-header">
                <h3>Appearance</h3>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Choose how Career Document Hub looks. The system setting follows your device preference.
                </p>
                <ThemeToggle />
              </div>
            </div>

            <DangerZone
              onLogout={() => { logout(); navigate('/login'); }}
              onDeleteClick={() => setShowDelete(true)}
            />

          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDelete}
        onClose={() => { setShowDelete(false); setDeleteInput(''); }}
        email={user?.email || ''}
        deleteInput={deleteInput}
        setDeleteInput={setDeleteInput}
        onDeleteConfirm={handleDeleteAccount}
      />
    </div>
  );
}
