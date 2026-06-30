import React from 'react';
import { Flag, AlertTriangle, AlertCircle } from 'lucide-react';
import { InsightSection, InsightCard, SevBadge, SourceChip } from '../InsightHelpers';

export default function RedFlagsAndRisks({ analysis }) {
  return (
    <>
      <InsightSection icon={Flag} title="Red Flags" count={analysis.red_flags?.length} color="#dc2626" defaultOpen={true}>
        {analysis.red_flags?.map((r, i) => (
          <InsightCard key={i} severity="high">
            <p className="ai-ic-title"><AlertTriangle size={13} /> {r.flag}</p>
            <p className="ai-ic-body">{r.explanation}</p>
            <SourceChip source={r.source} />
          </InsightCard>
        ))}
      </InsightSection>

      <InsightSection icon={AlertCircle} title="Risks & Penalties" count={analysis.risks?.length} color="#ef4444">
        {analysis.risks?.map((r, i) => (
          <InsightCard key={i} severity={r.severity}>
            <div className="ai-ic-top">
              <p className="ai-ic-title">{r.risk}</p>
              <SevBadge value={r.severity} />
            </div>
            {r.trigger && <p className="ai-ic-sub"><strong>Trigger:</strong> {r.trigger}</p>}
            <SourceChip source={r.source} />
          </InsightCard>
        ))}
      </InsightSection>

      <InsightSection icon={AlertTriangle} title="Warnings" count={analysis.warnings?.length} color="#f59e0b">
        {analysis.warnings?.map((w, i) => (
          <InsightCard key={i} severity={w.severity}>
            <div className="ai-ic-top">
              <p className="ai-ic-title">{w.warning}</p>
              <SevBadge value={w.severity} />
            </div>
            <SourceChip source={w.source} />
          </InsightCard>
        ))}
      </InsightSection>
    </>
  );
}
