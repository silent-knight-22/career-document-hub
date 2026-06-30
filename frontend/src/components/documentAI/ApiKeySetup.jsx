import React, { useState } from 'react';
import { Brain, ExternalLink, Key, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button/Button';
import { setApiKey, verifyApiKey } from '../../services/groqService';

export default function ApiKeySetup({ onSaved }) {
  const [key, setKey]         = useState('');
  const [show, setShow]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [foundModel, setFoundModel]   = useState('');

  const handleSave = async () => {
    if (!key.trim()) {
      setVerifyError('Please enter your API key.');
      return;
    }
    setSaving(true);
    setVerifyError('');
    setFoundModel('');
    const result = await verifyApiKey(key.trim());
    if (!result.ok) {
      setSaving(false);
      setVerifyError(result.error);
      return;
    }
    setFoundModel(result.model);
    setApiKey(key.trim());
    setSaving(false);
    toast.success(`Key verified ✓  Using ${result.model}`);
    onSaved();
  };

  return (
    <div className="ai-setup-screen">
      <div className="ai-setup-card">
        <div className="ai-setup-icon"><Brain size={32} /></div>
        <h2>Set up AI Document Intelligence</h2>
        <p>
          This feature uses <strong>Groq's high-speed Llama & Mixtral models</strong> to deeply analyse your documents.
          The integration automatically selects the best available model for your API key.
          Get a free key from the Groq Console — no credit card required.
        </p>
        <a
          href="https://console.groq.com/keys"
          target="_blank"
          rel="noreferrer"
          className="ai-setup-link"
        >
          <ExternalLink size={14} /> Get your free API key at console.groq.com
        </a>
        <div className="ai-setup-input-row">
          <input
            className="ai-setup-input"
            type={show ? 'text' : 'password'}
            placeholder="Paste your Groq API key here (gsk_...)"
            value={key}
            onChange={(e) => { setKey(e.target.value); setVerifyError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button className="ai-setup-show" onClick={() => setShow(!show)}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        {verifyError && (
          <div className="ai-key-error">
            <AlertCircle size={13} />
            {verifyError}
          </div>
        )}
        {foundModel && !saving && (
          <div className="ai-key-success">
            <CheckCircle2 size={13} />
            Model found: <strong>{foundModel}</strong>
          </div>
        )}
        <Button icon={saving ? Loader2 : Key} onClick={handleSave} disabled={!key.trim() || saving}>
          {saving ? 'Discovering models…' : 'Verify & Save API Key'}
        </Button>
        <p className="ai-setup-note">
          Key is stored locally in your browser only — never sent to our servers.
        </p>
      </div>
    </div>
  );
}
