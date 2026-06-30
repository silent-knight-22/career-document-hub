import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Move, Download, CheckCircle, Signature, ZoomIn, ZoomOut, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getDocumentById, saveSignedDocument } from '../services/documentService';
import { getSignatures } from '../services/signatureService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import { pdfjs } from 'react-pdf';
import './SignDocument.css';

// Configure the worker source using Vite's dynamic asset import system.
// This is offline-capable and works out of the box in both dev and production builds.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

export default function SignDocument() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const doc        = getDocumentById(user?.userId || '', id);
  const signatures = getSignatures(user?.userId || '');

  const canvasRef  = useRef(null);
  const imgRef     = useRef(null);

  const [selectedSig, setSelectedSig] = useState(
    signatures.find((s) => s.isDefault) || signatures[0] || null
  );
  const [placed,    setPlaced]    = useState([]);   // [{sigId, x, y, w, h}]
  const [dragging,  setDragging]  = useState(null); // {idx, offsetX, offsetY}
  const [resizing,  setResizing]  = useState(null);
  const [zoom,      setZoom]      = useState(1);
  const [docImage,  setDocImage]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError,   setPdfError]   = useState(null);

  // Load document as image
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
          // Convert base64 dataUrl to Uint8Array for pdfjs
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
          
          const page = await pdf.getPage(1); // Render the first page
          const viewport = page.getViewport({ scale: 1.5 }); // Good scale for detail
          
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

  if (!doc) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar title="Sign Document" />
          <div className="page-container">
            <div className="card empty-state">
              <h3>Document not found</h3>
              <Button onClick={() => navigate('/documents')}>Back to Documents</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const addSignature = (e) => {
    if (!selectedSig) { toast.error('Select a signature first'); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top)  / zoom;
    setPlaced((prev) => [...prev, { id: crypto.randomUUID(), sigId: selectedSig.id, x: x - 80, y: y - 30, w: 160, h: 60 }]);
  };

  const handleMouseDown = (e, idx) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragging({ idx, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
  };

  const handleMouseMove = (e) => {
    if (dragging === null) return;
    const containerRect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - containerRect.left) / zoom - dragging.offsetX;
    const y = (e.clientY - containerRect.top)  / zoom - dragging.offsetY;
    setPlaced((prev) => prev.map((p, i) => i === dragging.idx ? { ...p, x, y } : p));
  };

  const handleMouseUp = () => { setDragging(null); setResizing(null); };

  const removeOverlay = (idx) => {
    setPlaced((prev) => prev.filter((_, i) => i !== idx));
  };

  const exportSigned = async () => {
    if (placed.length === 0) { toast.error('Place at least one signature on the document'); return; }
    setSaving(true);

    const canvas   = document.createElement('canvas');
    const img      = new window.Image();
    img.onload = () => {
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const containerEl = canvasRef.current;
      const scaleX = img.naturalWidth  / (containerEl.offsetWidth  / zoom);
      const scaleY = img.naturalHeight / (containerEl.offsetHeight / zoom);

      const loadSig = (placedSig) => new Promise((res) => {
        const sig = signatures.find((s) => s.id === placedSig.sigId);
        if (!sig) return res();
        const sigImg = new window.Image();
        sigImg.onload = () => {
          ctx.drawImage(sigImg, placedSig.x * scaleX, placedSig.y * scaleY, placedSig.w * scaleX, placedSig.h * scaleY);
          res();
        };
        sigImg.src = sig.dataUrl;
      });

      Promise.all(placed.map(loadSig)).then(() => {
        const result = canvas.toDataURL('image/png');
        saveSignedDocument(user.userId, doc.id, result);

        // Download
        const a = document.createElement('a');
        a.href     = result;
        a.download = `signed_${doc.name.replace(/\.[^.]+$/, '')}.png`;
        a.click();

        toast.success('Document signed and downloaded! 🎉');
        setSaving(false);
        navigate('/documents');
      });
    };
    img.src = docImage;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title={`Sign: ${doc.name}`} />
        <div className="sign-layout">

          {/* Signature Panel */}
          <aside className="sign-panel">
            <div className="sign-panel-header">
              <h3><Signature size={16} /> Signatures</h3>
            </div>
            <div className="sign-panel-body">
              {signatures.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    No signatures yet
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/signatures/create')}>
                    Create Signature
                  </Button>
                </div>
              ) : (
                <>
                  <p className="sign-panel-hint">Select a signature, then click on the document to place it</p>
                  {signatures.map((sig) => (
                    <button
                      key={sig.id}
                      className={`sig-selector ${selectedSig?.id === sig.id ? 'active' : ''}`}
                      onClick={() => setSelectedSig(sig)}
                    >
                      <div className="sig-selector-preview">
                        <img src={sig.dataUrl} alt={sig.name} />
                      </div>
                      <p className="sig-selector-name">{sig.name}</p>
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="sign-panel-footer">
              <div className="sign-zoom-controls">
                <button className="zoom-btn" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} title="Zoom out"><ZoomOut size={14} /></button>
                <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                <button className="zoom-btn" onClick={() => setZoom((z) => Math.min(2, z + 0.1))} title="Zoom in"><ZoomIn size={14} /></button>
                <button className="zoom-btn" onClick={() => setZoom(1)} title="Reset zoom"><RotateCcw size={14} /></button>
              </div>

              <div className="sign-footer-actions">
                {placed.length > 0 && (
                  <p className="placed-count">
                    <CheckCircle size={13} style={{ color: 'var(--color-success)' }} />
                    {placed.length} signature{placed.length > 1 ? 's' : ''} placed
                  </p>
                )}
                <Button
                  icon={Download}
                  onClick={exportSigned}
                  loading={saving}
                  fullWidth
                  disabled={placed.length === 0}
                >
                  Download Signed
                </Button>
              </div>
            </div>
          </aside>

          {/* Document Canvas */}
          <main className="sign-canvas-area">
            <div
              className="sign-doc-scroll"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <div
                ref={canvasRef}
                className="sign-doc-canvas"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', cursor: selectedSig ? 'crosshair' : 'default' }}
                onClick={addSignature}
              >
                {loadingPdf && (
                  <div className="sign-doc-loading">
                    <Loader2 className="animate-spin" size={32} style={{ color: 'var(--brand-primary)' }} />
                    <p>Rendering PDF page...</p>
                  </div>
                )}
                {pdfError && (
                  <div className="sign-doc-error">
                    <AlertCircle size={32} style={{ color: 'var(--color-error)' }} />
                    <p>{pdfError}</p>
                  </div>
                )}
                {!loadingPdf && !pdfError && docImage && (
                  <img
                    ref={imgRef}
                    src={docImage}
                    alt={doc.name}
                    className="sign-doc-image"
                    draggable={false}
                  />
                )}

                {/* Placed signatures overlay */}
                {placed.map((p, idx) => {
                  const sig = signatures.find((s) => s.id === p.sigId);
                  if (!sig) return null;
                  return (
                    <div
                      key={p.id}
                      className="sig-overlay"
                      style={{ left: p.x, top: p.y, width: p.w, height: p.h }}
                      onMouseDown={(e) => handleMouseDown(e, idx)}
                    >
                      <img src={sig.dataUrl} alt="signature" draggable={false} />
                      <button
                        className="sig-overlay-remove"
                        onClick={(e) => { e.stopPropagation(); removeOverlay(idx); }}
                      >×</button>
                      <div
                        className="sig-overlay-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startX = e.clientX, startW = p.w, startH = p.h;
                          const onMove = (me) => {
                            const dw = me.clientX - startX;
                            setPlaced((prev) => prev.map((pp, i) =>
                              i === idx ? { ...pp, w: Math.max(60, startW + dw), h: Math.max(30, startH + dw * 0.375) } : pp
                            ));
                          };
                          const onUp = () => {
                            window.removeEventListener('mousemove', onMove);
                            window.removeEventListener('mouseup', onUp);
                          };
                          window.addEventListener('mousemove', onMove);
                          window.addEventListener('mouseup', onUp);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
