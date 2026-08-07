import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Save, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button/Button';
import {
  FILE_ACCEPT,
  FILE_LIMITS,
  readFileAsDataUrl,
  validateUploadFile,
} from '../../utils/files';

export default function UploadTab({ onSave }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: FILE_ACCEPT.IMAGES,
    maxFiles: 1,
    maxSize: FILE_LIMITS.SIGNATURE,
    onDrop: async (files, rejected) => {
      if (rejected?.length) {
        toast.error('Only PNG or JPEG under 2 MB are allowed.');
        return;
      }
      const file = files[0];
      if (!file) return;
      setLoading(true);
      try {
        await validateUploadFile(file, {
          maxBytes: FILE_LIMITS.SIGNATURE,
          allowPdf: false,
          allowImages: true,
        });
        const dataUrl = await readFileAsDataUrl(file);
        setPreview(dataUrl);
      } catch (err) {
        toast.error(err.message || 'Invalid signature image.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="tab-content">
      {preview ? (
        <>
          <div className="upload-preview">
            <img src={preview} alt="Signature preview" />
            <button
              type="button"
              className="upload-clear"
              onClick={() => setPreview(null)}
              title="Remove"
              aria-label="Remove preview"
            >
              <X size={16} />
            </button>
          </div>
          <p className="upload-hint">
            <Image size={14} /> Make sure the signature is clearly visible on a white or transparent
            background
          </p>
          <div className="tab-actions">
            <Button variant="secondary" onClick={() => setPreview(null)}>
              Change Image
            </Button>
            <Button icon={Save} onClick={() => onSave(preview, 'upload')}>
              Save Signature
            </Button>
          </div>
        </>
      ) : (
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''} ${loading ? 'disabled' : ''}`}
          aria-busy={loading}
        >
          <input {...getInputProps()} disabled={loading} />
          <div className="dropzone-inner">
            <div className="dropzone-icon">
              <Upload size={28} />
            </div>
            <h4>{loading ? 'Validating image…' : 'Drop your signature image here'}</h4>
            <p>or click to browse files</p>
            <span className="dropzone-formats">PNG · JPG · JPEG</span>
          </div>
        </div>
      )}
    </div>
  );
}
