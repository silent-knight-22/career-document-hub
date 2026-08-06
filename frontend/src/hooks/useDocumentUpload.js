import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { saveDocument } from '../services/documentService';
import {
  FILE_ACCEPT,
  FILE_LIMITS,
  detectFileKind,
  formatBytes,
  readFileAsDataUrl,
} from '../utils/files';

function trySaveDocument(userId, data) {
  try {
    return saveDocument(userId, data);
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      throw new Error('Storage full. Please delete some documents and try again.', { cause: err });
    }
    throw err;
  }
}

export default function useDocumentUpload(userId, onUploadSuccess) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles?.length > 0) {
        toast.error('Unsupported file type. Please upload a PDF, JPG, or PNG.');
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > FILE_LIMITS.DOCUMENTS) {
        toast.error(
          `File too large (${formatBytes(file.size)}). Maximum size is ${FILE_LIMITS.DOCUMENTS / (1024 * 1024)} MB.\n` +
            `Tip: Compress your PDF at smallpdf.com before uploading.`,
          { duration: 6000 },
        );
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const dataUrl = await readFileAsDataUrl(file, {
          onProgress: setUploadProgress,
        });
        trySaveDocument(userId, {
          name: file.name,
          dataUrl,
          type: detectFileKind(file),
          size: file.size,
        });
        toast.success(`"${file.name}" uploaded successfully!`);
        onUploadSuccess?.();
      } catch (err) {
        toast.error(err.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [userId, onUploadSuccess],
  );

  const dropzoneProps = useDropzone({
    accept: FILE_ACCEPT.DOCUMENTS,
    maxFiles: 1,
    maxSize: FILE_LIMITS.DOCUMENTS,
    onDrop,
    onDropRejected: (rejected) => {
      const err = rejected[0]?.errors[0];
      if (err?.code === 'file-too-large') {
        toast.error(
          `File too large. Maximum is ${FILE_LIMITS.DOCUMENTS / (1024 * 1024)} MB.`,
          { duration: 5000 },
        );
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
