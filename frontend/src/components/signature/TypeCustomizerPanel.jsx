import React from 'react';

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

export default function TypeCustomizerPanel({
  selectedFont,
  setSelectedFont,
  selectedColor,
  setSelectedColor,
  fontSize,
  setFontSize,
  fontWeight,
  setFontWeight
}) {
  return (
    <div className="sig-customizer-panel">
      <h4 className="customizer-title">Style Customizer</h4>
      
      <div className="customizer-row">
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
  );
}
