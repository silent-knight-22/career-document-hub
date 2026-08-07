/**
 * Shared pdf.js worker bootstrap + text extraction.
 * Loads react-pdf / pdfjs-dist only when first needed (sign / AI analyse).
 */
import { logger } from './logger';

/** @type {Promise<{ pdfjs: import('pdfjs-dist').PDFJS, localWorkerSrc: string, CDN_WORKER: string }> | null} */
let loadPromise = null;

/**
 * Dynamically load pdf.js and configure the worker.
 * Safe to call repeatedly — result is memoized.
 */
export function ensurePdfJs() {
  if (!loadPromise) {
    loadPromise = (async () => {
      const [{ pdfjs }, workerMod] = await Promise.all([
        import('react-pdf'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      ]);
      const localWorkerSrc = workerMod.default;
      const CDN_WORKER = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      pdfjs.GlobalWorkerOptions.workerSrc = localWorkerSrc;
      return { pdfjs, localWorkerSrc, CDN_WORKER };
    })();
  }
  return loadPromise;
}

/** @param {string} [src] */
export async function configurePdfWorker(src) {
  const { pdfjs, localWorkerSrc } = await ensurePdfJs();
  pdfjs.GlobalWorkerOptions.workerSrc = src || localWorkerSrc;
  return pdfjs;
}

/**
 * Decode a data-URL (or raw base64) into a fresh Uint8Array.
 * @param {string} dataUrl
 * @returns {Uint8Array}
 */
function dataUrlToUint8Array(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error('No PDF data provided.');
  }
  const comma = dataUrl.indexOf(',');
  const base64 = (comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl).replace(/\s/g, '');
  if (!base64) {
    throw new Error('Invalid PDF data URL (empty payload).');
  }
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    throw new Error('Could not decode PDF base64 data.', { cause: err });
  }
}

/**
 * @param {import('pdfjs-dist').PDFJS} pdfjs
 * @param {Uint8Array} data
 * @returns {Promise<string>}
 */
async function extractTextFromBytes(pdfjs, data) {
  const loadingTask = pdfjs.getDocument({
    data: data.slice(0),
    useSystemFonts: true,
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += `\n--- Page ${i} ---\n${pageText}\n`;
  }

  return fullText;
}

/**
 * Extract plain text from a PDF stored as a data URL.
 * @param {string} dataUrl
 * @returns {Promise<string>}
 */
export async function extractPdfTextFromDataUrl(dataUrl) {
  const { pdfjs, localWorkerSrc, CDN_WORKER } = await ensurePdfJs();
  const bytes = dataUrlToUint8Array(dataUrl);

  const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (header !== '%PDF') {
    throw new Error(
      `File does not look like a PDF (header: "${header}"). Re-upload the document and try again.`,
    );
  }

  pdfjs.GlobalWorkerOptions.workerSrc = localWorkerSrc;

  try {
    return await extractTextFromBytes(pdfjs, bytes);
  } catch (localErr) {
    logger.warn('[PDF] Local worker failed, retrying with CDN worker:', localErr);
    pdfjs.GlobalWorkerOptions.workerSrc = CDN_WORKER;
    try {
      return await extractTextFromBytes(pdfjs, bytes);
    } catch (cdnErr) {
      logger.error('[PDF] Text extraction failed (local + CDN):', cdnErr);
      const detail = cdnErr?.message || localErr?.message || 'Unknown error';
      throw new Error(
        `Failed to extract text from PDF (${detail}). If the file is password-protected, remove the password and re-upload.`,
        { cause: cdnErr },
      );
    }
  }
}
