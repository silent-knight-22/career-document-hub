import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const SEV = {
  high:     { color: '#ef4444', bg: '#fee2e2', border: '#fca5a5' },
  medium:   { color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d' },
  low:      { color: '#3b82f6', bg: '#dbeafe', border: '#93c5fd' },
  critical: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  normal:   { color: '#6366f1', bg: '#eef2ff', border: '#a5b4fc' },
};

export const getSev = (s) => SEV[s?.toLowerCase()] || SEV.normal;

export function SourceChip({ source }) {
  if (!source) return null;
  return (
    <span className="ai-source-chip">
      <BookOpen size={10} /> {source}
    </span>
  );
}

export function SevBadge({ value }) {
  const s = getSev(value);
  return (
    <span className="ai-sev-badge" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {value}
    </span>
  );
}

export function InsightSection({ icon: Icon, title, count, color, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!count) return null;
  return (
    <div className="ai-insight-section">
      <button
        className="ai-insight-section-header"
        onClick={() => setOpen(o => !o)}
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <span className="ai-insight-section-title">
          <Icon size={15} style={{ color }} />
          {title}
          <span className="ai-insight-count" style={{ background: color + '20', color }}>{count}</span>
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className="ai-insight-section-body">{children}</div>}
    </div>
  );
}

export function InsightCard({ children, severity, style }) {
  const s = getSev(severity);
  return (
    <div
      className="ai-insight-card"
      style={severity ? { borderLeftColor: s.color, background: s.bg + '88', ...style } : style}
    >
      {children}
    </div>
  );
}
