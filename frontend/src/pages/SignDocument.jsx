import { useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDocumentById } from '../services/documentService';
import { getSignatures } from '../services/signatureService';
import PageLayout from '../components/layout/PageLayout/PageLayout';
import Button from '../components/common/Button/Button';
import EmptyState from '../components/common/EmptyState/EmptyState';
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
  const navigate = useNavigate();
  const userId = user?.userId || '';

  const doc = useMemo(() => getDocumentById(userId, id), [userId, id]);
  const signatures = useMemo(() => getSignatures(userId), [userId]);
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
      <PageLayout title="Sign Document">
        <div className="card">
          <EmptyState
            title="Document not found"
            action={<Button onClick={() => navigate('/documents')}>Back to Documents</Button>}
          />
        </div>
      </PageLayout>
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
    <PageLayout title={`Sign: ${doc.name}`} className="sign-layout">
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
          onPointerMove={handleMouseMove}
          onPointerUp={handleMouseUp}
          onPointerLeave={handleMouseUp}
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
            {placed.map((p) => (
              <SignatureOverlay
                key={p.id}
                p={p}
                signature={signatures.find((s) => s.id === p.sigId)}
                onMouseDown={handleMouseDown}
                onRemove={removeOverlay}
                onResize={(e, placedId, startW, startH) => {
                  const startX = e.clientX;
                  const onMove = (me) => {
                    const dw = me.clientX - startX;
                    setPlaced((prev) =>
                      prev.map((pp) =>
                        pp.id === placedId
                          ? {
                              ...pp,
                              w: Math.max(60, startW + dw),
                              h: Math.max(30, startH + dw * 0.375),
                            }
                          : pp,
                      ),
                    );
                  };
                  const onUp = () => {
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                  };
                  window.addEventListener('pointermove', onMove);
                  window.addEventListener('pointerup', onUp);
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
