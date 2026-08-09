import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';

/**
 * Renders the first page of a PDF (or passes through an image) as a data URL.
 * pdf.js is loaded on demand so browsing other routes stays light.
 */
export default function usePdfRenderer(doc) {
  const docId = doc?.id ?? null;
  const docType = doc?.type ?? null;
  const dataUrl = doc?.dataUrl ?? null;

  const isImage = Boolean(docId && dataUrl && docType === 'image');
  const isPdf = Boolean(docId && dataUrl && docType === 'pdf');

  const [docImage, setDocImage] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [trackedKey, setTrackedKey] = useState(() => `${docId}:${docType}`);

  // Reset local state when the document identity changes (React-recommended pattern).
  const nextKey = `${docId}:${docType}`;
  if (nextKey !== trackedKey) {
    setTrackedKey(nextKey);
    setDocImage(isImage ? dataUrl : null);
    setLoadingPdf(isPdf);
    setPdfError(
      docId && dataUrl && !isImage && !isPdf ? 'Unsupported document type.' : null,
    );
  }

  useEffect(() => {
    if (!isPdf || !dataUrl) return undefined;

    let cancelled = false;

    const renderPdfPage = async () => {
      try {
        const { ensurePdfJs } = await import('../utils/pdfWorker');
        const { pdfjs } = await ensurePdfJs();

        const parts = dataUrl.split(',');
        if (parts.length < 2) {
          throw new Error('Invalid Base64 PDF data.');
        }

        const binaryString = window.atob(parts[1].replace(/\s/g, ''));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i += 1) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const loadingTask = pdfjs.getDocument({
          data: bytes.slice(0),
          useSystemFonts: true,
          isEvalSupported: false,
        });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        if (pdf.numPages === 0) {
          throw new Error('PDF has no pages.');
        }

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        if (cancelled) return;

        setDocImage(canvas.toDataURL('image/png'));
        setLoadingPdf(false);
      } catch (err) {
        if (cancelled) return;
        logger.error('Error rendering PDF page:', err?.message || err);
        setPdfError(
          'Failed to load PDF preview. Only image-based signing is supported if the PDF is corrupt or invalid.',
        );
        setLoadingPdf(false);
        toast.error('Failed to load PDF preview.');
      }
    };

    renderPdfPage();

    return () => {
      cancelled = true;
    };
  }, [isPdf, docId, dataUrl]);

  return {
    docImage: isImage ? dataUrl : docImage,
    loadingPdf: isPdf ? loadingPdf : false,
    pdfError: isImage ? null : pdfError,
  };
}
