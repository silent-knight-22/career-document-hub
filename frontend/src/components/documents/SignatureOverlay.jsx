import React from 'react';

export default function SignatureOverlay({ p, idx, signature, onMouseDown, onRemove, onResize }) {
  if (!signature) return null;
  return (
    <div
      className="sig-overlay"
      style={{ left: p.x, top: p.y, width: p.w, height: p.h }}
      onMouseDown={(e) => onMouseDown(e, idx)}
    >
      <img src={signature.dataUrl} alt="signature" draggable={false} />
      <button
        className="sig-overlay-remove"
        onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
      >×</button>
      <div
        className="sig-overlay-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResize(e, idx, p.w, p.h);
        }}
      />
    </div>
  );
}
