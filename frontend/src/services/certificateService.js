/**
 * Certificates service — facade over createUserStore.
 */

import { createUserStore } from '../api/storage/createUserStore';
import { STORAGE_KEYS } from '../api/storage/keys';
import { CERT_NO_EXPIRY, getExpiryStatus } from '../utils/expiry';

const store = createUserStore(STORAGE_KEYS.CERTIFICATES);

export const getCertificates = (userId) => store.getAll(userId);

export const addCertificate = (
  userId,
  { name, issuer, issuedDate, expiryDate, credentialId, credentialUrl, dataUrl, size },
) => {
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
  return store.insert(userId, newCert, { prepend: true });
};

export const updateCertificate = (userId, certId, updates) => {
  store.update(userId, certId, updates);
};

export const deleteCertificate = (userId, certId) => {
  store.remove(userId, certId);
};

/** Preserves prior certificate empty-expiry labeling. */
export const getCertExpiryStatus = (expiryDate) =>
  getExpiryStatus(expiryDate, { whenEmpty: CERT_NO_EXPIRY });

export const ISSUER_COLORS = {
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
