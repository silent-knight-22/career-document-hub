import React from 'react';
import { Calendar, DollarSign, Hash, Zap, ArrowRight, Users, Clock, AlertTriangle, Briefcase } from 'lucide-react';
import { InsightSection, InsightCard, SourceChip } from '../InsightHelpers';

export default function DatesAndFinances({ analysis }) {
  return (
    <>
      <InsightSection icon={Calendar} title="Important Dates & Deadlines" count={analysis.important_dates?.length} color="#10b981" defaultOpen={true}>
        {analysis.important_dates?.map((d, i) => (
          <InsightCard key={i} severity={d.is_deadline ? 'medium' : undefined}>
            <div className="ai-ic-top">
              <p className="ai-ic-title ai-date-value"><Calendar size={12} /> {d.date}</p>
              {d.is_deadline && <span className="ai-deadline-tag">Deadline</span>}
            </div>
            <p className="ai-ic-body">{d.event}</p>
            <SourceChip source={d.source} />
          </InsightCard>
        ))}
      </InsightSection>

      <InsightSection icon={DollarSign} title="Financial Information" count={analysis.financial_info?.length} color="#f59e0b">
        {analysis.financial_info?.map((f, i) => (
          <InsightCard key={i}>
            <div className="ai-ic-top">
              <div>
                <span className="ai-fin-type">{f.type}</span>
                <p className="ai-fin-amount">{f.amount}</p>
              </div>
              {f.frequency && <span className="ai-freq-badge">{f.frequency}</span>}
            </div>
            {f.description && <p className="ai-ic-body">{f.description}</p>}
            {f.conditions  && <p className="ai-ic-sub"><strong>Conditions:</strong> {f.conditions}</p>}
            <SourceChip source={f.source} />
          </InsightCard>
        ))}
      </InsightSection>

      <InsightSection icon={Hash} title="Important Numbers & Figures" count={analysis.important_numbers?.length} color="#6366f1">
        <div className="ai-numbers-grid">
          {analysis.important_numbers?.map((n, i) => (
            <div key={i} className="ai-number-card">
              <p className="ai-number-value">{n.value}</p>
              <p className="ai-number-desc">{n.description}</p>
              <SourceChip source={n.source} />
            </div>
          ))}
        </div>
      </InsightSection>

      <InsightSection icon={Zap} title="Benefits & Entitlements" count={analysis.benefits?.length} color="#10b981">
        {analysis.benefits?.map((b, i) => (
          <InsightCard key={i} style={{ borderLeftColor: '#10b981', background: '#f0fdf488' }}>
            <div className="ai-ic-top">
              <p className="ai-ic-title">{b.benefit}</p>
              <span className="ai-party-badge" style={{ background: '#d1fae5', color: '#065f46' }}>{b.party}</span>
            </div>
            {b.conditions && <p className="ai-ic-sub"><strong>Conditions:</strong> {b.conditions}</p>}
            <SourceChip source={b.source} />
          </InsightCard>
        ))}
      </InsightSection>

      <InsightSection icon={ArrowRight} title="Action Items" count={analysis.action_items?.length} color="#8b5cf6">
        {analysis.action_items?.map((a, i) => {
          const action   = typeof a === 'string' ? a : a.action;
          const deadline = typeof a === 'object' ? a.deadline : null;
          const priority = typeof a === 'object' ? a.priority : 'normal';
          return (
            <div key={i} className="ai-action-row">
              <span className="ai-action-check">
                {priority === 'urgent' ? <AlertTriangle size={13} color="#ef4444" /> : <ArrowRight size={13} color="#8b5cf6" />}
              </span>
              <div>
                <p className="ai-action-text">{action}</p>
                {deadline && <p className="ai-ic-sub"><Clock size={10} /> By: {deadline}</p>}
              </div>
              {priority === 'urgent' && <span className="ai-urgent-tag">Urgent</span>}
            </div>
          );
        })}
      </InsightSection>

      <InsightSection icon={Users} title="Contacts & Parties" count={analysis.contacts?.length} color="#64748b">
        <div className="ai-contacts-grid">
          {analysis.contacts?.map((c, i) => (
            <div key={i} className="ai-contact-card">
              <p className="ai-contact-name">{c.name}</p>
              <p className="ai-contact-role">{c.role}</p>
              {c.organization && <p className="ai-contact-org"><Briefcase size={10} /> {c.organization}</p>}
              {c.email && <p className="ai-contact-info">✉️ {c.email}</p>}
              {c.phone && <p className="ai-contact-info">📞 {c.phone}</p>}
            </div>
          ))}
        </div>
      </InsightSection>
    </>
  );
}
