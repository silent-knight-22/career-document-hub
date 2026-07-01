import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ProfileHero from '../components/profile/ProfileHero';
import { getLocalStorageUsage } from '../utils/storageHelper';
import './Profile.css';

export default function Profile() {
  const { user, logout, updateSession } = useAuth();
  const navigate  = useNavigate();
  const profile   = getUserProfile(user?.userId || '');
  const sigs      = getSignatures(user?.userId || '');
  const docStats  = getDocumentStats(user?.userId || '');
  const storage   = getLocalStorageUsage();
  const [editName,    setEditName]    = useState(false);
  const [name,        setName]        = useState(user?.name || '');
  const [saving,      setSaving]      = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const handleSaveName = () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSaving(true);
    updateUserProfile(user.userId, { name: name.trim() });
    updateSession({ name: name.trim() });
    toast.success('Name updated!');
    setSaving(false); setEditName(false);
  };
  const handleDeleteAccount = () => {
    if (deleteInput !== user.email) return toast.error('Email does not match');
    deleteAccount(user.userId); logout();
    toast.success('Account deleted'); navigate('/login');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Profile" />
        <div className="page-container">
          <ProfileHero
            initials={initials}
            editName={editName}
            setEditName={setEditName}
            name={name}
            setName={setName}
            saving={saving}
            handleSaveName={handleSaveName}
            user={user}
            profile={profile}
            sigsCount={sigs.length}
            docTotal={docStats.total}
            docSigned={docStats.signed}
          />
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

            {/* Storage Usage */}
            <div className="card animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="card-header">
                <h3>Local Storage Usage</h3>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Your documents and signatures are currently cached in your browser.
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}>
                  <span>Quota Used</span>
                  <span>{storage.usedMb} MB / {storage.limitMb} MB ({storage.percent}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${storage.percent}%`, height: '100%',
                    background: storage.percent > 80 ? '#ef4444' : 'var(--brand-primary)',
                    borderRadius: '4px', transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  {storage.percent > 80 
                    ? '⚠️ Storage quota is almost full! Please delete some documents to make space.' 
                    : '💡 Once the Spring Boot backend is active, this local limit will disappear.'
                  }
                </p>
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
