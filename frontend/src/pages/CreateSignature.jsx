import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, PenLine, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { saveSignature } from '../services/signatureService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Input from '../components/common/Input/Input';
import DrawTab from '../components/signature/DrawTab';
import UploadTab from '../components/signature/UploadTab';
import TypeTab from '../components/signature/TypeTab';
import './CreateSignature.css';

const TABS = [
  { id: 'draw',   icon: PenLine, label: 'Draw' },
  { id: 'upload', icon: Upload,  label: 'Upload' },
  { id: 'type',   icon: Type,    label: 'Type' },
];

// ---- Main Page ----
export default function CreateSignature() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]           = useState('draw');
  const [sigName, setSigName]   = useState('');
  const [saving, setSaving]     = useState(false);

  const handleSave = async (dataUrl, type) => {
    setSaving(true);
    try {
      saveSignature(user.userId, {
        name: sigName.trim() || `My Signature ${Date.now()}`,
        dataUrl,
        type,
      });
      toast.success('Signature saved successfully! ✍️');
      navigate('/signatures');
    } catch {
      toast.error('Failed to save signature');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Create Signature" />
        <div className="page-container">

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
            {/* Tab bar */}
            <div className="sig-tab-bar">
              {TABS.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  className={`sig-tab ${tab === id ? 'active' : ''}`}
                  onClick={() => setTab(id)}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'draw'   && <DrawTab   onSave={handleSave} />}
            {tab === 'upload' && <UploadTab onSave={handleSave} />}
            {tab === 'type'   && <TypeTab   onSave={handleSave} />}
          </div>

        </div>
      </div>
    </div>
  );
}
