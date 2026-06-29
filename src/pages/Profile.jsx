import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Shield, Trash2, LogOut, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, deleteAccount } from '../services/authService';
import { getSignatures } from '../services/signatureService';
import { getDocumentStats } from '../services/documentService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import Modal from '../components/common/Modal/Modal';
import ThemeToggle from '../components/common/ThemeToggle/ThemeToggle';
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

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

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

            {/* Account Info */}
            <div className="card animate-fade-in-up" style={{ animationDelay: '60ms' }}>
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} style={{ color: 'var(--brand-primary)' }} /> Account Info
                </h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user?.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Account ID</span>
                  <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{user?.userId?.slice(0, 8)}...</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status</span>
                  <span className="badge badge-success"><Shield size={11} /> Active</span>
                </div>
              </div>
            </div>

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

            {/* Danger Zone */}
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
                  <Button variant="secondary" size="sm" icon={LogOut} onClick={() => { logout(); navigate('/login'); }}>
                    Logout
                  </Button>
                </div>
                <div className="divider" />
                <div className="danger-item">
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Delete account</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Permanently remove your account and all data</p>
                  </div>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => setShowDelete(true)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete account modal */}
      <Modal isOpen={showDelete} onClose={() => { setShowDelete(false); setDeleteInput(''); }} title="Delete Account" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          This will permanently delete your account, all signatures, and all documents. This action <strong>cannot be undone</strong>.
        </p>
        <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 600 }}>
          Type your email <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>{user?.email}</code> to confirm:
        </p>
        <Input
          id="delete-confirm"
          placeholder={user?.email}
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <Button variant="secondary" onClick={() => { setShowDelete(false); setDeleteInput(''); }}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteInput !== user?.email} icon={Trash2}>
            Delete Forever
          </Button>
        </div>
      </Modal>
    </div>
  );
}
