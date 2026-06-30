import React from 'react';
import { Shield, CheckCircle2, Users, Clock, AlertTriangle, Lock } from 'lucide-react';
import { InsightSection, InsightCard, SourceChip } from '../InsightHelpers';

export default function ObligationsAndRules({ analysis }) {
  return (
    <>
      <InsightSection icon={Lock} title="Legal Restrictions" count={analysis.legal_restrictions?.length} color="#8b5cf6">
        {analysis.legal_restrictions?.map((r, i) => (
          <InsightCard key={i}>
            <p className="ai-ic-title"><Shield size={12} /> {r.restriction}</p>
            {r.duration      && <p className="ai-ic-sub"><strong>Duration:</strong> {r.duration}</p>}
            {r.geographic_scope && <p className="ai-ic-sub"><strong>Scope:</strong> {r.geographic_scope}</p>}
            <SourceChip source={r.source} />
          </InsightCard>
        ))}
      </InsightSection>

      <InsightSection icon={CheckCircle2} title="Obligations" count={analysis.obligations?.length} color="#3b82f6">
        {analysis.obligations?.map((o, i) => (
          <InsightCard key={i}>
            <div className="ai-ic-top">
              <p className="ai-ic-title">{o.obligation}</p>
              <span className="ai-party-badge">{o.party}</span>
            </div>
            {o.deadline            && <p className="ai-ic-sub"><Clock size={10} /> <strong>By:</strong> {o.deadline}</p>}
            {o.consequence_of_breach && <p className="ai-ic-sub"><AlertTriangle size={10} /> <strong>If breached:</strong> {o.consequence_of_breach}</p>}
            <SourceChip source={o.source} />
          </InsightCard>
        ))}
      </InsightSection>

      <InsightSection icon={Users} title="Responsibilities" count={analysis.responsibilities?.length} color="#06b6d4">
        {analysis.responsibilities?.map((r, i) => (
          <InsightCard key={i}>
            <div className="ai-ic-top">
              <p className="ai-ic-title">{r.responsibility}</p>
              <span className="ai-party-badge">{r.party}</span>
            </div>
            {r.is_mandatory && <span className="ai-mandatory-tag">Mandatory</span>}
            <SourceChip source={r.source} />
          </InsightCard>
        ))}
      </InsightSection>
    </>
  );
}
