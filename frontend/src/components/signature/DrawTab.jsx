import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button/Button';

export default function DrawTab({ onSave }) {
  const canvasRef = useRef(null);
  const [penColor, setPenColor] = useState('#1e293b');
  const [penWidth, setPenWidth] = useState(2.5);
  const [isEmpty, setIsEmpty]   = useState(true);

  const clear = () => { canvasRef.current?.clear(); setIsEmpty(true); };

  const handleSave = () => {
    if (!canvasRef.current || canvasRef.current.isEmpty()) {
      toast.error('Please draw your signature first');
      return;
    }
    const dataUrl = canvasRef.current.getTrimmedCanvas().toDataURL('image/png');
    onSave(dataUrl, 'draw');
  };

  return (
    <div className="tab-content">
      <div className="draw-toolbar">
        <div className="draw-tool-group">
          <label className="draw-tool-label">Pen Color</label>
          <div className="color-swatches">
            {['#1e293b', '#6366f1', '#3b82f6', '#10b981', '#ef4444'].map((c) => (
              <button
                key={c}
                className={`color-swatch ${penColor === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setPenColor(c)}
                title={c}
              />
            ))}
            <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="color-picker" title="Custom color" />
          </div>
        </div>
        <div className="draw-tool-group">
          <label className="draw-tool-label">Thickness</label>
          <div className="thickness-btns">
            {[1.5, 2.5, 4].map((w) => (
              <button key={w} className={`thickness-btn ${penWidth === w ? 'active' : ''}`} onClick={() => setPenWidth(w)}>
                <span style={{ width: w * 6, height: w * 6, background: 'var(--text-primary)', borderRadius: '50%', display: 'inline-block' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="canvas-wrapper">
        <SignatureCanvas
          ref={canvasRef}
          penColor={penColor}
          minWidth={penWidth * 0.8}
          maxWidth={penWidth * 1.5}
          velocityFilterWeight={0.7}
          canvasProps={{ className: 'sig-canvas' }}
          onBegin={() => setIsEmpty(false)}
        />
        <p className="canvas-hint">Sign above using mouse, touchpad, or stylus</p>
      </div>

      <div className="tab-actions">
        <Button variant="secondary" icon={RotateCcw} onClick={clear}>Clear</Button>
        <Button icon={Save} onClick={handleSave} disabled={isEmpty}>Save Signature</Button>
      </div>
    </div>
  );
}
