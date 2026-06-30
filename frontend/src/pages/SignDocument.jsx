import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getDocumentById } from '../services/documentService';
import { getSignatures } from '../services/signatureService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import SignaturePanel from '../components/documents/SignaturePanel';
import SignatureOverlay from '../components/documents/SignatureOverlay';
import CanvasBackground from '../components/documents/CanvasBackground';
import usePdfRenderer from '../hooks/usePdfRenderer';
import useSignatureCanvas from '../hooks/useSignatureCanvas';
import { mergeAndDownload } from '../utils/signatureMerger';
import './SignDocument.css';

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
  const [zoom,      setZoom]      = useState(1);
  const [saving,    setSaving]    = useState(false);
  const { docImage, loadingPdf, pdfError } = usePdfRenderer(doc);
  const {
    placed,
    setPlaced,
    addSignature,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    removeOverlay
  } = useSignatureCanvas(canvasRef, zoom, selectedSig);
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

  const exportSigned = async () => {
    mergeAndDownload({
      userId: user?.userId || '',
      doc,
      docImage,
      placed,
      signatures,
      zoom,
      canvasEl: canvasRef.current,
      onStart: () => setSaving(true),
      onComplete: () => {
        setSaving(false);
        navigate('/documents');
      }
    });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title={`Sign: ${doc.name}`} />
        <div className="sign-layout">

          <SignaturePanel
            signatures={signatures}
            selectedSig={selectedSig}
            onSelectSig={setSelectedSig}
            onCreateSigClick={() => navigate('/signatures/create')}
            zoom={zoom}
            setZoom={setZoom}
            placedCount={placed.length}
            onExport={exportSigned}
            saving={saving}
          />

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
                <CanvasBackground
                  loadingPdf={loadingPdf}
                  pdfError={pdfError}
                  docImage={docImage}
                  docName={doc.name}
                  imgRef={imgRef}
                />

                {/* Placed signatures overlay */}
                {placed.map((p, idx) => (
                  <SignatureOverlay
                    key={p.id}
                    p={p}
                    idx={idx}
                    signature={signatures.find((s) => s.id === p.sigId)}
                    onMouseDown={handleMouseDown}
                    onRemove={removeOverlay}
                    onResize={(e, index, startW, startH) => {
                      const startX = e.clientX;
                      const onMove = (me) => {
                        const dw = me.clientX - startX;
                        setPlaced((prev) => prev.map((pp, i) =>
                          i === index ? { ...pp, w: Math.max(60, startW + dw), h: Math.max(30, startH + dw * 0.375) } : pp
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
                ))}
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
