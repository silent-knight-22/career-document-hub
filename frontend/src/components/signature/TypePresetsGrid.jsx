import React from 'react';

const PRESETS = [
  { id: 'p1', label: 'Classic Ink', value: "'Dancing Script', cursive", color: '#000000' },
  { id: 'p2', label: 'Royal Quill', value: "'Pacifico', cursive",       color: '#002fbe' },
  { id: 'p3', label: 'Modern Violet', value: "'Satisfy', cursive",      color: '#6366f1' },
  { id: 'p4', label: 'Elegant Brush', value: "'Alex Brush', cursive",   color: '#0d9488' },
  { id: 'p5', label: 'Midnight Calli', value: "'Great Vibes', cursive",  color: '#0f172a' },
  { id: 'p6', label: 'Slender Fountain', value: "'Sacramento', cursive",color: '#831843' },
];

export default function TypePresetsGrid({ selectedFont, selectedColor, text, onSelectPreset }) {
  return (
    <div className="font-picker-container" style={{ marginTop: '1.25rem' }}>
      <label className="draw-tool-label">Quick Style Presets</label>
      <div className="signature-style-grid">
        {PRESETS.map((p) => {
          const isPresetActive = selectedFont === p.value && selectedColor === p.color;
          return (
            <div
              key={p.id}
              className={`sig-style-card ${isPresetActive ? 'active' : ''}`}
              onClick={() => onSelectPreset(p)}
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
  );
}
