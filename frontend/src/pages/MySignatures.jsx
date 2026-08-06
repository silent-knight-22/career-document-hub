import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Signature, Plus, Trash2, PenLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getSignatures, deleteSignature, setDefaultSignature
} from '../services/signatureService';
import PageLayout from '../components/layout/PageLayout/PageLayout';
import Button from '../components/common/Button/Button';
import EmptyState from '../components/common/EmptyState/EmptyState';
import Modal from '../components/common/Modal/Modal';
import SignatureCard from '../components/signature/SignatureCard';
import './MySignatures.css';

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
    <PageLayout title="My Signatures">
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
          <EmptyState
            icon={<Signature size={32} />}
            title="No signatures yet"
            description="Create your first digital signature using our drawing canvas, image upload, or type-to-sign feature"
            action={
              <Link to="/signatures/create">
                <Button icon={PenLine}>Create Your First Signature</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="signatures-grid stagger-children">
          {signatures.map((sig) => (
            <SignatureCard
              key={sig.id}
              sig={sig}
              onSetDefault={handleSetDefault}
              onDownload={handleDownload}
              onDelete={setDeleteTarget}
            />
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
    </PageLayout>
  );
}
