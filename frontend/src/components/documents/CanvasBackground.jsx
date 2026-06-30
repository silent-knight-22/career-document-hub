import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export default function CanvasBackground({ loadingPdf, pdfError, docImage, docName, imgRef }) {
  if (loadingPdf) {
    return (
      <div className="sign-doc-loading">
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--brand-primary)' }} />
        <p>Rendering PDF page...</p>
      </div>
    );
  }
  if (pdfError) {
    return (
      <div className="sign-doc-error">
        <AlertCircle size={32} style={{ color: 'var(--color-error)' }} />
        <p>{pdfError}</p>
      </div>
    );
  }
  if (docImage) {
    return (
      <img
        ref={imgRef}
        src={docImage}
        alt={docName}
        className="sign-doc-image"
        draggable={false}
      />
    );
  }
  return null;
}
