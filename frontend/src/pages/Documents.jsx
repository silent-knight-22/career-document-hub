import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getDocuments, deleteDocument } from '../services/documentService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import Modal from '../components/common/Modal/Modal';
import DocumentCard from '../components/documents/DocumentCard';
import UploadZone from '../components/documents/UploadZone';
import useDocumentUpload from '../hooks/useDocumentUpload';
import './Documents.css';

const MAX_FILE_SIZE_MB = 3;

export default function Documents() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [documents, setDocuments] = useState(() => getDocuments(user?.userId || ''));
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]             = useState('');

  const refresh = () => setDocuments(getDocuments(user?.userId || ''));

  const { uploading, uploadProgress, getRootProps, getInputProps, isDragActive } = useDocumentUpload(
    user?.userId || '',
    refresh
  );

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
          <UploadZone
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />

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
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onSign={(id) => navigate(`/documents/${id}/sign`)}
                  onDownload={handleDownload}
                  onDelete={setDeleteTarget}
                />
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
