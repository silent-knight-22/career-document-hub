import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Brain, Sparkles, FileText, MessageSquare, ChevronRight,
  Send, Key, ExternalLink, AlertTriangle, CheckCircle2,
  Calendar, DollarSign, Users, Shield, Zap, Clock,
  BookOpen, Archive, RefreshCw, Copy, ChevronDown,
  ChevronUp, Flag, Hash, Briefcase, Lock, Info,
  AlertCircle, ArrowRight, X, CheckCheck, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getVaultItems } from '../services/vaultService';
import { getDocuments } from '../services/documentService';
import {
  hasApiKey, getApiKey, setApiKey, clearApiKey,
  analyzeDocument, askQuestion,
  getCachedAnalysis, cacheAnalysis, clearAnalysis,
  getChatHistory, saveChatHistory, clearChatHistory,
  getSuggestedQuestions, verifyApiKey,
} from '../services/geminiService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import './DocumentAI.css';

// ── Helpers ───────────────────────────────────────────────────
function formatBytes(b) {
  if (!b) return '';
  const k = 1024, i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${['B','KB','MB'][i]}`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

// ── Severity / importance colours ────────────────────────────
const SEV = {
  high:     { color: '#ef4444', bg: '#fee2e2', border: '#fca5a5' },
  medium:   { color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d' },
  low:      { color: '#3b82f6', bg: '#dbeafe', border: '#93c5fd' },
  critical: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  normal:   { color: '#6366f1', bg: '#eef2ff', border: '#a5b4fc' },
};
const getSev = (s) => SEV[s?.toLowerCase()] || SEV.normal;

// ── Sub-components ─────────────────────────────────────────────

/** API Key setup screen */
function ApiKeySetup({ onSaved }) {
  const [key, setKey]         = useState('');
  const [show, setShow]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [foundModel, setFoundModel]   = useState('');

  const handleSave = async () => {
    if (!key.trim()) {
      setVerifyError('Please enter your API key.');
      return;
    }
    setSaving(true);
    setVerifyError('');
    setFoundModel('');
    // No prefix check — verify by calling the real listModels endpoint
    const result = await verifyApiKey(key.trim());
    if (!result.ok) {
      setSaving(false);
      setVerifyError(result.error);
      return;
    }
    setFoundModel(result.model);
    setApiKey(key.trim());
    setSaving(false);
    toast.success(`Key verified ✓  Using ${result.model}`);
    onSaved();
  };

  return (
    <div className="ai-setup-screen">
      <div className="ai-setup-card">
        <div className="ai-setup-icon"><Brain size={32} /></div>
        <h2>Set up AI Document Intelligence</h2>
        <p>
          This feature uses <strong>Google Gemini</strong> to deeply analyse your documents.
          The integration automatically selects the best available model for your API key.
          Get a free key from Google AI Studio — no credit card required.
        </p>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="ai-setup-link"
        >
          <ExternalLink size={14} /> Get your free API key at aistudio.google.com
        </a>
        <div className="ai-setup-input-row">
          <input
            className="ai-setup-input"
            type={show ? 'text' : 'password'}
            placeholder="Paste your Gemini API key here"
            value={key}
            onChange={(e) => { setKey(e.target.value); setVerifyError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button className="ai-setup-show" onClick={() => setShow(!show)}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        {verifyError && (
          <div className="ai-key-error">
            <AlertCircle size={13} />
            {verifyError}
          </div>
        )}
        {foundModel && !saving && (
          <div className="ai-key-success">
            <CheckCircle2 size={13} />
            Model found: <strong>{foundModel}</strong>
          </div>
        )}
        <Button icon={saving ? Loader2 : Key} onClick={handleSave} disabled={!key.trim() || saving}>
          {saving ? 'Discovering models…' : 'Verify & Save API Key'}
        </Button>
        <p className="ai-setup-note">
          Key is stored locally in your browser only — never sent to our servers.
        </p>
      </div>
    </div>
  );
}

/** Source citation chip */
function SourceChip({ source }) {
  if (!source) return null;
  return (
    <span className="ai-source-chip">
      <BookOpen size={10} /> {source}
    </span>
  );
}

/** Severity badge */
function SevBadge({ value }) {
  const s = getSev(value);
  return (
    <span className="ai-sev-badge" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {value}
    </span>
  );
}

/** Collapsible insight section */
function InsightSection({ icon: Icon, title, count, color, defaultOpen = false, children }) {
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

/** Single insight card */
function InsightCard({ children, severity, style }) {
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

/** Loading skeleton */
function AnalysisSkeleton({ step }) {
  const steps = [
    'Preparing document...',
    'Sending to Gemini 1.5 Flash...',
    'Running deep analysis...',
    'Parsing results...',
    'Done!',
  ];
  return (
    <div className="ai-skeleton-wrap">
      <div className="ai-skeleton-spinner">
        <Brain size={28} className="ai-brain-pulse" />
      </div>
      <p className="ai-skeleton-step">{step?.label || 'Analysing document...'}</p>
      <p className="ai-skeleton-hint">
        Gemini is performing a comprehensive analysis — extracting all sections, entities, dates, and risks.
        This takes 10–30 seconds for complex documents.
      </p>
      <div className="ai-skeleton-bars">
        {[100, 80, 60, 90, 70].map((w, i) => (
          <div key={i} className="ai-skeleton-bar" style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <div className="ai-progress-steps">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`ai-progress-step ${(step?.step || 0) > i ? 'done' : (step?.step || 0) === i ? 'active' : ''}`}
          >
            {(step?.step || 0) > i ? <CheckCheck size={12} /> : <span>{i + 1}</span>}
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Summary Tab ───────────────────────────────────────────────
function SummaryTab({ analysis }) {
  const [copiedSummary, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(analysis.executive_summary || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ai-tab-content">
      {/* Document meta */}
      <div className="ai-doc-meta-bar">
        <span className="ai-doc-type-badge">{analysis.document_type}</span>
        {analysis.document_language && <span className="ai-meta-chip">🌐 {analysis.document_language}</span>}
        {analysis.page_count_estimate && <span className="ai-meta-chip">📄 {analysis.page_count_estimate}</span>}
        {analysis.entities?.document_date && <span className="ai-meta-chip">📅 {analysis.entities.document_date}</span>}
        {analysis.entities?.governing_law && <span className="ai-meta-chip">⚖️ {analysis.entities.governing_law}</span>}
      </div>

      {/* Red flags banner */}
      {analysis.red_flags?.length > 0 && (
        <div className="ai-red-flags-banner">
          <Flag size={15} />
          <strong>{analysis.red_flags.length} Red Flag{analysis.red_flags.length > 1 ? 's' : ''} Detected</strong>
          <span>Scroll to Insights → Red Flags for details</span>
        </div>
      )}

      {/* Executive Summary */}
      <div className="ai-summary-card">
        <div className="ai-summary-header">
          <h3><Sparkles size={16} /> Executive Summary</h3>
          <button className="ai-copy-btn" onClick={handleCopy} title="Copy">
            {copiedSummary ? <CheckCheck size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <div className="ai-summary-body">
          {(analysis.executive_summary || 'No summary available.').split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* Section-wise summaries */}
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

      {/* Key Points */}
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

// ── Insights Tab ──────────────────────────────────────────────
function InsightsTab({ analysis }) {
  return (
    <div className="ai-tab-content">

      {/* Red Flags */}
      <InsightSection icon={Flag} title="Red Flags" count={analysis.red_flags?.length} color="#dc2626" defaultOpen={true}>
        {analysis.red_flags?.map((r, i) => (
          <InsightCard key={i} severity="high">
            <p className="ai-ic-title"><AlertTriangle size={13} /> {r.flag}</p>
            <p className="ai-ic-body">{r.explanation}</p>
            <SourceChip source={r.source} />
          </InsightCard>
        ))}
      </InsightSection>

      {/* Risks */}
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

      {/* Warnings */}
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

      {/* Legal Restrictions */}
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

      {/* Obligations */}
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

      {/* Responsibilities */}
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

      {/* Important Dates */}
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

      {/* Financial Info */}
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

      {/* Important Numbers */}
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

      {/* Benefits */}
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

      {/* Action Items */}
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

      {/* Contacts */}
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

    </div>
  );
}

// ── Chat Tab ──────────────────────────────────────────────────
function ChatTab({ analysis, docId }) {
  const [history, setHistory]   = useState(() => getChatHistory(docId));
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const suggested = getSuggestedQuestions(analysis.document_type);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setInput('');
    setLoading(true);

    const userEntry = { question: q, answer: null, ts: Date.now() };
    const newHistory = [...history, userEntry];
    setHistory(newHistory);

    try {
      const answer = await askQuestion(analysis, q, history);
      const finalHistory = newHistory.map((h, i) =>
        i === newHistory.length - 1 ? { ...h, answer } : h
      );
      setHistory(finalHistory);
      saveChatHistory(docId, finalHistory);
    } catch (err) {
      const finalHistory = newHistory.map((h, i) =>
        i === newHistory.length - 1
          ? { ...h, answer: `⚠️ Error: ${err.message}` }
          : h
      );
      setHistory(finalHistory);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [analysis, history, docId, loading]);

  const handleClear = () => {
    clearChatHistory(docId);
    setHistory([]);
    toast.success('Conversation cleared');
  };

  // Format AI answer — highlight source citation
  const formatAnswer = (text) => {
    if (!text) return text;
    const parts = text.split(/(📍 Source:[^\n]+)/g);
    return parts.map((p, i) =>
      p.startsWith('📍 Source:')
        ? <span key={i} className="ai-chat-source">{p}</span>
        : <span key={i}>{p}</span>
    );
  };

  return (
    <div className="ai-chat-wrap">
      {/* Suggested questions */}
      {history.length === 0 && (
        <div className="ai-suggested-wrap">
          <p className="ai-suggested-label">Suggested questions:</p>
          <div className="ai-suggested-chips">
            {suggested.slice(0, 6).map((q, i) => (
              <button key={i} className="ai-suggested-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="ai-chat-messages">
        {history.map((h, i) => (
          <div key={i} className="ai-chat-turn">
            {/* User message */}
            <div className="ai-chat-user">
              <span className="ai-chat-user-bubble">{h.question}</span>
            </div>
            {/* AI answer */}
            {h.answer !== null ? (
              <div className="ai-chat-ai">
                <div className="ai-chat-ai-icon"><Brain size={14} /></div>
                <div className="ai-chat-ai-bubble">
                  <div className="ai-chat-ai-text">
                    {formatAnswer(h.answer)}
                  </div>
                  <button
                    className="ai-chat-copy"
                    onClick={() => copyToClipboard(h.answer)}
                    title="Copy answer"
                  >
                    <Copy size={11} />
                  </button>
                </div>
              </div>
            ) : loading && i === history.length - 1 ? (
              <div className="ai-chat-ai">
                <div className="ai-chat-ai-icon"><Brain size={14} /></div>
                <div className="ai-chat-thinking">
                  <span /><span /><span />
                </div>
              </div>
            ) : null}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="ai-chat-input-wrap">
        {history.length > 0 && (
          <button className="ai-chat-clear" onClick={handleClear} title="Clear conversation">
            <X size={13} /> Clear
          </button>
        )}
        {history.length > 0 && (
          <div className="ai-suggested-chips ai-chat-followup">
            {suggested.slice(0, 4).map((q, i) => (
              <button key={i} className="ai-suggested-chip sm" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
        <div className="ai-chat-input-row">
          <textarea
            ref={inputRef}
            className="ai-chat-input"
            placeholder="Ask anything about this document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            rows={2}
            disabled={loading}
          />
          <button
            className="ai-chat-send"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 size={18} className="ai-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="ai-chat-hint">Enter to send · Shift+Enter for new line · Answers always include source citations</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════
export default function DocumentAI() {
  const { user } = useAuth();
  const userId = user?.userId || '';

  const [apiReady, setApiReady]       = useState(hasApiKey());
  const [selectedDoc, setSelected]    = useState(null);
  const [analysisState, setAnaState]  = useState('idle'); // idle | loading | done | error
  const [analysis, setAnalysis]       = useState(null);
  const [progress, setProgress]       = useState(null);
  const [errorMsg, setErrorMsg]       = useState('');
  const [activeTab, setActiveTab]     = useState('summary');
  const [showKeyModal, setKeyModal]   = useState(false);
  const [newKey, setNewKey]           = useState('');
  const [modalKeyError, setModalKeyError] = useState('');
  const [modalSaving, setModalSaving] = useState(false);
  const [docTab, setDocTab]           = useState('vault'); // 'vault' | 'sign'

  // Document sources
  const vaultDocs = getVaultItems(userId);
  const signDocs  = getDocuments(userId).filter(d => d.dataUrl);
  const allDocs   = docTab === 'vault' ? vaultDocs : signDocs;

  const handleSelectDoc = (doc) => {
    setSelected(doc);
    // Try to load cached analysis
    const cached = getCachedAnalysis(doc.id);
    if (cached) {
      setAnalysis(cached);
      setAnaState('done');
      setActiveTab('summary');
    } else {
      setAnalysis(null);
      setAnaState('idle');
    }
  };

  const handleAnalyse = async () => {
    if (!selectedDoc?.dataUrl) {
      toast.error('This document has no attached file. Please upload one first.');
      return;
    }
    setAnaState('loading');
    setProgress({ step: 0, label: 'Starting...' });
    setErrorMsg('');

    try {
      const result = await analyzeDocument(
        selectedDoc.dataUrl,
        (p) => setProgress(p)
      );
      cacheAnalysis(selectedDoc.id, result);
      setAnalysis(result);
      setAnaState('done');
      setActiveTab('summary');
      toast.success('Analysis complete!');
    } catch (err) {
      setAnaState('error');
      setErrorMsg(err.message);
      if (err.message === 'NO_API_KEY') {
        setApiReady(false);
      }
    }
  };

  const handleReanalyse = () => {
    clearAnalysis(selectedDoc.id);
    setAnalysis(null);
    setAnaState('idle');
  };

  const handleSaveKey = async () => {
    if (!newKey.trim()) return;
    setModalSaving(true);
    setModalKeyError('');
    // Verify by real API call — no prefix check
    const result = await verifyApiKey(newKey.trim());
    if (!result.ok) {
      setModalSaving(false);
      setModalKeyError(result.error);
      return;
    }
    setApiKey(newKey.trim());
    setApiReady(true);
    setModalSaving(false);
    setKeyModal(false);
    setNewKey('');
    setModalKeyError('');
    toast.success('API key verified and updated!');
  };

  if (!apiReady) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar title="AI Insights" />
          <ApiKeySetup onSaved={() => setApiReady(true)} />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'summary',  label: 'Summary',  icon: BookOpen },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'chat',     label: 'Chat Q&A', icon: MessageSquare },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar title="AI Insights" />

        <div className="ai-page-layout">

          {/* ── LEFT PANEL ── */}
          <div className="ai-left-panel">

            {/* API key controls */}
            <div className="ai-left-header">
              <span className="ai-header-title"><Brain size={15} /> AI Document Intelligence</span>
              <button className="ai-key-btn" onClick={() => setKeyModal(true)} title="Manage API key">
                <Key size={13} />
              </button>
            </div>

            {/* Document source tabs */}
            <div className="ai-source-tabs">
              <button
                className={`ai-source-tab ${docTab === 'vault' ? 'active' : ''}`}
                onClick={() => setDocTab('vault')}
              >
                <Archive size={13} /> Vault ({vaultDocs.length})
              </button>
              <button
                className={`ai-source-tab ${docTab === 'sign' ? 'active' : ''}`}
                onClick={() => setDocTab('sign')}
              >
                <FileText size={13} /> Documents ({signDocs.length})
              </button>
            </div>

            {/* Document list */}
            <div className="ai-doc-list">
              {allDocs.length === 0 ? (
                <p className="ai-no-docs">
                  No documents found. Upload documents to your{' '}
                  {docTab === 'vault' ? 'Document Vault' : 'Sign Documents'} first.
                </p>
              ) : (
                allDocs.map((doc) => (
                  <button
                    key={doc.id}
                    className={`ai-doc-item ${selectedDoc?.id === doc.id ? 'selected' : ''}`}
                    onClick={() => handleSelectDoc(doc)}
                  >
                    <div className="ai-doc-item-icon">
                      {doc.type === 'pdf' ? '📄' : '🖼️'}
                    </div>
                    <div className="ai-doc-item-info">
                      <p className="ai-doc-item-name">{doc.name}</p>
                      <p className="ai-doc-item-meta">
                        {formatBytes(doc.size)}
                        {getCachedAnalysis(doc.id) && <span className="ai-analysed-badge">✓ Analysed</span>}
                      </p>
                    </div>
                    <ChevronRight size={13} className="ai-doc-item-arrow" />
                  </button>
                ))
              )}
            </div>

            {/* Selected doc actions */}
            {selectedDoc && (
              <div className="ai-left-actions">
                <div className="ai-selected-doc-card">
                  <p className="ai-selected-name">{selectedDoc.name}</p>
                  <p className="ai-selected-meta">{formatBytes(selectedDoc.size)}</p>
                  {analysis?._cachedAt && (
                    <p className="ai-cache-note">
                      <CheckCheck size={11} /> Analysed {timeAgo(analysis._cachedAt)}
                    </p>
                  )}
                </div>

                {analysisState !== 'loading' && (
                  <>
                    {analysisState !== 'done' ? (
                      <Button
                        icon={Brain}
                        onClick={handleAnalyse}
                        style={{ width: '100%' }}
                      >
                        Generate Deep Analysis
                      </Button>
                    ) : (
                      <button className="ai-reanalyse-btn" onClick={handleReanalyse}>
                        <RefreshCw size={13} /> Re-analyse document
                      </button>
                    )}
                  </>
                )}

                {analysisState === 'error' && (
                  <div className="ai-error-box">
                    <AlertCircle size={14} />
                    <p>{errorMsg}</p>
                    {errorMsg.includes('key') && (
                      <button onClick={() => setKeyModal(true)}>Update API key</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="ai-right-panel">
            {!selectedDoc && (
              <div className="ai-empty-state">
                <div className="ai-empty-icon animate-float"><Brain size={40} /></div>
                <h3>Select a document to analyse</h3>
                <p>
                  Choose any document from your Vault or Sign Documents.
                  Gemini 1.5 Flash will perform a deep, section-by-section analysis —
                  extracting all dates, obligations, risks, benefits, and legal restrictions
                  with source citations.
                </p>
                <div className="ai-empty-features">
                  {['Comprehensive section summaries', 'Source-cited key points', 'Legal restriction extraction', 'Risk & penalty detection', 'Financial info extraction', 'Natural language Q&A'].map((f) => (
                    <span key={f} className="ai-empty-feature"><CheckCircle2 size={13} /> {f}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedDoc && analysisState === 'idle' && (
              <div className="ai-empty-state">
                <div className="ai-empty-icon"><Sparkles size={36} /></div>
                <h3>Ready to analyse</h3>
                <p>
                  Click <strong>Generate Deep Analysis</strong> to start.
                  The AI will read the full document and produce a comprehensive
                  section-wise analysis with source citations for every finding.
                </p>
              </div>
            )}

            {selectedDoc && analysisState === 'loading' && (
              <AnalysisSkeleton step={progress} />
            )}

            {selectedDoc && analysisState === 'done' && analysis && (
              <>
                {/* Tabs */}
                <div className="ai-tabs">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      className={`ai-tab ${activeTab === id ? 'active' : ''}`}
                      onClick={() => setActiveTab(id)}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>

                <div className="ai-tab-scroll">
                  {activeTab === 'summary'  && <SummaryTab  analysis={analysis} />}
                  {activeTab === 'insights' && <InsightsTab analysis={analysis} />}
                  {activeTab === 'chat'     && <ChatTab     analysis={analysis} docId={selectedDoc.id} />}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* API Key modal */}
      {showKeyModal && (
        <div className="ai-modal-overlay" onClick={() => { setKeyModal(false); setModalKeyError(''); }}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <h3><Key size={16} /> Manage API Key</h3>
              <button onClick={() => { setKeyModal(false); setModalKeyError(''); }}><X size={16} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Get a free key at{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)' }}>
                aistudio.google.com
              </a>
              . The key will be verified before saving.
            </p>
            <input
              className="ai-setup-input"
              type="password"
              placeholder="Paste your Gemini API key"
              value={newKey}
              onChange={(e) => { setNewKey(e.target.value); setModalKeyError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
            />
            {modalKeyError && (
              <div className="ai-key-error" style={{ marginTop: '0.625rem' }}>
                <AlertCircle size={13} />
                {modalKeyError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <Button
                icon={modalSaving ? Loader2 : Key}
                onClick={handleSaveKey}
                disabled={!newKey.trim() || modalSaving}
              >
                {modalSaving ? 'Verifying...' : 'Verify & Update Key'}
              </Button>
              <Button variant="danger" onClick={() => { clearApiKey(); setApiReady(false); setKeyModal(false); }}>
                Remove Key
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
