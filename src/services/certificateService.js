// ============================================
// CERTIFICATE SERVICE — localStorage layer
// ============================================

const getKey = (userId) => `cdh_certs_${userId}`;

export const getCertificates = (userId) =>
  JSON.parse(localStorage.getItem(getKey(userId)) || '[]');

const save = (userId, certs) =>
  localStorage.setItem(getKey(userId), JSON.stringify(certs));

export const addCertificate = (userId, { name, issuer, issuedDate, expiryDate, credentialId, credentialUrl, dataUrl, size }) => {
  const certs = getCertificates(userId);
  const newCert = {
    id: crypto.randomUUID(),
    name,
    issuer,
    issuedDate,
    expiryDate: expiryDate || null,
    credentialId: credentialId || '',
    credentialUrl: credentialUrl || '',
    dataUrl: dataUrl || null,
    size: size || 0,
    createdAt: new Date().toISOString(),
  };
  certs.unshift(newCert);
  save(userId, certs);
  return newCert;
};

export const updateCertificate = (userId, certId, updates) => {
  const certs = getCertificates(userId).map((c) =>
    c.id === certId ? { ...c, ...updates } : c
  );
  save(userId, certs);
};

export const deleteCertificate = (userId, certId) => {
  const certs = getCertificates(userId).filter((c) => c.id !== certId);
  save(userId, certs);
};

// Get expiry status (reuses same logic as vault)
export const getCertExpiryStatus = (expiryDate) => {
  if (!expiryDate) return { label: 'No Expiry', color: '#10b981', bg: '#d1fae5', days: null };
  const now = new Date();
  const exp = new Date(expiryDate);
  const days = Math.ceil((exp - now) / 86400000);
  if (days < 0)   return { label: 'Expired',      color: '#ef4444', bg: '#fee2e2', days };
  if (days <= 30) return { label: `${days}d left`, color: '#f59e0b', bg: '#fef3c7', days };
  if (days <= 90) return { label: `${days}d left`, color: '#3b82f6', bg: '#dbeafe', days };
  return { label: 'Valid',         color: '#10b981', bg: '#d1fae5', days };
};

// Known issuers for color coding
export const ISSUER_COLORS = {
  'Google':      '#4285f4',
  'AWS':         '#ff9900',
  'Microsoft':   '#00a4ef',
  'Meta':        '#1877f2',
  'Coursera':    '#0056d2',
  'Udemy':       '#a435f0',
  'NPTEL':       '#ee3124',
  'LinkedIn':    '#0a66c2',
  'GitHub':      '#24292e',
  'IBM':         '#052fad',
  'Oracle':      '#f80000',
};

export const getIssuerColor = (issuer) => {
  for (const [key, color] of Object.entries(ISSUER_COLORS)) {
    if (issuer?.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return '#6366f1';
};
