import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { useDropzone } from 'react-dropzone';
import { Upload, PenLine, Type, X, RotateCcw, Save, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { saveSignature } from '../services/signatureService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import './CreateSignature.css';

const TABS = [
  { id: 'draw',   icon: PenLine, label: 'Draw' },
  { id: 'upload', icon: Upload,  label: 'Upload' },
  { id: 'type',   icon: Type,    label: 'Type' },
];

const PRESETS = [
  { id: 'p1', label: 'Classic Ink', value: "'Dancing Script', cursive", color: '#000000' },
  { id: 'p2', label: 'Royal Quill', value: "'Pacifico', cursive",       color: '#002fbe' },
  { id: 'p3', label: 'Modern Violet', value: "'Satisfy', cursive",      color: '#6366f1' },
  { id: 'p4', label: 'Elegant Brush', value: "'Alex Brush', cursive",   color: '#0d9488' },
  { id: 'p5', label: 'Midnight Calli', value: "'Great Vibes', cursive",  color: '#0f172a' },
  { id: 'p6', label: 'Slender Fountain', value: "'Sacramento', cursive",color: '#831843' },
];

const CUSTOM_FONTS = [
  { label: 'Dancing Script (Playful)', value: "'Dancing Script', cursive" },
  { label: 'Pacifico (Bold Quill)', value: "'Pacifico', cursive" },
  { label: 'Satisfy (Modern Violet)', value: "'Satisfy', cursive" },
  { label: 'Alex Brush (Elegant)', value: "'Alex Brush', cursive" },
  { label: 'Great Vibes (Midnight)', value: "'Great Vibes', cursive" },
  { label: 'Allura (Graceful)', value: "'Allura', cursive" },
  { label: 'Arizonia (Expressive)', value: "'Arizonia', cursive" },
  { label: 'Pinyon Script (Vintage)', value: "'Pinyon Script', cursive" },
  { label: 'Sacramento (Fountain)', value: "'Sacramento', cursive" },
  { label: 'Mrs Saint Delafield (Classic)', value: "'Mrs Saint Delafield', cursive" },
  { label: 'Monsieur La Doulaise (Antique)', value: "'Monsieur La Doulaise', cursive" },
];

const INK_COLORS = [
  { label: 'Classic Black', value: '#000000' },
  { label: 'Midnight Blue', value: '#0f172a' },
  { label: 'Royal Blue',    value: '#002fbe' },
  { label: 'Violet Ink',    value: '#6366f1' },
  { label: 'Emerald Green', value: '#0d9488' },
  { label: 'Dark Red',      value: '#b91c1c' },
];

// ---- Draw Tab ----
function DrawTab({ onSave }) {
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

// ---- Upload Tab ----
function UploadTab({ onSave }) {
  const [preview, setPreview] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    onDrop: (files) => {
      if (!files[0]) return;
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(files[0]);
    },
  });

  return (
    <div className="tab-content">
      {preview ? (
        <>
          <div className="upload-preview">
            <img src={preview} alt="Signature preview" />
            <button className="upload-clear" onClick={() => setPreview(null)} title="Remove">
              <X size={16} />
            </button>
          </div>
          <p className="upload-hint">
            <Image size={14} /> Make sure the signature is clearly visible on a white or transparent background
          </p>
          <div className="tab-actions">
            <Button variant="secondary" onClick={() => setPreview(null)}>Change Image</Button>
            <Button icon={Save} onClick={() => onSave(preview, 'upload')}>Save Signature</Button>
          </div>
        </>
      ) : (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <div className="dropzone-inner">
            <div className="dropzone-icon"><Upload size={28} /></div>
            <h4>Drop your signature image here</h4>
            <p>or click to browse files</p>
            <span className="dropzone-formats">PNG · JPG · JPEG · WEBP</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Type Tab ----
function TypeTab({ onSave }) {
  const [text, setText] = useState('');
  
  // Customizer state
  const [selectedFont, setSelectedFont]   = useState(CUSTOM_FONTS[0].value);
  const [selectedColor, setSelectedColor] = useState('#000000'); // defaults to black
  const [fontSize, setFontSize]           = useState(52);
  const [fontWeight, setFontWeight]       = useState('normal'); // 'normal' | 'bold'
  
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

      {/* 6 Quick Presets */}
      <div className="font-picker-container" style={{ marginTop: '1.25rem' }}>
        <label className="draw-tool-label">Quick Style Presets</label>
        <div className="signature-style-grid">
          {PRESETS.map((p) => {
            const isPresetActive = selectedFont === p.value && selectedColor === p.color;
            return (
              <div
                key={p.id}
                className={`sig-style-card ${isPresetActive ? 'active' : ''}`}
                onClick={() => handleSelectPreset(p)}
              >
                <div className="sig-style-header">
                  <span className="sig-style-name">{p.label}</span>
                  {isPresetActive && <span className="sig-style-badge">Preset Loaded</span>}
                </div>
                <div className="sig-style-preview">
                  <p style={{ fontFamily: p.value, color: p.color, fontSize: '1.75rem' }}>
                    {text || 'Signature'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customizer Controls Panel */}
      <div className="sig-customizer-panel">
        <h4 className="customizer-title">Style Customizer</h4>
        
        <div className="customizer-row">
          {/* Cursive Font Selection Dropdown */}
          <div className="customizer-col">
            <label className="customizer-label">Signature Font</label>
            <select
              className="customizer-select"
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
            >
              {CUSTOM_FONTS.map(font => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </select>
          </div>
          
          {/* Font Weight Button Group */}
          <div className="customizer-col">
            <label className="customizer-label">Font Weight</label>
            <div className="weight-toggle-group">
              <button
                className={`weight-toggle-btn ${fontWeight === 'normal' ? 'active' : ''}`}
                onClick={() => setFontWeight('normal')}
              >
                Normal
              </button>
              <button
                className={`weight-toggle-btn ${fontWeight === 'bold' ? 'active' : ''}`}
                onClick={() => setFontWeight('bold')}
              >
                Bold
              </button>
            </div>
          </div>
        </div>

        <div className="customizer-row" style={{ marginTop: '1.25rem' }}>
          {/* Font Size Slider */}
          <div className="customizer-col">
            <label className="customizer-label">Font Size ({fontSize}px)</label>
            <input
              type="range"
              min="32"
              max="72"
              className="customizer-slider"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
            />
          </div>
          
          {/* Ink Color Selector */}
          <div className="customizer-col">
            <label className="customizer-label">Ink Color</label>
            <div className="ink-color-selector">
              {INK_COLORS.map(c => (
                <button
                  key={c.value}
                  className={`ink-color-dot ${selectedColor === c.value ? 'active' : ''}`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                  onClick={() => setSelectedColor(c.value)}
                />
              ))}
              {/* Custom Color Input */}
              <div className="custom-color-picker-wrapper">
                <input
                  type="color"
                  className="custom-color-picker-input"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  title="Choose custom color"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Customizer Preview Box */}
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

// ---- Main Page ----
export default function CreateSignature() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]           = useState('draw');
  const [sigName, setSigName]   = useState('');
  const [saving, setSaving]     = useState(false);

  const handleSave = async (dataUrl, type) => {
    setSaving(true);
    try {
      saveSignature(user.userId, {
        name: sigName.trim() || `My Signature ${Date.now()}`,
        dataUrl,
        type,
      });
      toast.success('Signature saved successfully! ✍️');
      navigate('/signatures');
    } catch {
      toast.error('Failed to save signature');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Create Signature" />
        <div className="page-container">

          <div className="create-sig-header animate-fade-in-up">
            <div>
              <h2>Create Your Signature</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Draw, upload, or type your signature to get started
              </p>
            </div>
            <div style={{ width: 260 }}>
              <Input
                placeholder="Name this signature (optional)"
                value={sigName}
                onChange={(e) => setSigName(e.target.value)}
              />
            </div>
          </div>

          <div className="sig-tabs-card card animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            {/* Tab bar */}
            <div className="sig-tab-bar">
              {TABS.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  className={`sig-tab ${tab === id ? 'active' : ''}`}
                  onClick={() => setTab(id)}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'draw'   && <DrawTab   onSave={handleSave} />}
            {tab === 'upload' && <UploadTab onSave={handleSave} />}
            {tab === 'type'   && <TypeTab   onSave={handleSave} />}
          </div>

        </div>
      </div>
    </div>
  );
}
