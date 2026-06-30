import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Calendar, Hash, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';

export default function AddCertModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', issuer: '', issuedDate: '', expiryDate: '',
    credentialId: '', credentialUrl: '',
  });
  const [file, setFile]     = useState(null);
  const [saving, setSaving] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (files) => setFile(files[0]),
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const reset = () => { setForm({ name:'',issuer:'',issuedDate:'',expiryDate:'',credentialId:'',credentialUrl:'' }); setFile(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = () => {
    if (!form.name || !form.issuer) { toast.error('Name and Issuer are required'); return; }
    setSaving(true);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onSave({ ...form, dataUrl: e.target.result, size: file.size });
        setSaving(false); handleClose();
      };
      reader.readAsDataURL(file);
    } else {
      onSave({ ...form, dataUrl: null, size: 0 });
      setSaving(false); handleClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Certificate" size="md">
      <div className="cert-form">
        <div className="cert-form-row">
          <div className="cert-form-group">
            <label className="cert-label">Certificate Name *</label>
            <input className="cert-input" placeholder="AWS Solutions Architect..." value={form.name} onChange={set('name')} />
          </div>
          <div className="cert-form-group">
            <label className="cert-label">Issuer / Platform *</label>
            <input className="cert-input" placeholder="Amazon Web Services..." value={form.issuer} onChange={set('issuer')} />
          </div>
        </div>
        <div className="cert-form-row">
          <div className="cert-form-group">
            <label className="cert-label"><Calendar size={12} /> Issue Date</label>
            <input className="cert-input" type="date" value={form.issuedDate} onChange={set('issuedDate')} />
          </div>
          <div className="cert-form-group">
            <label className="cert-label"><Calendar size={12} /> Expiry Date <span style={{fontWeight:400,color:'var(--text-tertiary)'}}>(optional)</span></label>
            <input className="cert-input" type="date" value={form.expiryDate} onChange={set('expiryDate')} />
          </div>
        </div>
        <div className="cert-form-row">
          <div className="cert-form-group">
            <label className="cert-label"><Hash size={12} /> Credential ID</label>
            <input className="cert-input" placeholder="ABC-12345..." value={form.credentialId} onChange={set('credentialId')} />
          </div>
          <div className="cert-form-group">
            <label className="cert-label"><ExternalLink size={12} /> Credential URL</label>
            <input className="cert-input" placeholder="https://..." value={form.credentialUrl} onChange={set('credentialUrl')} />
          </div>
        </div>

        {/* Optional file upload */}
        <div className="cert-form-group">
          <label className="cert-label">Certificate File <span style={{fontWeight:400,color:'var(--text-tertiary)'}}>(optional — PDF or image)</span></label>
          {!file ? (
            <div {...getRootProps()} className={`cert-dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <p>{isDragActive ? 'Drop it!' : 'Upload certificate file'}</p>
            </div>
          ) : (
            <div className="cert-file-chosen">
              <span>📄 {file.name}</span>
              <button className="cert-file-remove" onClick={() => setFile(null)}><X size={13} /></button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>Add Certificate</Button>
        </div>
      </div>
    </Modal>
  );
}
