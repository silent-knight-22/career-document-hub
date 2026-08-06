import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Signature placement / drag on the document canvas.
 * Uses Pointer Events so mouse and touch share one path.
 */
export default function useSignatureCanvas(canvasRef, zoom, selectedSig) {
  const [placed, setPlaced] = useState([]);
  const [dragging, setDragging] = useState(null);

  const clientPoint = (e) => ({
    x: e.clientX,
    y: e.clientY,
  });

  const addSignature = (e) => {
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

  const handlePointerDown = (e, idx) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const { x: cx, y: cy } = clientPoint(e);
    setDragging({
      idx,
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
    setPlaced((prev) => prev.map((p, i) => (i === dragging.idx ? { ...p, x, y } : p)));
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  const removeOverlay = (idx) => {
    setPlaced((prev) => prev.filter((_, i) => i !== idx));
  };

  return {
    placed,
    setPlaced,
    addSignature,
    // Backward-compatible aliases used by SignDocument
    handleMouseDown: handlePointerDown,
    handleMouseMove: handlePointerMove,
    handleMouseUp: handlePointerUp,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    removeOverlay,
  };
}
