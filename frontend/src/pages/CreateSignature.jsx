import { useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, PenLine, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { saveSignature } from '../services/signatureService';
import PageLayout from '../components/layout/PageLayout/PageLayout';
import Input from '../components/common/Input/Input';
import './CreateSignature.css';

const DrawTab = lazy(() => import('../components/signature/DrawTab'));
const UploadTab = lazy(() => import('../components/signature/UploadTab'));
const TypeTab = lazy(() => import('../components/signature/TypeTab'));

const TABS = [
  { id: 'draw', icon: PenLine, label: 'Draw' },
  { id: 'upload', icon: Upload, label: 'Upload' },
  { id: 'type', icon: Type, label: 'Type' },
];

function TabFallback() {
  return (
    <div
      className="tab-content"
      style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      role="status"
      aria-label="Loading tab"
    >
      <div
        className="animate-spin"
        style={{
          width: 28,
          height: 28,
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--brand-primary)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}

export default function CreateSignature() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('draw');
  const [sigName, setSigName] = useState('');

  const handleSave = useCallback(
    async (dataUrl, type) => {
      try {
        saveSignature(user.userId, {
          name: sigName.trim() || `My Signature ${Date.now()}`,
          dataUrl,
          type,
        });
        toast.success('Signature saved successfully!');
        navigate('/signatures');
      } catch {
        toast.error('Failed to save signature');
      }
    },
    [user?.userId, sigName, navigate],
  );

  return (
    <PageLayout title="Create Signature">
      <div className="create-sig-header animate-fade-in-up">
        <div>
          <h2>Create Your Signature</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Draw, upload, or type your signature to get started
          </p>
        </div>
        <div style={{ width: 260 }}>
          <Input
            placeholder="Name this signature (optional)"
            value={sigName}
            onChange={(e) => setSigName(e.target.value)}
          />
        </div>
      </div>

      <div className="sig-tabs-card card animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <div className="sig-tab-bar" role="tablist" aria-label="Signature creation method">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`sig-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <Suspense fallback={<TabFallback />}>
          {tab === 'draw' && <DrawTab onSave={handleSave} />}
          {tab === 'upload' && <UploadTab onSave={handleSave} />}
          {tab === 'type' && <TypeTab onSave={handleSave} />}
        </Suspense>
      </div>
    </PageLayout>
  );
}
