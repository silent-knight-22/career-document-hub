/**
 * Signatures service — facade over createUserStore.
 */

import { createUserStore } from '../api/storage/createUserStore';
import { STORAGE_KEYS } from '../api/storage/keys';

const store = createUserStore(STORAGE_KEYS.SIGNATURES);

export const getSignatures = (userId) => store.getAll(userId);

export const saveSignature = (userId, { name, dataUrl, type }) => {
  const sigs = getSignatures(userId);
  const newSig = {
    id: crypto.randomUUID(),
    name: name || `Signature ${sigs.length + 1}`,
    dataUrl,
    type,
    isDefault: sigs.length === 0,
    createdAt: new Date().toISOString(),
  };
  return store.insert(userId, newSig);
};

export const deleteSignature = (userId, sigId) => {
  let sigs = getSignatures(userId);
  const wasDefault = sigs.find((s) => s.id === sigId)?.isDefault;
  sigs = sigs.filter((s) => s.id !== sigId);
  if (wasDefault && sigs.length > 0) sigs[0] = { ...sigs[0], isDefault: true };
  store.setAll(userId, sigs);
};

export const setDefaultSignature = (userId, sigId) => {
  store.mapAll(userId, (s) => ({
    ...s,
    isDefault: s.id === sigId,
  }));
};
