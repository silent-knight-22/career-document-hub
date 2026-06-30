import { useState } from 'react';
import toast from 'react-hot-toast';

export default function useSignatureCanvas(canvasRef, zoom, selectedSig) {
  const [placed, setPlaced] = useState([]);
  const [dragging, setDragging] = useState(null);

  const addSignature = (e) => {
    if (!selectedSig) {
      toast.error('Select a signature first');
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setPlaced((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sigId: selectedSig.id,
        x: x - 80,
        y: y - 30,
        w: 160,
        h: 60
      }
    ]);
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
    const y = (e.clientY - containerRect.top) / zoom - dragging.offsetY;
    setPlaced((prev) => prev.map((p, i) => (i === dragging.idx ? { ...p, x, y } : p)));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const removeOverlay = (idx) => {
    setPlaced((prev) => prev.filter((_, i) => i !== idx));
  };

  return {
    placed,
    setPlaced,
    addSignature,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    removeOverlay
  };
}
