/**
 * Shared file helpers — single source for size formatting, limits, and readers.
 */

/** Per-feature upload ceilings (bytes). Kept distinct to preserve current UX. */
export const FILE_LIMITS = {
  DOCUMENTS: 3 * 1024 * 1024,
  VAULT: 5 * 1024 * 1024,
};

export const FILE_ACCEPT = {
  DOCUMENTS: {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg'],
  },
};

/**
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${['B', 'KB', 'MB'][i]}`;
}

/**
 * @param {File} file
 * @param {{ onProgress?: (pct: number) => void }} [options]
 * @returns {Promise<string>} data URL
 */
export function readFileAsDataUrl(file, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    reader.onload = (e) => resolve(/** @type {string} */ (e.target?.result));
    reader.onerror = () => reject(new Error('Failed to read file. Please try again.'));
    reader.readAsDataURL(file);
  });
}

/**
 * @param {File} file
 * @returns {'pdf' | 'image'}
 */
export function detectFileKind(file) {
  return file.type.includes('pdf') ? 'pdf' : 'image';
}
