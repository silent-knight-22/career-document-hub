import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Tag, Calendar, StickyNote, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';
import { VAULT_CATEGORIES } from '../../services/vaultService';
import { formatBytes, FILE_LIMITS, readFileAsDataUrl, detectFileKind } from '../../utils/files';

export default function UploadModal({ isOpen, onClose, onSave }) {
  const [file, setFile]         = useState(null);
  const [category, setCategory] = useState('other');
  const [tags, setTags]         = useState('');
  const [note, setNote]         = useState('');
  const [expiry, setExpiry]     = useState('');
  const [saving, setSaving]     = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (files) => setFile(files[0]),
  });

  const reset = () => { setFile(null); setCategory('other'); setTags(''); setNote(''); setExpiry(''); };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    if (!file) { toast.error('Please select a file'); return; }
    if (file.size > FILE_LIMITS.VAULT) {
      toast.error(
        `File too large (${formatBytes(file.size)}). Max size is ${FILE_LIMITS.VAULT / (1024 * 1024)} MB.`,
        { duration: 5000 },
      );
      return;
    }
    setSaving(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onSave({
        name: file.name,
        dataUrl,
        type: detectFileKind(file),
        size: file.size,
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        note,
        expiryDate: expiry || null,
      });
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        toast.error('Storage full. Delete some documents to free space.');
      } else {
        toast.error(err.message || 'Upload failed. Please try again.');
      }
    } finally {
      setSaving(false);
      handleClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add to Vault" size="md">
      <div className="upload-modal-body">
        {!file ? (
          <div {...getRootProps()} className={`vault-dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <Upload size={22} style={{ color: 'var(--brand-primary)' }} />
            <p>{isDragActive ? 'Drop it!' : 'Drop a file or click to browse'}</p>
            <span className="dropzone-formats">PDF · JPG · PNG · Any</span>
          </div>
        ) : (
          <div className="vault-file-chosen">
            <span className="vault-file-icon">📄</span>
            <div className="vault-file-info">
              <p className="vault-file-name">{file.name}</p>
              <p className="vault-file-size">{formatBytes(file.size)}</p>
            </div>
            <button className="vault-file-remove" onClick={() => setFile(null)}><X size={14} /></button>
          </div>
        )}

        <div className="vault-form-group">
          <label className="vault-form-label">Category</label>
          <div className="category-pills">
            {VAULT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`cat-pill ${category === cat.id ? 'active' : ''}`}
                style={category === cat.id ? { background: cat.color, color: 'white', borderColor: cat.color } : {}}
                onClick={() => setCategory(cat.id)}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="vault-form-group">
          <label className="vault-form-label"><Tag size={13} /> Tags <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(comma separated)</span></label>
          <input
            className="vault-input"
            placeholder="internship, urgent, signed..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="vault-form-group">
          <label className="vault-form-label"><Calendar size={13} /> Expiry Date <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
          <input
            className="vault-input"
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="vault-form-group">
          <label className="vault-form-label"><StickyNote size={13} /> Note <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
          <textarea
            className="vault-input vault-textarea"
            placeholder="Add a private note about this document..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving} disabled={!file}>Add to Vault</Button>
        </div>
      </div>
    </Modal>
  );
}
