import React, { useState } from 'react';
import { Star, Download, Trash2, StickyNote, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button/Button';
import { getCategoryById, getExpiryStatus } from '../../services/vaultService';

function formatBytes(b) {
  if (!b) return '';
  const k = 1024;
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${['B','KB','MB'][i]}`;
}

export default function VaultCard({ item, onDelete, onToggleStar, onUpdateNote }) {
  const cat    = getCategoryById(item.category);
  const expiry = getExpiryStatus(item.expiryDate);
  const [editNote, setEditNote] = useState(false);
  const [note, setNote]         = useState(item.note || '');

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href     = item.dataUrl;
    a.download = item.name;
    a.click();
    toast.success('Downloading...');
  };

  const saveNote = () => {
    onUpdateNote(item.id, note);
    setEditNote(false);
    toast.success('Note saved');
  };

  return (
    <div className="vault-card card hover-lift animate-fade-in-up">
      <div className="vault-card-stripe" style={{ background: cat.color }} />

      <div className="vault-card-body">
        <div className="vault-card-top">
          <span className="vault-cat-badge" style={{ background: `${cat.color}18`, color: cat.color }}>
            {cat.emoji} {cat.label}
          </span>
          <button
            className={`vault-star-btn ${item.starred ? 'starred' : ''}`}
            onClick={() => onToggleStar(item.id)}
          >
            <Star size={15} fill={item.starred ? 'currentColor' : 'none'} />
          </button>
        </div>

        <p className="vault-item-name">{item.name}</p>
        <p className="vault-item-size">{formatBytes(item.size)}</p>

        {item.tags?.length > 0 && (
          <div className="vault-tags">
            {item.tags.map((t) => (
              <span key={t} className="vault-tag">#{t}</span>
            ))}
          </div>
        )}

        {expiry && (
          <span className="vault-expiry-badge" style={{ background: expiry.bg, color: expiry.color }}>
            <Calendar size={10} /> {expiry.label}
          </span>
        )}

        {editNote ? (
          <div className="vault-note-edit">
            <textarea
              className="vault-input vault-textarea"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button size="sm" onClick={saveNote}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditNote(false)}>Cancel</Button>
            </div>
          </div>
        ) : item.note ? (
          <p className="vault-note" onClick={() => setEditNote(true)}>
            <StickyNote size={11} /> {item.note}
          </p>
        ) : null}
      </div>

      <div className="vault-card-footer">
        <button className="vault-action" onClick={() => setEditNote(true)} title="Add note">
          <StickyNote size={14} />
        </button>
        <button className="vault-action" onClick={handleDownload} title="Download">
          <Download size={14} />
        </button>
        <button className="vault-action danger" onClick={() => onDelete(item.id)} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
