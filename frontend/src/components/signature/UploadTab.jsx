import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Save, Image } from 'lucide-react';
import Button from '../common/Button/Button';

export default function UploadTab({ onSave }) {
  const [preview, setPreview] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    onDrop: (files) => {
      if (!files[0]) return;
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(files[0]);
    },
  });

  return (
    <div className="tab-content">
      {preview ? (
        <>
          <div className="upload-preview">
            <img src={preview} alt="Signature preview" />
            <button className="upload-clear" onClick={() => setPreview(null)} title="Remove">
              <X size={16} />
            </button>
          </div>
          <p className="upload-hint">
            <Image size={14} /> Make sure the signature is clearly visible on a white or transparent background
          </p>
          <div className="tab-actions">
            <Button variant="secondary" onClick={() => setPreview(null)}>Change Image</Button>
            <Button icon={Save} onClick={() => onSave(preview, 'upload')}>Save Signature</Button>
          </div>
        </>
      ) : (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <div className="dropzone-inner">
            <div className="dropzone-icon"><Upload size={28} /></div>
            <h4>Drop your signature image here</h4>
            <p>or click to browse files</p>
            <span className="dropzone-formats">PNG · JPG · JPEG · WEBP</span>
          </div>
        </div>
      )}
    </div>
  );
}
