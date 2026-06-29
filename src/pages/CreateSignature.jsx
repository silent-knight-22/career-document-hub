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

const TYPE_FONTS = [
  { label: 'Dancing Script', value: "'Dancing Script', cursive" },
  { label: 'Pacifico',       value: "'Pacifico', cursive" },
  { label: 'Satisfy',        value: "'Satisfy', cursive" },
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
  const [text, setText]     = useState('');
  const [font, setFont]     = useState(TYPE_FONTS[0].value);
  const canvasRef           = useRef(null);

  const generateSignature = () => {
    const canvas  = canvasRef.current;
    const ctx     = canvas.getContext('2d');
    canvas.width  = 500;
    canvas.height = 120;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font      = `52px ${font}`;
    ctx.fillStyle = '#1e293b';
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

  return (
    <div className="tab-content">
      <Input
        label="Type your name"
        id="type-name"
        placeholder="Your full name"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="font-picker">
        <label className="draw-tool-label">Choose style</label>
        <div className="font-options">
          {TYPE_FONTS.map((f) => (
            <button
              key={f.value}
              className={`font-option ${font === f.value ? 'active' : ''}`}
              style={{ fontFamily: f.value }}
              onClick={() => setFont(f.value)}
            >
              {text || 'Your Name'}
            </button>
          ))}
        </div>
      </div>

      {text && (
        <div className="type-preview">
          <p style={{ fontFamily: font, fontSize: '2.5rem', color: '#1e293b' }}>{text}</p>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="tab-actions">
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
