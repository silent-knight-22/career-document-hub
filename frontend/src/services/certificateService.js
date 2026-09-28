/**
 * Certificates service — Spring Boot API when VITE_API_URL is set,
 * otherwise Phase 1 localStorage demo via createUserStore.
 */

import { apiRequest } from '../api/client';
import { createUserStore } from '../api/storage/createUserStore';
import { STORAGE_KEYS } from '../api/storage/keys';
import { isRemoteApiEnabled } from '../config/env';
import { CERT_NO_EXPIRY, getExpiryStatus } from '../utils/expiry';
import { sanitizeFilename } from '../utils/sanitize';

const store = createUserStore(STORAGE_KEYS.CERTIFICATES);

/** Map API certificate metadata to the shape used by CertCard / Expiry. */
function mapApiCertificate(c) {
  const size = Number(c?.size) || 0;
  const type = c?.type ?? null;
  return {
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    issuedDate: c.issuedDate || '',
    expiryDate: c.expiryDate ?? null,
    credentialId: c.credentialId || '',
    credentialUrl: c.credentialUrl || '',
    size,
    type,
    /** API never returns dataUrl; file is fetched via downloadCertificateFile. */
    dataUrl: null,
    hasFile: Boolean(type) && size > 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function appendOptional(form, key, value) {
  if (value == null) return;
  const s = String(value).trim();
  if (!s) return;
  form.append(key, s);
}

/**
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getCertificates(userId) {
  if (isRemoteApiEnabled) {
    const body = await apiRequest('/certificates', { parseJson: true });
    return (body?.data || []).map(mapApiCertificate);
  }
  return store.getAll(userId);
}

/**
 * @param {string} userId
 * @param {{
 *   name: string,
 *   issuer: string,
 *   issuedDate?: string,
 *   expiryDate?: string,
 *   credentialId?: string,
 *   credentialUrl?: string,
 *   dataUrl?: string | null,
 *   size?: number,
 *   file?: File | Blob | null,
 *   type?: string,
 * }} payload
 */
export async function addCertificate(userId, payload) {
  const {
    name,
    issuer,
    issuedDate = '',
    expiryDate = '',
    credentialId = '',
    credentialUrl = '',
    dataUrl = null,
    size = 0,
    file = null,
    type = null,
  } = payload || {};

  if (isRemoteApiEnabled) {
    const form = new FormData();
    form.append('name', name);
    form.append('issuer', issuer);
    appendOptional(form, 'issuedDate', issuedDate);
    appendOptional(form, 'expiryDate', expiryDate);
    appendOptional(form, 'credentialId', credentialId);
    appendOptional(form, 'credentialUrl', credentialUrl);
    if (file) {
      form.append('file', file, file.name || 'certificate');
    }
    const body = await apiRequest('/certificates', {
      method: 'POST',
      body: form,
      parseJson: true,
    });
    return mapApiCertificate(body.data);
  }

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
    type: type || null,
    hasFile: Boolean(dataUrl),
    createdAt: new Date().toISOString(),
  };
  return store.insert(userId, newCert, { prepend: true });
}

/**
 * @param {string} userId
 * @param {string} certId
 */
export async function deleteCertificate(userId, certId) {
  if (isRemoteApiEnabled) {
    await apiRequest(`/certificates/${encodeURIComponent(certId)}`, {
      method: 'DELETE',
    });
    return;
  }
  store.remove(userId, certId);
}

/**
 * Narrow PATCH for Expiry Tracker: set or clear expiryDate.
 * @param {string} userId
 * @param {string} certId
 * @param {{ expiryDate?: string | null, clearExpiryDate?: boolean }} patch
 */
export async function updateCertificateExpiry(userId, certId, patch = {}) {
  if (isRemoteApiEnabled) {
    const body = await apiRequest(`/certificates/${encodeURIComponent(certId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        expiryDate: patch.expiryDate ?? undefined,
        clearExpiryDate: patch.clearExpiryDate ?? undefined,
      }),
      parseJson: true,
    });
    return mapApiCertificate(body.data);
  }

  const clear = Boolean(patch.clearExpiryDate) || patch.expiryDate === null;
  store.update(userId, certId, {
    expiryDate: clear ? null : patch.expiryDate,
  });
  return store.getById(userId, certId);
}

/**
 * Download certificate file (API blob or local dataUrl).
 * @param {{ id: string, name?: string, dataUrl?: string | null, hasFile?: boolean }} cert
 */
export async function downloadCertificateFile(cert) {
  if (!cert) throw new Error('Certificate required');

  if (cert.dataUrl) {
    if (!String(cert.dataUrl).startsWith('data:')) {
      throw new Error('Invalid file data.');
    }
    const a = document.createElement('a');
    a.href = cert.dataUrl;
    a.download = sanitizeFilename(cert.name) || 'certificate';
    a.click();
    return;
  }

  if (!isRemoteApiEnabled) {
    throw new Error('No file attached');
  }

  const response = await apiRequest(`/certificates/${encodeURIComponent(cert.id)}/file`, {
    headers: { Accept: '*/*' },
  });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFilename(cert.name) || 'certificate';
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Preserves prior certificate empty-expiry labeling. */
export const getCertExpiryStatus = (expiryDate) =>
  getExpiryStatus(expiryDate, { whenEmpty: CERT_NO_EXPIRY });

const ISSUER_COLORS = {
  Google: '#4285f4',
  AWS: '#ff9900',
  Microsoft: '#00a4ef',
  Meta: '#1877f2',
  Coursera: '#0056d2',
  Udemy: '#a435f0',
  NPTEL: '#ee3124',
  LinkedIn: '#0a66c2',
  GitHub: '#24292e',
  IBM: '#052fad',
  Oracle: '#f80000',
};

export const getIssuerColor = (issuer) => {
  for (const [key, color] of Object.entries(ISSUER_COLORS)) {
    if (issuer?.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return '#6366f1';
};
