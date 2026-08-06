/**
 * Shared pdf.js worker bootstrap + text extraction.
 * Always overwrites workerSrc (react-pdf may leave a non-empty broken default).
 */
import { pdfjs } from 'react-pdf';
import localWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

const CDN_WORKER = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/** @param {string} [src] */
export function configurePdfWorker(src = localWorkerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = src;
}

// Configure on module load so any importer is ready.
configurePdfWorker();

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
 * @param {Uint8Array} data
 * @returns {Promise<string>}
 */
async function extractTextFromBytes(data) {
  // Pass a copy — pdf.js may transfer/detach the underlying ArrayBuffer
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
  const bytes = dataUrlToUint8Array(dataUrl);

  // Sanity-check PDF magic header "%PDF"
  const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (header !== '%PDF') {
    throw new Error(
      `File does not look like a PDF (header: "${header}"). Re-upload the document and try again.`,
    );
  }

  configurePdfWorker(localWorkerSrc);

  try {
    return await extractTextFromBytes(bytes);
  } catch (localErr) {
    console.warn('[PDF] Local worker failed, retrying with CDN worker:', localErr);
    configurePdfWorker(CDN_WORKER);
    try {
      return await extractTextFromBytes(bytes);
    } catch (cdnErr) {
      console.error('[PDF] Text extraction failed (local + CDN):', cdnErr);
      const detail = cdnErr?.message || localErr?.message || 'Unknown error';
      throw new Error(
        `Failed to extract text from PDF (${detail}). If the file is password-protected, remove the password and re-upload.`,
        { cause: cdnErr },
      );
    }
  }
}

export { pdfjs };
