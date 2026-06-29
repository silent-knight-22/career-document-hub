import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Award, Plus, Trash2, Download, ExternalLink,
  Calendar, Hash, Search, X, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getCertificates, addCertificate, deleteCertificate,
  getCertExpiryStatus, getIssuerColor
} from '../services/certificateService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import Modal from '../components/common/Modal/Modal';
import './Certificates.css';

// ---- Add Certificate Modal ----
function AddCertModal({ isOpen, onClose, onSave }) {
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

// ---- Certificate Card ----
function CertCard({ cert, onDelete }) {
  const issuerColor = getIssuerColor(cert.issuer);
  const expiry      = getCertExpiryStatus(cert.expiryDate);

  const handleDownload = () => {
    if (!cert.dataUrl) { toast.error('No file attached'); return; }
    const a = document.createElement('a');
    a.href     = cert.dataUrl;
    a.download = cert.name;
    a.click();
  };

  return (
    <div className="cert-card card hover-lift animate-fade-in-up">
      {/* Accent top */}
      <div className="cert-card-top" style={{ background: `${issuerColor}15`, borderBottom: `2px solid ${issuerColor}30` }}>
        <div className="cert-issuer-badge" style={{ background: issuerColor }}>
          {cert.issuer.slice(0, 2).toUpperCase()}
        </div>
        <div className="cert-card-header-info">
          <p className="cert-issuer">{cert.issuer}</p>
          <span className="cert-status-badge" style={{ background: expiry.bg, color: expiry.color }}>
            {expiry.label}
          </span>
        </div>
      </div>

      <div className="cert-card-body">
        <p className="cert-name">{cert.name}</p>

        <div className="cert-meta">
          {cert.issuedDate && (
            <span><Calendar size={11} /> {new Date(cert.issuedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          )}
          {cert.expiryDate && (
            <span>Expires {new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          )}
          {cert.credentialId && (
            <span><Hash size={11} /> {cert.credentialId}</span>
          )}
        </div>
      </div>

      <div className="cert-card-footer">
        {cert.credentialUrl && (
          <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="cert-action" title="View credential">
            <ExternalLink size={14} />
          </a>
        )}
        {cert.dataUrl && (
          <button className="cert-action" onClick={handleDownload} title="Download"><Download size={14} /></button>
        )}
        <button className="cert-action danger" onClick={() => onDelete(cert.id)} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function Certificates() {
  const { user } = useAuth();
  const [certs, setCerts]     = useState(() => getCertificates(user?.userId || ''));
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch]   = useState('');

  const refresh = () => setCerts(getCertificates(user?.userId || ''));

  const handleSave = (data) => {
    addCertificate(user.userId, data);
    toast.success('Certificate added! 🏆');
    refresh();
  };

  const handleDelete = (certId) => {
    deleteCertificate(user.userId, certId);
    toast.success('Certificate removed');
    refresh();
  };

  const filtered = certs.filter((c) =>
    `${c.name} ${c.issuer}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Certificates" />
        <div className="page-container">

          <div className="page-header animate-fade-in-up">
            <div>
              <h2>My Certificates</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {certs.length} certificate{certs.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button icon={Plus} onClick={() => setShowAdd(true)}>Add Certificate</Button>
          </div>

          {certs.length > 0 && (
            <div className="vault-search animate-fade-in-up" style={{ animationDelay: '40ms', marginBottom: '1.25rem' }}>
              <Search size={15} />
              <input
                className="vault-search-input"
                placeholder="Search by name or issuer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {certs.length === 0 ? (
            <div className="card animate-fade-in-up">
              <div className="empty-state">
                <div className="empty-state-icon animate-float"><Award size={32} /></div>
                <h3>No certificates yet</h3>
                <p>Add your AWS, Google, NPTEL, Coursera, or any other certificates to keep them organized.</p>
                <Button icon={Plus} onClick={() => setShowAdd(true)}>Add Your First Certificate</Button>
              </div>
            </div>
          ) : (
            <div className="cert-grid stagger-children">
              {filtered.map((cert) => (
                <CertCard key={cert.id} cert={cert} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddCertModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSave={handleSave} />
    </div>
  );
}
