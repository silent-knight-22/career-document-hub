import React from 'react';
import { Upload } from 'lucide-react';

export default function UploadZone({ getRootProps, getInputProps, isDragActive, uploading, uploadProgress }) {
  return (
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
  );
}
