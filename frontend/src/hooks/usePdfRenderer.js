import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

export default function usePdfRenderer(doc) {
  const [docImage, setDocImage] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    if (!doc) return;
    if (doc.type === 'image') {
      setDocImage(doc.dataUrl);
      setLoadingPdf(false);
      setPdfError(null);
    } else if (doc.type === 'pdf') {
      setLoadingPdf(true);
      setPdfError(null);

      const renderPdfPage = async () => {
        try {
          const parts = doc.dataUrl.split(',');
          if (parts.length < 2) {
            throw new Error('Invalid Base64 PDF data.');
          }
          const base64 = parts[1];
          const binaryString = window.atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const loadingTask = pdfjs.getDocument({ data: bytes });
          const pdf = await loadingTask.promise;
          
          if (pdf.numPages === 0) {
            throw new Error('PDF has no pages.');
          }
          
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          await page.render(renderContext).promise;
          
          const pngUrl = canvas.toDataURL('image/png');
          setDocImage(pngUrl);
          setLoadingPdf(false);
        } catch (err) {
          console.error('Error rendering PDF page:', err);
          setPdfError('Failed to load PDF preview. Only image-based signing is supported if the PDF is corrupt or invalid.');
          setLoadingPdf(false);
          toast.error('Failed to load PDF preview.');
        }
      };

      renderPdfPage();
    }
  }, [doc?.id, doc?.type, doc?.dataUrl]);

  return { docImage, loadingPdf, pdfError };
}
