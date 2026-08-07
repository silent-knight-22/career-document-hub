import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Calendar, Hash, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';
import {
  FILE_ACCEPT,
  FILE_LIMITS,
  readFileAsDataUrl,
  validateUploadFile,
} from '../../utils/files';
import { sanitizeExternalUrl, sanitizeText } from '../../utils/sanitize';

const emptyForm = () => ({
  name: '',
  issuer: '',
  issuedDate: '',
  expiryDate: '',
  credentialId: '',
  credentialUrl: '',
});

export default function AddCertModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: FILE_ACCEPT.DOCUMENTS,
    maxFiles: 1,
    maxSize: FILE_LIMITS.CERTIFICATE,
    onDrop: async (files, rejected) => {
      if (rejected?.length) {
        toast.error('Only PDF, JPG, or PNG under 5 MB are allowed.');
        return;
      }
      const next = files[0];
      if (!next) return;
      try {
        await validateUploadFile(next, {
          maxBytes: FILE_LIMITS.CERTIFICATE,
          allowPdf: true,
          allowImages: true,
        });
        setFile(next);
      } catch (err) {
        toast.error(err.message || 'Invalid file.');
      }
    },
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const reset = () => {
    setForm(emptyForm());
    setFile(null);
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    const name = sanitizeText(form.name, { maxLength: 120 });
    const issuer = sanitizeText(form.issuer, { maxLength: 120 });
    if (!name || !issuer) {
      toast.error('Name and Issuer are required');
      return;
    }

    const credentialUrl = form.credentialUrl.trim()
      ? sanitizeExternalUrl(form.credentialUrl)
      : '';
    if (form.credentialUrl.trim() && !credentialUrl) {
      toast.error('Credential URL must be a valid http(s) link.');
      return;
    }

    setSaving(true);
    try {
      let dataUrl = null;
      let size = 0;
      if (file) {
        await validateUploadFile(file, {
          maxBytes: FILE_LIMITS.CERTIFICATE,
          allowPdf: true,
          allowImages: true,
        });
        dataUrl = await readFileAsDataUrl(file);
        size = file.size;
      }
      onSave({
        name,
        issuer,
        issuedDate: form.issuedDate,
        expiryDate: form.expiryDate,
        credentialId: sanitizeText(form.credentialId, { maxLength: 80 }),
        credentialUrl,
        dataUrl,
        size,
      });
      handleClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save certificate.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Certificate" size="md">
      <div className="cert-form">
        <div className="cert-form-row">
          <div className="cert-form-group">
            <label className="cert-label" htmlFor="cert-name">
              Certificate Name *
            </label>
            <input
              id="cert-name"
              className="cert-input"
              placeholder="AWS Solutions Architect..."
              value={form.name}
              onChange={set('name')}
            />
          </div>
          <div className="cert-form-group">
            <label className="cert-label" htmlFor="cert-issuer">
              Issuer / Platform *
            </label>
            <input
              id="cert-issuer"
              className="cert-input"
              placeholder="Amazon Web Services..."
              value={form.issuer}
              onChange={set('issuer')}
            />
          </div>
        </div>
        <div className="cert-form-row">
          <div className="cert-form-group">
            <label className="cert-label" htmlFor="cert-issued">
              <Calendar size={12} /> Issue Date
            </label>
            <input
              id="cert-issued"
              className="cert-input"
              type="date"
              value={form.issuedDate}
              onChange={set('issuedDate')}
            />
          </div>
          <div className="cert-form-group">
            <label className="cert-label" htmlFor="cert-expiry">
              <Calendar size={12} /> Expiry Date{' '}
              <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(optional)</span>
            </label>
            <input
              id="cert-expiry"
              className="cert-input"
              type="date"
              value={form.expiryDate}
              onChange={set('expiryDate')}
            />
          </div>
        </div>
        <div className="cert-form-row">
          <div className="cert-form-group">
            <label className="cert-label" htmlFor="cert-id">
              <Hash size={12} /> Credential ID
            </label>
            <input
              id="cert-id"
              className="cert-input"
              placeholder="ABC-12345..."
              value={form.credentialId}
              onChange={set('credentialId')}
            />
          </div>
          <div className="cert-form-group">
            <label className="cert-label" htmlFor="cert-url">
              <ExternalLink size={12} /> Credential URL
            </label>
            <input
              id="cert-url"
              className="cert-input"
              placeholder="https://..."
              value={form.credentialUrl}
              onChange={set('credentialUrl')}
            />
          </div>
        </div>

        <div className="cert-form-group">
          <label className="cert-label">
            Certificate File{' '}
            <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>
              (optional — PDF or image)
            </span>
          </label>
          {!file ? (
            <div {...getRootProps()} className={`cert-dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <p>{isDragActive ? 'Drop it!' : 'Upload certificate file'}</p>
            </div>
          ) : (
            <div className="cert-file-chosen">
              <span>📄 {file.name}</span>
              <button
                type="button"
                className="cert-file-remove"
                onClick={() => setFile(null)}
                aria-label="Remove file"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Add Certificate
          </Button>
        </div>
      </div>
    </Modal>
  );
}
