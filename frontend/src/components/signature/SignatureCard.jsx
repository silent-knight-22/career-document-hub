import React from 'react';
import { Star, Download, Trash2, Clock } from 'lucide-react';

const TYPE_LABELS = { draw: 'Drawn', upload: 'Uploaded', type: 'Typed' };
const TYPE_COLORS = { draw: '#6366f1', upload: '#3b82f6', type: '#10b981' };

export default function SignatureCard({ sig, onSetDefault, onDownload, onDelete }) {
  return (
    <div className="sig-card card hover-lift animate-fade-in-up">
      {sig.isDefault && (
        <div className="sig-default-badge">
          <Star size={11} fill="currentColor" /> Default
        </div>
      )}

      <div className="sig-preview-area">
        <img src={sig.dataUrl} alt={sig.name} />
      </div>

      <div className="sig-card-body">
        <div className="sig-card-info">
          <p className="sig-name">{sig.name}</p>
          <div className="sig-meta">
            <span
              className="badge"
              style={{
                background: `${TYPE_COLORS[sig.type]}18`,
                color: TYPE_COLORS[sig.type],
              }}
            >
              {TYPE_LABELS[sig.type] || sig.type}
            </span>
            <span className="sig-date">
              <Clock size={11} />
              {new Date(sig.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="sig-card-actions">
          {!sig.isDefault && (
            <button
              className="sig-action-btn"
              onClick={() => onSetDefault(sig)}
              title="Set as default"
            >
              <Star size={15} />
            </button>
          )}
          <button
            className="sig-action-btn"
            onClick={() => onDownload(sig)}
            title="Download"
          >
            <Download size={15} />
          </button>
          <button
            className="sig-action-btn danger"
            onClick={() => onDelete(sig)}
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
