import React from 'react';
import { Key, X, Loader2, AlertCircle } from 'lucide-react';
import Button from '../common/Button/Button';
import toast from 'react-hot-toast';
import { hasApiKey } from '../../services/groqService';

export default function ApiKeyModal({
  show,
  onClose,
  newKey,
  setNewKey,
  modalKeyError,
  setModalKeyError,
  modalSaving,
  handleSaveKey,
  selectedModel,
  setSelectedModel,
  setSelectedModelLocal,
  availableModels,
  clearApiKey,
  setApiReady
}) {
  if (!show) return null;

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <h3><Key size={16} /> Manage API Key</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Get a free key at{' '}
          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)' }}>
            console.groq.com
          </a>
          . The key will be verified before saving.
        </p>
        <input
          className="ai-setup-input"
          type="password"
          placeholder="Paste your Groq API key (gsk_...)"
          value={newKey}
          onChange={(e) => { setNewKey(e.target.value); setModalKeyError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
        />
        {modalKeyError && (
          <div className="ai-key-error" style={{ marginTop: '0.625rem' }}>
            <AlertCircle size={13} />
            {modalKeyError}
          </div>
        )}

        {hasApiKey() && availableModels.length > 0 && (
          <div className="ai-model-select-group" style={{ marginTop: '1.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Preferred Groq Model
            </label>
            <select
              className="ai-setup-input"
              style={{ marginTop: '0.375rem', padding: '0.625rem', cursor: 'pointer' }}
              value={selectedModel}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedModel(val);
                setSelectedModelLocal(val);
                toast.success(val ? `Model locked to: ${val}` : 'Model set to Auto-detect');
              }}
            >
              <option value="">Auto-detect best model (Recommended)</option>
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Llama 70B - Recommended)</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Llama 8B - High Speed)</option>
              <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (Mixtral 8x7B)</option>
              <option value="meta-llama/llama-4-scout-17b-16e-instruct">meta-llama/llama-4-scout-17b-16e-instruct (Llama 4 Scout Vision)</option>
              {availableModels
                .filter(m => !['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'meta-llama/llama-4-scout-17b-16e-instruct'].includes(m))
                .map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))
              }
            </select>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.375rem', lineHeight: '1.4' }}>
              <strong>Tip:</strong> Groq offers extremely fast, free-tier reasoning. For complex document summarization, we recommend <strong>Llama-3.3-70B</strong>. Image uploads will automatically utilize the <strong>Llama 4 Scout Vision</strong> MoE engine.
            </p>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <Button
            icon={modalSaving ? Loader2 : Key}
            onClick={handleSaveKey}
            disabled={!newKey.trim() || modalSaving}
          >
            {modalSaving ? 'Verifying...' : 'Verify & Update Key'}
          </Button>
          <Button variant="danger" onClick={() => { clearApiKey(); setApiReady(false); onClose(); }}>
            Remove Key
          </Button>
        </div>
      </div>
    </div>
  );
}
