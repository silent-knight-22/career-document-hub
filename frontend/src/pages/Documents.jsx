import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, Trash2, Download, PenLine,
  Clock, CheckCircle, XCircle, Search, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getDocuments, saveDocument, deleteDocument } from '../services/documentService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import Modal from '../components/common/Modal/Modal';
import './Documents.css';

// -------------------------------------------------------
// CRITICAL: Maximum file size for signing documents.
// Files are Base64-encoded for the canvas signer — large
// files cause OOM. 3 MB raw → ~4 MB Base64 is the safe cap.
// -------------------------------------------------------
const MAX_FILE_SIZE    = 3 * 1024 * 1024; // 3 MB
const MAX_FILE_SIZE_MB = 3;

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${['B', 'KB', 'MB'][i]}`;
}

// Safely write to localStorage; catch QuotaExceededError
function trySaveDocument(userId, data) {
  try {
    return saveDocument(userId, data);
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      throw new Error('Storage full. Please delete some documents and try again.');
    }
    throw err;
  }
}

export default function Documents() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [documents, setDocuments] = useState(() => getDocuments(user?.userId || ''));
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch]             = useState('');

  const refresh = () => setDocuments(getDocuments(user?.userId || ''));

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle dropzone rejections (wrong mime type etc.)
    if (rejectedFiles?.length > 0) {
      toast.error('Unsupported file type. Please upload a PDF, JPG, or PNG.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // ── Size guard ────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File too large (${formatBytes(file.size)}). Maximum size is ${MAX_FILE_SIZE_MB} MB.\n` +
        `Tip: Compress your PDF at smallpdf.com before uploading.`,
        { duration: 6000 }
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onload = (e) => {
      try {
        const type = file.type.includes('pdf') ? 'pdf' : 'image';
        trySaveDocument(user.userId, {
          name:    file.name,
          dataUrl: e.target.result,
          type,
          size:    file.size,
        });
        toast.success(`"${file.name}" uploaded successfully!`);
        refresh();
      } catch (err) {
        toast.error(err.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    onDrop,
    onDropRejected: (rejected) => {
      const err = rejected[0]?.errors[0];
      if (err?.code === 'file-too-large') {
        toast.error(`File too large. Maximum is ${MAX_FILE_SIZE_MB} MB.`, { duration: 5000 });
      } else {
        toast.error('Invalid file. Please upload a PDF, JPG, or PNG under 3 MB.');
      }
    },
  });

  const handleDelete = () => {
    deleteDocument(user.userId, deleteTarget.id);
    toast.success('Document deleted');
    setDeleteTarget(null);
    refresh();
  };

  const handleDownload = (doc) => {
    const a = document.createElement('a');
    a.href     = doc.signedDataUrl || doc.dataUrl;
    a.download = doc.name;
    a.click();
    toast.success('Downloading...');
  };

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Documents" />
        <div className="page-container">

          {/* Header */}
          <div className="page-header animate-fade-in-up">
            <div>
              <h2>Sign Documents</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Size limit notice */}
          <div className="doc-size-notice animate-fade-in-up" style={{ animationDelay: '20ms' }}>
            <AlertCircle size={14} />
            <span>Max file size: <strong>{MAX_FILE_SIZE_MB} MB</strong> per document (PDF, JPG, PNG)</span>
          </div>

          {/* Upload zone */}
          <div
            {...getRootProps()}
            className={`doc-dropzone animate-fade-in-up ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
            style={{ animationDelay: '60ms' }}
          >
            <input {...getInputProps()} />
            <div className="doc-dropzone-inner">
              {uploading ? (
                <div className="doc-upload-progress">
                  <div className="doc-progress-ring">
                    <svg viewBox="0 0 40 40" width="40" height="40">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                      <circle
                        cx="20" cy="20" r="16" fill="none"
                        stroke="var(--brand-primary)" strokeWidth="3"
                        strokeDasharray={`${uploadProgress} 100`}
                        strokeLinecap="round"
                        transform="rotate(-90 20 20)"
                        style={{ transition: 'stroke-dasharray 0.3s' }}
                      />
                    </svg>
                    <span className="doc-progress-pct">{uploadProgress}%</span>
                  </div>
                  <p className="doc-dropzone-title">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload size={24} style={{ color: 'var(--brand-primary)' }} />
                  <div>
                    <p className="doc-dropzone-title">
                      {isDragActive ? 'Drop it here!' : 'Upload a document to sign'}
                    </p>
                    <p className="doc-dropzone-sub">
                      PDF · JPG · PNG &mdash; drag &amp; drop or click to browse &mdash; max 3 MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          {documents.length > 0 && (
            <div className="doc-search animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="doc-search-input"
              />
            </div>
          )}

          {/* Document list */}
          {documents.length === 0 ? (
            <div className="card animate-fade-in-up" style={{ animationDelay: '120ms' }}>
              <div className="empty-state">
                <div className="empty-state-icon animate-float"><FileText size={32} /></div>
                <h3>No documents yet</h3>
                <p>Upload a PDF, JPG, or PNG (under 3 MB) to get started with digital signing</p>
              </div>
            </div>
          ) : (
            <div className="doc-list stagger-children" style={{ animationDelay: '120ms' }}>
              {filtered.map((doc) => (
                <div key={doc.id} className="doc-card card animate-fade-in-up">
                  <div className="doc-card-icon" data-type={doc.type}>
                    <FileText size={22} />
                  </div>

                  <div className="doc-card-info">
                    <p className="doc-name">{doc.name}</p>
                    <div className="doc-meta">
                      <span><Clock size={11} /> {new Date(doc.createdAt).toLocaleDateString()}</span>
                      <span>{formatBytes(doc.size)}</span>
                      <span className="badge"
                        style={{
                          background: doc.type === 'pdf' ? '#dbeafe' : '#d1fae5',
                          color:      doc.type === 'pdf' ? '#3b82f6' : '#10b981',
                        }}>
                        {doc.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="doc-status">
                    {doc.signed ? (
                      <span className="badge badge-success"><CheckCircle size={11} /> Signed</span>
                    ) : (
                      <span className="badge badge-warning"><XCircle size={11} /> Unsigned</span>
                    )}
                  </div>

                  <div className="doc-actions">
                    {!doc.signed && (
                      <Button
                        variant="primary" size="sm" icon={PenLine}
                        onClick={() => navigate(`/documents/${doc.id}/sign`)}
                      >
                        Sign
                      </Button>
                    )}
                    <button className="sig-action-btn" onClick={() => handleDownload(doc)} title="Download">
                      <Download size={15} />
                    </button>
                    <button className="sig-action-btn danger" onClick={() => setDeleteTarget(doc)} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && search && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No documents match &ldquo;{search}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Document" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</strong>?
          This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} icon={Trash2}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
