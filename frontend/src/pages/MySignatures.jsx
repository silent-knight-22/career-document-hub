import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Signature, Plus, Download, Trash2, Star, Clock, PenLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getSignatures, deleteSignature, setDefaultSignature
} from '../services/signatureService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import Modal from '../components/common/Modal/Modal';
import './MySignatures.css';

const TYPE_LABELS = { draw: 'Drawn', upload: 'Uploaded', type: 'Typed' };
const TYPE_COLORS = { draw: '#6366f1', upload: '#3b82f6', type: '#10b981' };

export default function MySignatures() {
  const { user } = useAuth();
  const [signatures, setSignatures] = useState(() => getSignatures(user?.userId || ''));
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = () => setSignatures(getSignatures(user?.userId || ''));

  const handleDelete = () => {
    deleteSignature(user.userId, deleteTarget.id);
    toast.success('Signature deleted');
    setDeleteTarget(null);
    refresh();
  };

  const handleSetDefault = (sig) => {
    setDefaultSignature(user.userId, sig.id);
    toast.success(`"${sig.name}" set as default`);
    refresh();
  };

  const handleDownload = (sig) => {
    const a = document.createElement('a');
    a.href = sig.dataUrl;
    a.download = `${sig.name.replace(/\s+/g, '_')}.png`;
    a.click();
    toast.success('Signature downloaded!');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Signatures" />
        <div className="page-container">

          <div className="page-header animate-fade-in-up">
            <div>
              <h2>My Signatures</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {signatures.length} signature{signatures.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <Link to="/signatures/create">
              <Button icon={Plus}>New Signature</Button>
            </Link>
          </div>

          {signatures.length === 0 ? (
            <div className="card animate-fade-in-up">
              <div className="empty-state">
                <div className="empty-state-icon animate-float"><Signature size={32} /></div>
                <h3>No signatures yet</h3>
                <p>Create your first digital signature using our drawing canvas, image upload, or type-to-sign feature</p>
                <Link to="/signatures/create">
                  <Button icon={PenLine}>Create Your First Signature</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="signatures-grid stagger-children">
              {signatures.map((sig) => (
                <div key={sig.id} className="sig-card card hover-lift animate-fade-in-up">
                  {sig.isDefault && (
                    <div className="sig-default-badge">
                      <Star size={11} fill="currentColor" /> Default
                    </div>
                  )}

                  <div className="sig-preview-area">
                    <img src={sig.dataUrl} alt={sig.name} />
                  </div>

                  <div className="sig-card-body">
                    <div className="sig-card-info">
                      <p className="sig-name">{sig.name}</p>
                      <div className="sig-meta">
                        <span
                          className="badge"
                          style={{
                            background: `${TYPE_COLORS[sig.type]}18`,
                            color: TYPE_COLORS[sig.type],
                          }}
                        >
                          {TYPE_LABELS[sig.type] || sig.type}
                        </span>
                        <span className="sig-date">
                          <Clock size={11} />
                          {new Date(sig.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="sig-card-actions">
                      {!sig.isDefault && (
                        <button
                          className="sig-action-btn"
                          onClick={() => handleSetDefault(sig)}
                          title="Set as default"
                        >
                          <Star size={15} />
                        </button>
                      )}
                      <button
                        className="sig-action-btn"
                        onClick={() => handleDownload(sig)}
                        title="Download"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        className="sig-action-btn danger"
                        onClick={() => setDeleteTarget(sig)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add new card */}
              <Link to="/signatures/create" className="sig-add-card card hover-lift">
                <div className="sig-add-inner">
                  <Plus size={24} />
                  <p>Add Signature</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Signature"
        size="sm"
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</strong>?
          This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} icon={Trash2}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
