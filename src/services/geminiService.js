// ============================================================
// GEMINI SERVICE — AI Document Intelligence
// Architecture: auto-discover model from listModels endpoint.
// No model name is ever hardcoded in a request — the service
// queries the API to find what is actually available for this key.
// ============================================================

const API_BASE    = 'https://generativelanguage.googleapis.com/v1beta';
const KEY_STORAGE = 'cdh_gemini_api_key';
const ANA_PREFIX  = 'cdh_analysis_';
const CHAT_PREFIX = 'cdh_chat_';

// ── Model config — preference order only, never used directly ─
// The actual model sent in requests is always resolved via
// listModels() so it matches what the API key has access to.
const MODEL_PREFERENCE = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
];

// Per-session model cache (clears on tab reload — forces re-discovery)
const SESSION_MODEL_KEY = 'cdh_gemini_resolved_model';

function getSessionModel()       { return sessionStorage.getItem(SESSION_MODEL_KEY) || null; }
function setSessionModel(name)   { sessionStorage.setItem(SESSION_MODEL_KEY, name); }
function clearSessionModel()     { sessionStorage.removeItem(SESSION_MODEL_KEY); }

// ── API Key helpers ───────────────────────────────────────────
export const getApiKey   = ()  => localStorage.getItem(KEY_STORAGE) || '';
export const setApiKey   = (k) => { localStorage.setItem(KEY_STORAGE, k.trim()); clearSessionModel(); };
export const clearApiKey = ()  => { localStorage.removeItem(KEY_STORAGE); clearSessionModel(); };
export const hasApiKey   = ()  => !!getApiKey();

// ── Analysis cache (per document) ────────────────────────────
export const getCachedAnalysis = (docId) =>
  JSON.parse(localStorage.getItem(ANA_PREFIX + docId) || 'null');
export const cacheAnalysis = (docId, data) =>
  localStorage.setItem(ANA_PREFIX + docId, JSON.stringify({ ...data, _cachedAt: Date.now() }));
export const clearAnalysis = (docId) =>
  localStorage.removeItem(ANA_PREFIX + docId);

// ── Chat history (per document) ───────────────────────────────
export const getChatHistory  = (docId) =>
  JSON.parse(localStorage.getItem(CHAT_PREFIX + docId) || '[]');
export const saveChatHistory = (docId, h) =>
  localStorage.setItem(CHAT_PREFIX + docId, JSON.stringify(h.slice(-30)));
export const clearChatHistory = (docId) =>
  localStorage.removeItem(CHAT_PREFIX + docId);

// ── Data URL → Gemini inline_data part ───────────────────────
function dataUrlToPart(dataUrl) {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!m) throw new Error('Unrecognised data URL format');
  return { inline_data: { mime_type: m[1], data: m[2] } };
}

// ════════════════════════════════════════════════════════════════
// listModels — queries the actual API for available models.
// Returns an array of model IDs (without the "models/" prefix)
// that support generateContent, filtered to a usable set.
// ════════════════════════════════════════════════════════════════
async function listModels(key) {
  const url = `${API_BASE}/models?key=${encodeURIComponent(key)}`;
  console.info('[Gemini] listModels →', url.replace(encodeURIComponent(key), '***'));

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(body?.error?.message || `listModels failed: HTTP ${res.status}`),
      { status: res.status, body }
    );
  }

  const { models = [] } = await res.json();
  const gc = models
    .filter(m => Array.isArray(m.supportedGenerationMethods)
                 && m.supportedGenerationMethods.includes('generateContent'))
    .map(m => m.name.replace(/^models\//, ''));

  console.info('[Gemini] generateContent-capable models:', gc.join(', ') || '(none)');
  return gc;
}

// ════════════════════════════════════════════════════════════════
// resolveModel — returns the best available model for this key.
// Result is cached in sessionStorage so we only call listModels
// once per browser session per API key.
// ════════════════════════════════════════════════════════════════
async function resolveModel(key) {
  const cached = getSessionModel();
  if (cached) {
    console.info('[Gemini] Using cached resolved model:', cached);
    return cached;
  }

  const available = await listModels(key);

  if (available.length === 0) {
    throw new Error(
      'Your API key has no access to any Gemini generative models. ' +
      'Make sure the Generative Language API is enabled in your Google Cloud project.'
    );
  }

  // Pick highest-preference model that the API actually exposes
  for (const preferred of MODEL_PREFERENCE) {
    const match = available.find(
      m => m === preferred || m.startsWith(preferred + '-') || m.startsWith(preferred + '.')
    );
    if (match) {
      console.info('[Gemini] Resolved model (from preference list):', match);
      setSessionModel(match);
      return match;
    }
  }

  // Fallback: first available model
  const fallback = available[0];
  console.info('[Gemini] Resolved model (fallback to first available):', fallback);
  setSessionModel(fallback);
  return fallback;
}

// ════════════════════════════════════════════════════════════════
// geminiPost — central request function.
// Always resolves the model dynamically.
// ════════════════════════════════════════════════════════════════
async function geminiPost(contents, config = {}) {
  const key = getApiKey();
  if (!key) throw new Error('NO_API_KEY');

  // Resolve model (cached after first call)
  const model = config.model || await resolveModel(key);
  const url   = `${API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  console.info('[Gemini] POST models/' + model + ':generateContent');

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature:     config.temperature     ?? 0.1,
        maxOutputTokens: config.maxOutputTokens ?? 8192,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg  = body?.error?.message || '';
    const code = body?.error?.code   || res.status;

    // Model not found → clear session so next call re-discovers
    if (res.status === 404 || (msg.toLowerCase().includes('not found') && msg.toLowerCase().includes('model'))) {
      console.warn('[Gemini] Model not found, clearing session model cache');
      clearSessionModel();
      throw new Error(
        `Model "${model}" is not available for this API key. ` +
        `Please try again — the service will auto-select an available model.`
      );
    }
    if (res.status === 400) throw new Error(`Invalid request: ${msg}`);
    if (res.status === 403) throw new Error(`Permission denied: ${msg || 'Check that the Generative Language API is enabled.'}`);
    if (res.status === 429) throw new Error('Rate limit reached — please wait 60 seconds and try again.');
    if (res.status >= 500) throw new Error(`Gemini server error (${code}). Try again in a moment.`);
    throw new Error(msg || `API error: HTTP ${res.status}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini. Please retry.');
  return { text, model }; // return used model for transparency
}

// ── Parse JSON safely (strips markdown fences) ────────────────
function parseJSON(raw) {
  const clean = raw
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const m = clean.match(/\{[\s\S]+\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Gemini returned malformed JSON. Please retry.');
  }
}

// ════════════════════════════════════════════════════════════════
// verifyApiKey
// Verifies by calling listModels (lightweight GET, no content sent).
// Returns { ok, model, allModels } on success.
// Returns { ok: false, error } with the exact API error on failure.
// ════════════════════════════════════════════════════════════════
export async function verifyApiKey(key) {
  if (!key?.trim()) return { ok: false, error: 'Please enter your API key.' };

  try {
    const available = await listModels(key.trim());

    if (available.length === 0) {
      return {
        ok: false,
        error:
          'Your API key is valid but no Gemini generative models are accessible. ' +
          'Enable the "Generative Language API" in your Google Cloud Console.',
      };
    }

    // Resolve + cache the best model now
    setSessionModel(null); // reset so resolveModel re-runs with new key
    sessionStorage.removeItem(SESSION_MODEL_KEY);

    let bestModel = available[0];
    for (const p of MODEL_PREFERENCE) {
      const m = available.find(a => a === p || a.startsWith(p + '-') || a.startsWith(p + '.'));
      if (m) { bestModel = m; break; }
    }
    setSessionModel(bestModel);

    console.info('[Gemini] Key verified ✓  Best model:', bestModel);
    console.info('[Gemini] All available models:', available.join(', '));

    return { ok: true, model: bestModel, allModels: available };

  } catch (err) {
    console.error('[Gemini] verifyApiKey error:', err.message);
    // Map HTTP error codes to user-friendly messages
    if (err.status === 400) return { ok: false, error: `Invalid API key: ${err.message}` };
    if (err.status === 403) return { ok: false, error: `API key rejected: ${err.message}` };
    if (err.status === 429) return { ok: false, error: 'Too many requests. Wait a moment and try again.' };
    return { ok: false, error: err.message || 'Network error — check your connection.' };
  }
}

// ════════════════════════════════════════════════════════════════
// DEEP ANALYSIS PROMPT (unchanged from previous version)
// ════════════════════════════════════════════════════════════════
const DEEP_ANALYSIS_PROMPT = `
You are an expert document analyst specialising in legal, financial, employment, and academic documents.

═══════════════════════════════════════════════════════
PRIME DIRECTIVE: COMPLETENESS OVER BREVITY
═══════════════════════════════════════════════════════
1. NEVER summarise in a way that loses information.
2. EVERY extracted item MUST include a "source" field (section name, clause number, paragraph, or page reference).
3. Extract ALL dates, ALL numbers, ALL obligations, ALL restrictions — missing one is a failure.
4. Analyse EVERY section of the document individually, even if it seems minor.
5. Legal clauses must be reproduced faithfully, not loosely paraphrased.
6. For employment/offer letters: always extract compensation, bond/notice period, working hours, IP clauses.
7. For contracts: always extract termination clauses, penalties, renewal terms, governing law.
8. For certificates: always extract validity period, issuing authority, credential ID.
9. For academic documents: always extract grades, institution, date, and any conditions.

Return ONLY valid JSON — no markdown code fences, no commentary, just the JSON object.

{
  "document_type": "Infer from content: Offer Letter | Employment Contract | Certificate | Marksheet | Resume | Policy Document | Legal Agreement | Government Form | Research Paper | Technical Document | NDA | Internship Agreement | Admission Letter | Scholarship Letter | Other",
  "document_language": "e.g. English",
  "page_count_estimate": "e.g. 3 pages or Unknown",

  "executive_summary": "COMPREHENSIVE overview — minimum 5 paragraphs. Cover every major topic. Do not trim for brevity.",

  "sections": [
    {
      "title": "Exact section/heading name from document",
      "page_ref": "Page X or Clause Y or Paragraph Z",
      "summary": "DETAILED summary of this section — preserve all specifics, numbers, conditions"
    }
  ],

  "key_points": [
    {
      "point": "The complete, specific key point",
      "importance": "critical | high | medium",
      "source": "Section/Clause/Page reference"
    }
  ],

  "important_dates": [
    {
      "date": "Exact date or timeframe as written",
      "event": "What happens on/by this date",
      "is_deadline": true,
      "source": "Exact reference"
    }
  ],

  "important_numbers": [
    {
      "value": "Exact value with unit/currency",
      "description": "What this number represents",
      "source": "Exact reference"
    }
  ],

  "responsibilities": [
    {
      "party": "Employee | Employer | Student | Both | Contractor | Third Party",
      "responsibility": "Exact responsibility with conditions",
      "is_mandatory": true,
      "source": "Exact reference"
    }
  ],

  "risks": [
    {
      "risk": "Full description of the risk or penalty",
      "severity": "high | medium | low",
      "trigger": "What triggers this risk",
      "source": "Exact reference"
    }
  ],

  "benefits": [
    {
      "benefit": "Full description of the benefit or entitlement",
      "party": "Who receives this",
      "conditions": "Any conditions attached",
      "source": "Exact reference"
    }
  ],

  "legal_restrictions": [
    {
      "restriction": "Exact restriction or prohibition",
      "duration": "How long it applies",
      "geographic_scope": "Where it applies, if mentioned",
      "source": "Exact reference"
    }
  ],

  "obligations": [
    {
      "party": "Who must do this",
      "obligation": "Exact obligation with full detail",
      "deadline": "By when, if stated",
      "consequence_of_breach": "What happens if violated",
      "source": "Exact reference"
    }
  ],

  "financial_info": [
    {
      "type": "Salary | Bonus | Stipend | Penalty | Fee | Reimbursement | Deduction | Equity | Other",
      "amount": "Exact amount with currency symbol",
      "frequency": "Monthly | Annual | One-time | etc.",
      "conditions": "Any conditions attached",
      "source": "Exact reference"
    }
  ],

  "action_items": [
    {
      "action": "Specific action the reader must take",
      "deadline": "By when, if stated",
      "priority": "urgent | normal | optional"
    }
  ],

  "warnings": [
    {
      "warning": "Important caution the reader must know",
      "severity": "high | medium | low",
      "source": "Exact reference"
    }
  ],

  "contacts": [
    {
      "name": "Name",
      "role": "Role/title",
      "organization": "Company/institution",
      "email": "",
      "phone": ""
    }
  ],

  "entities": {
    "organizations": ["All organisation names mentioned"],
    "locations": ["All locations/addresses mentioned"],
    "governing_law": "Jurisdiction, if mentioned",
    "document_date": "Date the document was issued/signed"
  },

  "red_flags": [
    {
      "flag": "Unusual, one-sided, or potentially harmful clause",
      "explanation": "Why this deserves attention",
      "source": "Exact reference"
    }
  ]
}
`.trim();

// ════════════════════════════════════════════════════════════════
// analyzeDocument — sends full document to Gemini, returns JSON
// ════════════════════════════════════════════════════════════════
export async function analyzeDocument(dataUrl, onProgress) {
  onProgress?.({ step: 1, label: 'Preparing document for AI...' });

  let docPart;
  try {
    docPart = dataUrlToPart(dataUrl);
  } catch (e) {
    throw new Error('Cannot read document format. Try re-uploading.');
  }

  onProgress?.({ step: 2, label: 'Resolving Gemini model...' });

  const { text, model } = await geminiPost(
    [{ parts: [docPart, { text: DEEP_ANALYSIS_PROMPT }] }],
    { temperature: 0.1, maxOutputTokens: 8192 }
  );

  onProgress?.({ step: 3, label: `Parsing analysis (via ${model})...` });

  const analysis = parseJSON(text);

  onProgress?.({ step: 4, label: 'Done!' });
  return { ...analysis, _model: model };
}

// ════════════════════════════════════════════════════════════════
// askQuestion — RAG-style Q&A using cached analysis as context
// ════════════════════════════════════════════════════════════════
export async function askQuestion(analysis, question, chatHistory) {
  const context = buildRetrievalContext(analysis, question);

  const systemTurn = {
    role: 'user',
    parts: [{
      text: `You are an expert document assistant. The following is a structured analysis of a "${analysis.document_type || 'document'}" that the user has uploaded. Use ONLY this analysis to answer questions. Never invent information.

DOCUMENT ANALYSIS:
${context}

ANSWERING RULES:
1. Be COMPREHENSIVE — give the complete answer, not a brief one.
2. ALWAYS end your response with: "📍 Source: [cite the exact section/clause/page from the source field]"
3. If multiple sections are relevant, cite all of them.
4. If information is not in the analysis, say exactly: "This information was not found in the document."
5. Use bullet points for lists of items.
6. For legal or financial information, reproduce the exact wording from the analysis.`
    }],
  };

  const assistantAck = {
    role: 'model',
    parts: [{ text: `Understood. I have reviewed the complete analysis of this ${analysis.document_type || 'document'}. I will answer comprehensively and cite sources from the analysis for every response. Please ask your questions.` }],
  };

  const historyTurns = chatHistory.flatMap((h) => [
    { role: 'user',  parts: [{ text: h.question }] },
    { role: 'model', parts: [{ text: h.answer   }] },
  ]);

  const contents = [
    systemTurn,
    assistantAck,
    ...historyTurns,
    { role: 'user', parts: [{ text: question }] },
  ];

  const { text } = await geminiPost(contents, { temperature: 0.2, maxOutputTokens: 4096 });
  return text;
}

// ── Build retrieval context from analysis ─────────────────────
function buildRetrievalContext(analysis, question) {
  const parts = [];
  parts.push(`DOCUMENT TYPE: ${analysis.document_type || 'Unknown'}`);
  parts.push(`ISSUED/DATED: ${analysis.entities?.document_date || 'Not specified'}`);
  parts.push(`\nEXECUTIVE SUMMARY:\n${analysis.executive_summary || 'Not available'}`);

  const include = (label, data) => {
    if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0))
      parts.push(`\n${label}:\n${JSON.stringify(data, null, 2)}`);
  };

  include('SECTION-WISE ANALYSIS', analysis.sections);
  include('KEY POINTS',            analysis.key_points);
  include('IMPORTANT DATES',       analysis.important_dates);
  include('FINANCIAL INFORMATION',  analysis.financial_info);
  include('RISKS',                  analysis.risks);
  include('LEGAL RESTRICTIONS',     analysis.legal_restrictions);
  include('OBLIGATIONS',            analysis.obligations);
  include('RESPONSIBILITIES',       analysis.responsibilities);
  include('BENEFITS',               analysis.benefits);
  include('IMPORTANT NUMBERS',      analysis.important_numbers);
  include('CONTACTS',               analysis.contacts);
  include('ACTION ITEMS',           analysis.action_items);
  include('WARNINGS',               analysis.warnings);
  include('RED FLAGS',              analysis.red_flags);
  include('ENTITIES',               analysis.entities);

  return parts.join('\n');
}

// ── Suggested questions per document type ─────────────────────
export function getSuggestedQuestions(documentType) {
  const type = (documentType || '').toLowerCase();
  const common = [
    'Summarise this document completely.',
    'What should I pay attention to before signing?',
    'What are all the important dates and deadlines?',
    'Are there any red flags or unusual clauses?',
    'Explain this document in simple language.',
    'What are my obligations under this document?',
  ];
  if (type.includes('offer') || type.includes('employment') || type.includes('contract')) {
    return [
      'What is the exact salary and compensation breakdown?',
      'What is the notice period and bond period?',
      'What are the IP and non-compete clauses?',
      'What happens if I resign before the bond period ends?',
      'What are the working hours and leave entitlements?',
      'What are the probation terms?',
      ...common,
    ];
  }
  if (type.includes('nda') || type.includes('non-disclos')) {
    return [
      'What information is considered confidential?',
      'What are the penalties for breach?',
      'How long does the NDA apply after employment ends?',
      'What is the geographic scope of the restrictions?',
      ...common,
    ];
  }
  if (type.includes('certificate') || type.includes('marksheet')) {
    return [
      'What institution issued this document?',
      'What is the validity period?',
      'What are the grades or scores mentioned?',
      'What credential ID or verification details are present?',
      ...common,
    ];
  }
  if (type.includes('research') || type.includes('technical')) {
    return [
      'What are the key findings or conclusions?',
      'What methodology was used?',
      'What are the limitations mentioned?',
      'What future work is suggested?',
      ...common,
    ];
  }
  return common;
}
