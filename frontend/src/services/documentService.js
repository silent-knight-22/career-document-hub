/**
 * Signable documents service — facade over createUserStore.
 */

import { createUserStore } from '../api/storage/createUserStore';
import { STORAGE_KEYS } from '../api/storage/keys';

const store = createUserStore(STORAGE_KEYS.DOCUMENTS);

export const getDocuments = (userId) => store.getAll(userId);

export const saveDocument = (userId, { name, dataUrl, type, size }) => {
  const newDoc = {
    id: crypto.randomUUID(),
    name,
    dataUrl,
    type,
    size,
    signed: false,
    signedDataUrl: null,
    createdAt: new Date().toISOString(),
    signedAt: null,
  };
  return store.insert(userId, newDoc);
};

export const getDocumentById = (userId, docId) => store.getById(userId, docId);

export const saveSignedDocument = (userId, docId, signedDataUrl) => {
  store.update(userId, docId, {
    signed: true,
    signedDataUrl,
    signedAt: new Date().toISOString(),
  });
};

export const deleteDocument = (userId, docId) => {
  store.remove(userId, docId);
};

export const getDocumentStats = (userIdOrDocs) => {
  const docs = Array.isArray(userIdOrDocs) ? userIdOrDocs : getDocuments(userIdOrDocs);
  let signed = 0;
  for (const d of docs) {
    if (d.signed) signed += 1;
  }
  return {
    total: docs.length,
    signed,
    unsigned: docs.length - signed,
  };
};
