import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { configurePdfWorker, pdfjs } from '../utils/pdfWorker';

/**
 * Renders the first page of a PDF (or passes through an image) as a data URL.
 * Depends on stable primitive fields — NOT the whole `doc` object — because
 * getDocumentById() re-parses localStorage every render and would otherwise
 * create an infinite loading flicker.
 */
export default function usePdfRenderer(doc) {
  const [docImage, setDocImage] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(Boolean(doc?.type === 'pdf'));
  const [pdfError, setPdfError] = useState(null);

  const docId = doc?.id;
  const docType = doc?.type;
  const dataUrl = doc?.dataUrl;

  useEffect(() => {
    if (!docId || !dataUrl) {
      setDocImage(null);
      setLoadingPdf(false);
      setPdfError(null);
      return undefined;
    }

    let cancelled = false;

    if (docType === 'image') {
      setDocImage(dataUrl);
      setLoadingPdf(false);
      setPdfError(null);
      return undefined;
    }

    if (docType !== 'pdf') {
      setDocImage(null);
      setLoadingPdf(false);
      setPdfError('Unsupported document type.');
      return undefined;
    }

    setLoadingPdf(true);
    setPdfError(null);
    setDocImage(null);

    const renderPdfPage = async () => {
      try {
        configurePdfWorker();

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
        console.error('Error rendering PDF page:', err);
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
  }, [docId, docType, dataUrl]);

  return { docImage, loadingPdf, pdfError };
}
