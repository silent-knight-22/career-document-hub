import React, { useState, useRef } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button/Button';
import Input from '../common/Input/Input';
import TypePresetsGrid from './TypePresetsGrid';
import TypeCustomizerPanel from './TypeCustomizerPanel';

export default function TypeTab({ onSave }) {
  const [text, setText] = useState('');
  
  // Customizer state
  const [selectedFont, setSelectedFont]   = useState("'Dancing Script', cursive");
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [fontSize, setFontSize]           = useState(52);
  const [fontWeight, setFontWeight]       = useState('normal');
  
  const canvasRef = useRef(null);

  const generateSignature = () => {
    const canvas  = canvasRef.current;
    const ctx     = canvas.getContext('2d');
    canvas.width  = 500;
    canvas.height = 120;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font      = `${fontWeight} ${fontSize}px ${selectedFont}`;
    ctx.fillStyle = selectedColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    return canvas.toDataURL('image/png');
  };

  const handleSave = () => {
    if (!text.trim()) { toast.error('Please type your name first'); return; }
    const dataUrl = generateSignature();
    onSave(dataUrl, 'type');
  };

  const handleSelectPreset = (preset) => {
    setSelectedFont(preset.value);
    setSelectedColor(preset.color);
    setFontSize(52);
    setFontWeight('normal');
    toast.success(`Loaded preset: ${preset.label}`);
  };

  return (
    <div className="tab-content">
      <Input
        label="Type your name"
        id="type-name"
        placeholder="Enter your name to generate signatures"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <TypePresetsGrid
        selectedFont={selectedFont}
        selectedColor={selectedColor}
        text={text}
        onSelectPreset={handleSelectPreset}
      />

      <TypeCustomizerPanel
        selectedFont={selectedFont}
        setSelectedFont={setSelectedFont}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontWeight={fontWeight}
        setFontWeight={setFontWeight}
      />

      {text && (
        <div className="custom-sig-live-preview">
          <div className="preview-label">Live Preview</div>
          <div className="preview-box">
            <p style={{
              fontFamily: selectedFont,
              color: selectedColor,
              fontSize: `${fontSize}px`,
              fontWeight: fontWeight,
              lineHeight: 1
            }}>
              {text}
            </p>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="tab-actions" style={{ marginTop: '1.5rem' }}>
        <Button icon={Save} onClick={handleSave} disabled={!text.trim()}>Save Signature</Button>
      </div>
    </div>
  );
}
