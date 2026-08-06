import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Signature placement / drag on the document canvas.
 * Uses Pointer Events so mouse and touch share one path.
 */
export default function useSignatureCanvas(canvasRef, zoom, selectedSig) {
  const [placed, setPlaced] = useState([]);
  const [dragging, setDragging] = useState(null);
  /** Blocks canvas add when a delete click would otherwise fall through to the canvas. */
  const suppressAddRef = useRef(false);

  const clientPoint = (e) => ({
    x: e.clientX,
    y: e.clientY,
  });

  const addSignature = (e) => {
    if (suppressAddRef.current) return;
    // Clicks on existing overlays / controls must never place a new stamp
    if (e.target?.closest?.('.sig-overlay')) return;

    if (!selectedSig) {
      toast.error('Select a signature first');
      return;
    }
    const { x: cx, y: cy } = clientPoint(e);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (cx - rect.left) / zoom;
    const y = (cy - rect.top) / zoom;
    setPlaced((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sigId: selectedSig.id,
        x: x - 80,
        y: y - 30,
        w: 160,
        h: 60,
      },
    ]);
  };

  const handlePointerDown = (e, id) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const { x: cx, y: cy } = clientPoint(e);
    setDragging({
      id,
      offsetX: cx - rect.left,
      offsetY: cy - rect.top,
    });
  };

  const handlePointerMove = (e) => {
    if (dragging === null || !canvasRef.current) return;
    const { x: cx, y: cy } = clientPoint(e);
    const containerRect = canvasRef.current.getBoundingClientRect();
    const x = (cx - containerRect.left) / zoom - dragging.offsetX;
    const y = (cy - containerRect.top) / zoom - dragging.offsetY;
    setPlaced((prev) =>
      prev.map((p) => (p.id === dragging.id ? { ...p, x, y } : p)),
    );
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  const removeOverlay = (id) => {
    // Deleting unmounts the button; the trailing click can hit the canvas.
    suppressAddRef.current = true;
    setPlaced((prev) => prev.filter((p) => p.id !== id));
    window.setTimeout(() => {
      suppressAddRef.current = false;
    }, 0);
  };

  return {
    placed,
    setPlaced,
    addSignature,
    handleMouseDown: handlePointerDown,
    handleMouseMove: handlePointerMove,
    handleMouseUp: handlePointerUp,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    removeOverlay,
  };
}
