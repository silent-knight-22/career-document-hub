import React from 'react';
import { Archive, Award, Calendar, X } from 'lucide-react';

function getUrgencyKey(status) {
  if (!status) return 'Valid';
  if (status.days < 0)   return 'Expired';
  if (status.days <= 30) return '<30d';
  if (status.days <= 90) return '<90d';
  return 'Valid';
}

export default function ExpiryRow({ item, source, status, onRemoveExpiry }) {
  const urgency = getUrgencyKey(status);
  const daysText = status?.days == null ? '—'
    : status.days < 0  ? `${Math.abs(status.days)}d ago`
    : status.days === 0 ? 'Today!'
    : `${status.days} days`;

  const Icon = source === 'vault' ? Archive : Award;

  return (
    <div className="expiry-row animate-fade-in-up">
      <div className="expiry-row-left">
        <div className="expiry-source-icon" style={{ background: source === 'vault' ? '#6366f118' : '#f59e0b18' }}>
          <Icon size={16} style={{ color: source === 'vault' ? '#6366f1' : '#f59e0b' }} />
        </div>
        <div>
          <p className="expiry-name">{item.name}</p>
          <p className="expiry-source-label">
            {source === 'vault' ? 'Document Vault' : 'Certificate'} •{' '}
            <Calendar size={10} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>
      </div>

      <div className="expiry-row-right">
        <div className="expiry-countdown" style={{ color: status?.color || '#10b981' }}>
          <span className="expiry-days">{daysText}</span>
          <span
            className="expiry-badge"
            style={{ background: status?.bg, color: status?.color }}
          >
            {urgency === 'Expired' ? '🔴' : urgency === '<30d' ? '🟠' : urgency === '<90d' ? '🟡' : '🟢'} {status?.label}
          </span>
        </div>
        <button
          className="expiry-remove-btn"
          onClick={() => onRemoveExpiry(item.id, source)}
          title="Remove expiry date"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
