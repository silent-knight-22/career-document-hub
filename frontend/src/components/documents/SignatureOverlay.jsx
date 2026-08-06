import React from 'react';

export default function SignatureOverlay({ p, idx, signature, onMouseDown, onRemove, onResize }) {
  if (!signature) return null;
  return (
    <div
      className="sig-overlay"
      style={{ left: p.x, top: p.y, width: p.w, height: p.h, touchAction: 'none' }}
      onPointerDown={(e) => onMouseDown(e, idx)}
    >
      <img src={signature.dataUrl} alt="Placed signature" draggable={false} />
      <button
        type="button"
        className="sig-overlay-remove"
        aria-label="Remove signature"
        onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
      >×</button>
      <div
        className="sig-overlay-resize"
        role="slider"
        aria-label="Resize signature"
        onPointerDown={(e) => {
          e.stopPropagation();
          onResize(e, idx, p.w, p.h);
        }}
      />
    </div>
  );
}
