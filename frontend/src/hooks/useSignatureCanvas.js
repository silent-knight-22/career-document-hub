import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Signature placement / drag on the document canvas.
 * Pointer-move updates are rAF-throttled to cut React re-renders during drag.
 */
export default function useSignatureCanvas(canvasRef, zoom, selectedSig) {
  const [placed, setPlaced] = useState([]);
  const [dragging, setDragging] = useState(null);
  const suppressAddRef = useRef(false);
  const draggingRef = useRef(null);
  const rafRef = useRef(null);
  const pendingPosRef = useRef(null);

  const clientPoint = (e) => ({
    x: e.clientX,
    y: e.clientY,
  });

  const addSignature = useCallback(
    (e) => {
      if (suppressAddRef.current) return;
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
    },
    [selectedSig, zoom],
  );

  const handlePointerDown = useCallback((e, id) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const { x: cx, y: cy } = clientPoint(e);
    const next = {
      id,
      offsetX: cx - rect.left,
      offsetY: cy - rect.top,
    };
    draggingRef.current = next;
    setDragging(next);
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      const drag = draggingRef.current;
      if (!drag || !canvasRef.current) return;
      const { x: cx, y: cy } = clientPoint(e);
      const containerRect = canvasRef.current.getBoundingClientRect();
      pendingPosRef.current = {
        id: drag.id,
        x: (cx - containerRect.left) / zoom - drag.offsetX,
        y: (cy - containerRect.top) / zoom - drag.offsetY,
      };

      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const pending = pendingPosRef.current;
        if (!pending) return;
        setPlaced((prev) =>
          prev.map((p) =>
            p.id === pending.id ? { ...p, x: pending.x, y: pending.y } : p,
          ),
        );
      });
    },
    [canvasRef, zoom],
  );

  const handlePointerUp = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const pending = pendingPosRef.current;
    if (pending) {
      setPlaced((prev) =>
        prev.map((p) =>
          p.id === pending.id ? { ...p, x: pending.x, y: pending.y } : p,
        ),
      );
      pendingPosRef.current = null;
    }
    draggingRef.current = null;
    setDragging(null);
  }, []);

  const removeOverlay = useCallback((id) => {
    suppressAddRef.current = true;
    setPlaced((prev) => prev.filter((p) => p.id !== id));
    window.setTimeout(() => {
      suppressAddRef.current = false;
    }, 0);
  }, []);

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
    dragging,
  };
}
