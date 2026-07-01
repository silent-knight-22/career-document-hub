// ============================================================
// GROQ SERVICE — AI Document Intelligence
// Architecture: OpenAI-compatible REST API, client-side PDF 
// text extraction, and Llama-3.2 vision support for images.
// ============================================================

import { pdfjs } from 'react-pdf';

const API_BASE    = 'https://api.groq.com/openai/v1';
const KEY_STORAGE = 'cdh_groq_api_key';
const ANA_PREFIX  = 'cdh_analysis_';
const CHAT_PREFIX = 'cdh_chat_';

const MODEL_PREFERENCE = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama-3.2-11b-vision-preview',
];

const SESSION_MODEL_KEY = 'cdh_groq_resolved_model';

function getSessionModel()       { return sessionStorage.getItem(SESSION_MODEL_KEY) || null; }
function setSessionModel(name)   { sessionStorage.setItem(SESSION_MODEL_KEY, name); }
function clearSessionModel()     { sessionStorage.removeItem(SESSION_MODEL_KEY); }

// ── Manual model selection helpers ───────────────────────────
const SELECTED_MODEL_KEY = 'cdh_groq_selected_model';
const AVAILABLE_MODELS_KEY = 'cdh_groq_available_models';

export const getSelectedModel = () => localStorage.getItem(SELECTED_MODEL_KEY) || '';
export const setSelectedModel = (model) => {
  if (model) {
    localStorage.setItem(SELECTED_MODEL_KEY, model);
  } else {
    localStorage.removeItem(SELECTED_MODEL_KEY);
  }
  clearSessionModel();
};

export const getAvailableModels = () => {
  try {
    return JSON.parse(localStorage.getItem(AVAILABLE_MODELS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const setAvailableModels = (models) => {
  localStorage.setItem(AVAILABLE_MODELS_KEY, JSON.stringify(models));
};

// Pre-fill with a default key if desired (e.g. gsk_...)
// If set, this key will act as a fallback so users do not have to provide their own.
const DEFAULT_API_KEY = "";

// ── API Key helpers ───────────────────────────────────────────
export const getApiKey   = ()  => localStorage.getItem(KEY_STORAGE) || DEFAULT_API_KEY || '';
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

// ── Client-side PDF text extractor ───────────────────────────
async function extractTextFromPdf(dataUrl) {
  try {
    const base64 = dataUrl.split(',')[1];
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const loadingTask = pdfjs.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += `\n--- Page ${i} ---\n${pageText}\n`;
    }
    
    return fullText;
  } catch (err) {
    console.error('[Groq] PDF text extraction failed:', err);
    throw new Error('Failed to extract text from PDF file. Make sure it is not password-protected.');
  }
}

// ════════════════════════════════════════════════════════════════
// listModels — queries Groq Console models endpoint
// ════════════════════════════════════════════════════════════════
async function listModels(key) {
  const url = `${API_BASE}/models`;
  console.info('[Groq] listModels →', url);

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${key}`
    }
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(body?.error?.message || `listModels failed: HTTP ${res.status}`),
      { status: res.status, body }
    );
  }

  const json = await res.json();
  const models = json.data || [];
  const filtered = models
    .map(m => m.id)
    .filter(id => id.includes('llama') || id.includes('mixtral') || id.includes('gemma'));

  console.info('[Groq] generate-capable models:', filtered.join(', ') || '(none)');
  return filtered;
}

// ════════════════════════════════════════════════════════════════
// resolveModel — returns the best available model for this key.
// ════════════════════════════════════════════════════════════════
async function resolveModel(key) {
  const selected = getSelectedModel();
  if (selected) {
    console.info('[Groq] Using manually selected model:', selected);
    return selected;
  }

  const cached = getSessionModel();
  if (cached) {
    console.info('[Groq] Using cached resolved model:', cached);
    return cached;
  }

  const available = await listModels(key);
  setAvailableModels(available);

  if (available.length === 0) {
    throw new Error('Your API key has no access to any Groq generative models.');
  }

  // Pick highest-preference model
  for (const preferred of MODEL_PREFERENCE) {
    const match = available.find(
      m => m === preferred || m.startsWith(preferred + '-') || m.startsWith(preferred + '.')
    );
    if (match) {
      console.info('[Groq] Resolved model:', match);
      setSessionModel(match);
      return match;
    }
  }

  const fallback = available[0];
  console.info('[Groq] Resolved model (fallback):', fallback);
  setSessionModel(fallback);
  return fallback;
}

// ════════════════════════════════════════════════════════════════
// groqPost — central request function (OpenAI spec)
function modelSupportsJsonMode(model) {
  const lower = model.toLowerCase();
  if (lower.includes('vision') || lower.includes('scout') || lower.includes('preview')) {
    return false;
  }
  return true;
}

// ════════════════════════════════════════════════════════════════
// groqPost — central request function (OpenAI spec)
// ════════════════════════════════════════════════════════════════
async function groqPost(messages, config = {}) {
  const key = getApiKey();
  if (!key) throw new Error('NO_API_KEY');

  const model = config.model || await resolveModel(key);
  const url   = `${API_BASE}/chat/completions`;

  console.info('[Groq] POST chat/completions using:', model);

  const bodyPayload = {
    model,
    messages,
    temperature: config.temperature ?? 0.1,
    max_tokens: config.maxTokens ?? 4096,
  };

  // Enable JSON mode if requested and supported
  if (config.responseFormatJson && modelSupportsJsonMode(model)) {
    bodyPayload.response_format = { type: 'json_object' };
  }

  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg  = body?.error?.message || '';
    const code = body?.error?.code   || res.status;

    if (res.status === 404 || msg.toLowerCase().includes('model not found')) {
      console.warn('[Groq] Model not found, clearing session model cache');
      clearSessionModel();
      throw new Error(`Model "${model}" is not available for this Groq API key.`);
    }
    if (res.status === 401) throw new Error('Invalid Groq API key. Please check your credentials.');
    if (res.status === 403) throw new Error(`Access Denied: ${msg}`);
    if (res.status === 429) {
      throw new Error(`Groq Rate limit / Quota exceeded: ${msg || 'Too many requests. Please wait a moment.'}`);
    }
    if (res.status === 400 && (
      msg.toLowerCase().includes('request too large') || 
      msg.toLowerCase().includes('tpm') || 
      msg.toLowerCase().includes('token limit') || 
      msg.toLowerCase().includes('context length')
    )) {
      throw new Error('This document is too large to analyze. Please choose a smaller or shorter document to proceed.');
    }
    if (res.status >= 500) throw new Error(`Groq server error (${code}). Try again in a moment.`);
    throw new Error(msg || `API error: HTTP ${res.status}`);
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq. Please retry.');
  return { text, model };
}

// ── Parse JSON safely (with trailing-comma auto-repair) ────────
function parseJSON(raw) {
  let clean = raw
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
  
  // Remove trailing commas before closing braces/brackets (common LLM syntax error)
  clean = clean.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(clean);
  } catch (err) {
    const m = clean.match(/\{[\s\S]+\}/);
    if (m) {
      try {
        const nested = m[0].replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(nested);
      } catch {}
    }
    throw new Error(
      `JSON Parse Error: ${err.message}. To resolve this, change your preferred model ` +
      `to "llama-3.3-70b-versatile" or "Auto-detect" to enforce native JSON Mode.`
    );
  }
}

// ════════════════════════════════════════════════════════════════
// verifyApiKey
// ════════════════════════════════════════════════════════════════
export async function verifyApiKey(key) {
  if (!key?.trim()) return { ok: false, error: 'Please enter your API key.' };

  try {
    const available = await listModels(key.trim());

    if (available.length === 0) {
      return {
        ok: false,
        error: 'Your API key is valid but no Groq generative models are accessible.',
      };
    }

    setAvailableModels(available);

    setSessionModel(null);
    sessionStorage.removeItem(SESSION_MODEL_KEY);

    let bestModel = available[0];
    for (const p of MODEL_PREFERENCE) {
      const m = available.find(a => a === p || a.startsWith(p + '-') || a.startsWith(p + '.'));
      if (m) { bestModel = m; break; }
    }
    setSessionModel(bestModel);

    console.info('[Groq] Key verified ✓  Best model:', bestModel);
    return { ok: true, model: bestModel, allModels: available };

  } catch (err) {
    console.error('[Groq] verifyApiKey error:', err.message);
    if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
      return { ok: false, error: 'Invalid Groq API key. Please check your credentials.' };
    }
    return { ok: false, error: err.message || 'Failed to verify key.' };
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
// analyzeDocument — sends extracted text or image payload to Groq
// ════════════════════════════════════════════════════════════════
export async function analyzeDocument(dataUrl, onProgress) {
  const isPdf = dataUrl.startsWith('data:application/pdf');
  
  let docText = '';
  if (isPdf) {
    onProgress?.({ step: 1, label: 'Extracting text from PDF client-side...' });
    docText = await extractTextFromPdf(dataUrl);
    
    // Local size pre-check (Safe free tier limit: 36,000 characters)
    const maxChars = 36000;
    if (docText.length > maxChars) {
      throw new Error('This document is too large to analyze. Please select a shorter document or a smaller file (recommended maximum length: 30,000 characters).');
    }
  } else {
    onProgress?.({ step: 1, label: 'Preparing image for analysis...' });
  }

  onProgress?.({ step: 2, label: 'Resolving Groq model...' });

  const key = getApiKey();
  let resolvedModel;
  if (!isPdf) {
    const selected = getSelectedModel();
    if (selected && (selected.includes('vision') || selected.includes('scout'))) {
      resolvedModel = selected;
    } else {
      const available = getAvailableModels();
      const activeVisionModel = available.find(
        m => m.includes('vision') || m.includes('scout')
      );
      resolvedModel = activeVisionModel || 'meta-llama/llama-4-scout-17b-16e-instruct';
    }
    console.info('[Groq] Visual document analysis resolved to:', resolvedModel);
  } else {
    resolvedModel = getSelectedModel() || await resolveModel(key);
  }

  onProgress?.({ step: 3, label: `Analyzing document (via Groq ${resolvedModel})...` });

  let messages = [];
  if (isPdf) {
    messages = [
      {
        role: 'system',
        content: 'You are an expert document analyst. You must analyze the document text and output a complete structured analysis in JSON format.'
      },
      {
        role: 'user',
        content: `${DEEP_ANALYSIS_PROMPT}\n\nHere is the text extracted from the document:\n${docText}`
      }
    ];
  } else {
    messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are an expert document analyst. Analyze this document image and return a complete structured analysis in JSON format following this exact specification:\n\n${DEEP_ANALYSIS_PROMPT}`
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl
            }
          }
        ]
      }
    ];
  }

  const { text, model } = await groqPost(messages, {
    model: resolvedModel,
    temperature: 0.1,
    maxTokens: 4096, // Groq output limit
    responseFormatJson: true
  });

  onProgress?.({ step: 4, label: 'Parsing analysis...' });
  const analysis = parseJSON(text);

  return { ...analysis, _model: model };
}

// ════════════════════════════════════════════════════════════════
// askQuestion — RAG-style Q&A using cached analysis as context
// ════════════════════════════════════════════════════════════════
export async function askQuestion(analysis, question, chatHistory) {
  const context = buildRetrievalContext(analysis, question);

  const systemTurn = {
    role: 'system',
    content: `You are an expert document assistant. The following is a structured analysis of a "${analysis.document_type || 'document'}" that the user has uploaded. Use ONLY this analysis to answer questions. Never invent information.

DOCUMENT ANALYSIS:
${context}

ANSWERING RULES:
1. Be COMPREHENSIVE — give the complete answer, not a brief one.
2. ALWAYS end your response with: "📍 Source: [cite the exact section/clause/page from the source field]"
3. If multiple sections are relevant, cite all of them.
4. If information is not in the analysis, say exactly: "This information was not found in the document."
5. Use bullet points for lists of items.
6. For legal or financial information, reproduce the exact wording from the analysis.
7. OUT-OF-CONTEXT RULE: If the user asks a question that is completely unrelated to the uploaded document, career documents, or the analysis context provided (such as asking for recipes, coding help, advice on unrelated hobbies, weather, or jokes), do NOT answer it. Instead, respond with a witty, funny, or slightly sarcastic reply in a friendly, helpful AI persona, reminding them that you are a Career Document Assistant and they should stick to the document. Be creative and generate a different funny response each time. Do NOT include the "📍 Source" citation for out-of-context questions.`
  };

  const historyTurns = chatHistory.flatMap((h) => [
    { role: 'user',      content: h.question },
    { role: 'assistant', content: h.answer   }
  ]);

  const messages = [
    systemTurn,
    ...historyTurns,
    { role: 'user', content: question },
  ];

  const key = getApiKey();
  const model = getSelectedModel() || await resolveModel(key);

  const { text } = await groqPost(messages, { model, temperature: 0.2, maxTokens: 2048 });
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
