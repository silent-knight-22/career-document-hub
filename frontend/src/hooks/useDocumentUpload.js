import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { saveDocument } from '../services/documentService';

const MAX_FILE_SIZE    = 3 * 1024 * 1024; // 3 MB
const MAX_FILE_SIZE_MB = 3;

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${['B', 'KB', 'MB'][i]}`;
}

function trySaveDocument(userId, data) {
  try {
    return saveDocument(userId, data);
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      throw new Error('Storage full. Please delete some documents and try again.');
    }
    throw err;
  }
}

export default function useDocumentUpload(userId, onUploadSuccess) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles?.length > 0) {
      toast.error('Unsupported file type. Please upload a PDF, JPG, or PNG.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File too large (${formatBytes(file.size)}). Maximum size is ${MAX_FILE_SIZE_MB} MB.\n` +
        `Tip: Compress your PDF at smallpdf.com before uploading.`,
        { duration: 6000 }
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onload = (e) => {
      try {
        const type = file.type.includes('pdf') ? 'pdf' : 'image';
        trySaveDocument(userId, {
          name:    file.name,
          dataUrl: e.target.result,
          type,
          size:    file.size,
        });
        toast.success(`"${file.name}" uploaded successfully!`);
        if (onUploadSuccess) onUploadSuccess();
      } catch (err) {
        toast.error(err.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  }, [userId, onUploadSuccess]);

  const dropzoneProps = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    onDrop,
    onDropRejected: (rejected) => {
      const err = rejected[0]?.errors[0];
      if (err?.code === 'file-too-large') {
        toast.error(`File too large. Maximum is ${MAX_FILE_SIZE_MB} MB.`, { duration: 5000 });
      } else {
        toast.error('Invalid file. Please upload a PDF, JPG, or PNG under 3 MB.');
      }
    },
  });

  return {
    uploading,
    uploadProgress,
    ...dropzoneProps,
  };
}
