import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, PenLine, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { saveSignature } from '../services/signatureService';
import PageLayout from '../components/layout/PageLayout/PageLayout';
import Input from '../components/common/Input/Input';
import PageLoader from '../components/common/PageLoader/PageLoader';
import { getErrorMessage } from '../utils/fetchWithRetry';
import './CreateSignature.css';

const DrawTab = lazy(() => import('../components/signature/DrawTab'));
const UploadTab = lazy(() => import('../components/signature/UploadTab'));
const TypeTab = lazy(() => import('../components/signature/TypeTab'));

const TABS = [
  { id: 'draw', icon: PenLine, label: 'Draw' },
  { id: 'upload', icon: Upload, label: 'Upload' },
  { id: 'type', icon: Type, label: 'Type' },
];

export default function CreateSignature() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('draw');
  const [sigName, setSigName] = useState('');

  const handleSave = async (dataUrl, type) => {
    try {
      saveSignature(user.userId, {
        name: sigName.trim() || `My Signature ${Date.now()}`,
        dataUrl,
        type,
      });
      toast.success('Signature saved successfully');
      navigate('/signatures');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save signature'));
    }
  };

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
            aria-label="Signature name"
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

        <Suspense fallback={<PageLoader label="Loading tab" minHeight={200} />}>
          {tab === 'draw' && <DrawTab onSave={handleSave} />}
          {tab === 'upload' && <UploadTab onSave={handleSave} />}
          {tab === 'type' && <TypeTab onSave={handleSave} />}
        </Suspense>
      </div>
    </PageLayout>
  );
}
