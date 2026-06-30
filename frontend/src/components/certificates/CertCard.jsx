import React from 'react';
import { Calendar, Hash, ExternalLink, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCertExpiryStatus, getIssuerColor } from '../../services/certificateService';

export default function CertCard({ cert, onDelete }) {
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
