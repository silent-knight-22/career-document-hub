import React from 'react';
import { FileText, Clock, PenLine, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Button from '../common/Button/Button';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${['B', 'KB', 'MB'][i]}`;
}

export default function DocumentCard({ doc, onSign, onDownload, onDelete }) {
  return (
    <div className="doc-card card animate-fade-in-up">
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
            onClick={() => onSign(doc.id)}
          >
            Sign
          </Button>
        )}
        <button className="sig-action-btn" onClick={() => onDownload(doc)} title="Download">
          <Download size={15} />
        </button>
        <button className="sig-action-btn danger" onClick={() => onDelete(doc)} title="Delete">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
