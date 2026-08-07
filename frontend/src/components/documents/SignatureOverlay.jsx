import { memo } from 'react';

function SignatureOverlay({ p, signature, onMouseDown, onRemove, onResize }) {
  if (!signature) return null;

  const stop = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      className="sig-overlay"
      style={{ left: p.x, top: p.y, width: p.w, height: p.h, touchAction: 'none' }}
      onPointerDown={(e) => onMouseDown(e, p.id)}
      onClick={stop}
    >
      <img
        src={signature.dataUrl}
        alt=""
        draggable={false}
        decoding="async"
      />
      <button
        type="button"
        className="sig-overlay-remove"
        aria-label="Remove signature"
        onPointerDown={stop}
        onClick={(e) => {
          stop(e);
          onRemove(p.id);
        }}
      >
        ×
      </button>
      <div
        className="sig-overlay-resize"
        role="slider"
        aria-label="Resize signature"
        onPointerDown={(e) => {
          stop(e);
          onResize(e, p.id, p.w, p.h);
        }}
      />
    </div>
  );
}

export default memo(SignatureOverlay);
