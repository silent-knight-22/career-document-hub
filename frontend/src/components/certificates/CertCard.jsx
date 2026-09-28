import React, { memo, useState } from 'react';
import { Calendar, Hash, ExternalLink, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getCertExpiryStatus,
  getIssuerColor,
  downloadCertificateFile,
} from '../../services/certificateService';
import SafeExternalLink from '../common/SafeExternalLink/SafeExternalLink';
import { getErrorMessage } from '../../utils/fetchWithRetry';

function CertCard({ cert, onDelete }) {
  const issuerColor = getIssuerColor(cert.issuer);
  const expiry = getCertExpiryStatus(cert.expiryDate);
  const [downloading, setDownloading] = useState(false);
  const canDownload = Boolean(cert.dataUrl) || Boolean(cert.hasFile);

  const handleDownload = async () => {
    if (!canDownload) {
      toast.error('No file attached');
      return;
    }
    setDownloading(true);
    try {
      await downloadCertificateFile(cert);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Download failed.'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="cert-card card hover-lift animate-fade-in-up">
      <div
        className="cert-card-top"
        style={{ background: `${issuerColor}15`, borderBottom: `2px solid ${issuerColor}30` }}
      >
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
            <span>
              <Calendar size={11} />{' '}
              {new Date(cert.issuedDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
          {cert.expiryDate && (
            <span>
              Expires{' '}
              {new Date(cert.expiryDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
          {cert.credentialId && (
            <span>
              <Hash size={11} /> {cert.credentialId}
            </span>
          )}
        </div>
      </div>

      <div className="cert-card-footer">
        {cert.credentialUrl && (
          <SafeExternalLink href={cert.credentialUrl} className="cert-action" title="View credential">
            <ExternalLink size={14} />
          </SafeExternalLink>
        )}
        {canDownload && (
          <button
            type="button"
            className="cert-action"
            onClick={handleDownload}
            title="Download"
            disabled={downloading}
            aria-busy={downloading}
          >
            <Download size={14} />
          </button>
        )}
        <button
          type="button"
          className="cert-action danger"
          onClick={() => onDelete(cert.id)}
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default memo(CertCard);
