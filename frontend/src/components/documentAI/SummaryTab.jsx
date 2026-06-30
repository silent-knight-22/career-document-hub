import React, { useState } from 'react';
import { Sparkles, Copy, Download, BookOpen, Flag, CheckCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { SourceChip, getSev } from './InsightHelpers';

export default function SummaryTab({ analysis }) {
  const [copiedSummary, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.executive_summary || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied!');
  };

  const handleExport = () => {
    let md = `# AI Analysis Summary - ${analysis.document_type || 'Document'}\n\n`;
    if (analysis.entities?.document_date) md += `**Document Date:** ${analysis.entities.document_date}\n`;
    if (analysis.entities?.governing_law) md += `**Governing Law:** ${analysis.entities.governing_law}\n`;
    md += `\n## Executive Summary\n\n${analysis.executive_summary || ''}\n\n`;
    
    if (analysis.sections?.length > 0) {
      md += `## Section-Wise Analysis\n\n`;
      analysis.sections.forEach((sec, idx) => {
        md += `### ${idx + 1}. ${sec.title} ${sec.page_ref ? `(${sec.page_ref})` : ''}\n\n${sec.summary}\n\n`;
      });
    }

    if (analysis.key_points?.length > 0) {
      md += `## Key Points\n\n`;
      analysis.key_points.forEach(kp => {
        const point = typeof kp === 'string' ? kp : kp.point;
        const imp = typeof kp === 'object' ? ` [Importance: ${kp.importance}]` : '';
        md += `* ${point}${imp}\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(analysis.document_type || 'Summary').toLowerCase().replace(/\s+/g, '_')}_summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary exported as Markdown!');
  };

  return (
    <div className="ai-tab-content">
      <div className="ai-doc-meta-bar">
        <span className="ai-doc-type-badge">{analysis.document_type}</span>
        {analysis.document_language && <span className="ai-meta-chip">🌐 {analysis.document_language}</span>}
        {analysis.page_count_estimate && <span className="ai-meta-chip">📄 {analysis.page_count_estimate}</span>}
        {analysis.entities?.document_date && <span className="ai-meta-chip">📅 {analysis.entities.document_date}</span>}
        {analysis.entities?.governing_law && <span className="ai-meta-chip">⚖️ {analysis.entities.governing_law}</span>}
      </div>

      {analysis.red_flags?.length > 0 && (
        <div className="ai-red-flags-banner">
          <Flag size={15} />
          <strong>{analysis.red_flags.length} Red Flag{analysis.red_flags.length > 1 ? 's' : ''} Detected</strong>
          <span>Scroll to Insights → Red Flags for details</span>
        </div>
      )}

      <div className="ai-summary-card">
        <div className="ai-summary-header">
          <h3><Sparkles size={16} /> Executive Summary</h3>
          <div className="ai-summary-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="ai-copy-btn" onClick={handleCopy} title="Copy Summary">
              {copiedSummary ? <CheckCheck size={14} /> : <Copy size={14} />}
            </button>
            <button className="ai-copy-btn" onClick={handleExport} title="Export Summary (Markdown)">
              <Download size={14} />
            </button>
          </div>
        </div>
        <div className="ai-summary-body">
          {(analysis.executive_summary || 'No summary available.').split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {analysis.sections?.length > 0 && (
        <div className="ai-sections-wrap">
          <h3 className="ai-section-group-title">
            <BookOpen size={15} /> Section-Wise Analysis
            <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              ({analysis.sections.length} sections)
            </span>
          </h3>
          {analysis.sections.map((sec, i) => (
            <div key={i} className="ai-doc-section">
              <div className="ai-doc-section-header">
                <span className="ai-doc-section-num">{i + 1}</span>
                <div>
                  <p className="ai-doc-section-title">{sec.title}</p>
                  {sec.page_ref && <span className="ai-source-chip" style={{ marginTop: '2px' }}><BookOpen size={10} /> {sec.page_ref}</span>}
                </div>
              </div>
              <p className="ai-doc-section-body">{sec.summary}</p>
            </div>
          ))}
        </div>
      )}

      {analysis.key_points?.length > 0 && (
        <div className="ai-key-points-wrap">
          <h3 className="ai-section-group-title"><Zap size={15} /> Key Points</h3>
          <div className="ai-key-points-list">
            {analysis.key_points.map((kp, i) => {
              const point  = typeof kp === 'string' ? kp : kp.point;
              const source = typeof kp === 'string' ? null : kp.source;
              const imp    = typeof kp === 'object' ? kp.importance : 'normal';
              const s      = getSev(imp === 'critical' ? 'high' : imp === 'high' ? 'medium' : 'low');
              return (
                <div key={i} className="ai-key-point-row">
                  <span className="ai-kp-dot" style={{ background: s.color }} />
                  <div className="ai-kp-content">
                    <p>{point}</p>
                    <SourceChip source={source} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
