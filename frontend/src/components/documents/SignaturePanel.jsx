import React from 'react';
import { Signature, ZoomOut, ZoomIn, RotateCcw, CheckCircle, Download } from 'lucide-react';
import Button from '../common/Button/Button';

export default function SignaturePanel({
  signatures,
  selectedSig,
  onSelectSig,
  onCreateSigClick,
  zoom,
  setZoom,
  placedCount,
  onExport,
  saving
}) {
  return (
    <aside className="sign-panel">
      <div className="sign-panel-header">
        <h3><Signature size={16} /> Signatures</h3>
      </div>
      <div className="sign-panel-body">
        {signatures.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              No signatures yet
            </p>
            <Button variant="outline" size="sm" onClick={onCreateSigClick}>
              Create Signature
            </Button>
          </div>
        ) : (
          <>
            <p className="sign-panel-hint">Select a signature, then click on the document to place it</p>
            {signatures.map((sig) => (
              <button
                key={sig.id}
                className={`sig-selector ${selectedSig?.id === sig.id ? 'active' : ''}`}
                onClick={() => onSelectSig(sig)}
              >
                <div className="sig-selector-preview">
                  <img src={sig.dataUrl} alt={sig.name} />
                </div>
                <p className="sig-selector-name">{sig.name}</p>
              </button>
            ))}
          </>
        )}
      </div>

      <div className="sign-panel-footer">
        <div className="sign-zoom-controls">
          <button className="zoom-btn" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} title="Zoom out"><ZoomOut size={14} /></button>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={() => setZoom((z) => Math.min(2, z + 0.1))} title="Zoom in"><ZoomIn size={14} /></button>
          <button className="zoom-btn" onClick={() => setZoom(1)} title="Reset zoom"><RotateCcw size={14} /></button>
        </div>

        <div className="sign-footer-actions">
          {placedCount > 0 && (
            <p className="placed-count">
              <CheckCircle size={13} style={{ color: 'var(--color-success)' }} />
              {placedCount} signature{placedCount > 1 ? 's' : ''} placed
            </p>
          )}
          <Button
            icon={Download}
            onClick={onExport}
            loading={saving}
            fullWidth
            disabled={placedCount === 0}
          >
            Download Signed
          </Button>
        </div>
      </div>
    </aside>
  );
}
