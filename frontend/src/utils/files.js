/**
 * Shared file helpers — size formatting, limits, readers, and upload validation.
 */

/** Per-feature upload ceilings (bytes). Kept distinct to preserve current UX. */
export const FILE_LIMITS = {
  DOCUMENTS: 3 * 1024 * 1024,
  VAULT: 5 * 1024 * 1024,
  SIGNATURE: 2 * 1024 * 1024,
  CERTIFICATE: 5 * 1024 * 1024,
};

export const FILE_ACCEPT = {
  DOCUMENTS: {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
  },
  IMAGES: {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
  },
};

const MAGIC = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  png: [0x89, 0x50, 0x4e, 0x47],
  jpeg: [0xff, 0xd8, 0xff],
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
  const mime = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  return 'image';
}

function matchesMagic(bytes, signature) {
  if (bytes.length < signature.length) return false;
  return signature.every((b, i) => bytes[i] === b);
}

/**
 * Detect real file type from content (not just claimed MIME).
 * @param {Uint8Array} bytes
 * @returns {'pdf' | 'png' | 'jpeg' | null}
 */
export function detectMagicType(bytes) {
  if (matchesMagic(bytes, MAGIC.pdf)) return 'pdf';
  if (matchesMagic(bytes, MAGIC.png)) return 'png';
  if (matchesMagic(bytes, MAGIC.jpeg)) return 'jpeg';
  return null;
}

/**
 * Validate size + magic bytes before accepting an upload.
 * @param {File} file
 * @param {{ maxBytes: number, allowPdf?: boolean, allowImages?: boolean }} options
 * @returns {Promise<{ kind: 'pdf' | 'image', file: File }>}
 */
export async function validateUploadFile(file, {
  maxBytes,
  allowPdf = true,
  allowImages = true,
} = {}) {
  if (!file) throw new Error('No file selected.');
  if (file.size <= 0) throw new Error('The selected file is empty.');
  if (file.size > maxBytes) {
    throw new Error(
      `File too large (${formatBytes(file.size)}). Maximum is ${formatBytes(maxBytes)}.`,
    );
  }

  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const magic = detectMagicType(header);
  const claimed = detectFileKind(file);

  if (!magic) {
    throw new Error('Unrecognized file type. Only PDF, PNG, and JPEG are allowed.');
  }

  if (magic === 'pdf') {
    if (!allowPdf) throw new Error('PDF files are not allowed here.');
    if (claimed !== 'pdf' && file.type && !file.type.includes('pdf')) {
      throw new Error('File content does not match a PDF.');
    }
    return { kind: 'pdf', file };
  }

  if (!allowImages) throw new Error('Image files are not allowed here.');
  return { kind: 'image', file };
}
