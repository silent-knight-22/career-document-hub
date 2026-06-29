// ============================================
// DOCUMENT SERVICE — localStorage layer
// (Week 2: swap for axios → Spring Boot REST APIs)
// ============================================

const getKey = (userId) => `signflow_documents_${userId}`;

export const getDocuments = (userId) => {
  return JSON.parse(localStorage.getItem(getKey(userId)) || '[]');
};

const save = (userId, docs) => {
  localStorage.setItem(getKey(userId), JSON.stringify(docs));
};

export const saveDocument = (userId, { name, dataUrl, type, size }) => {
  const docs = getDocuments(userId);
  const newDoc = {
    id: crypto.randomUUID(),
    name,
    dataUrl,   // base64
    type,      // 'pdf' | 'image'
    size,      // bytes
    signed: false,
    signedDataUrl: null,
    createdAt: new Date().toISOString(),
    signedAt: null,
  };
  docs.push(newDoc);
  save(userId, docs);
  return newDoc;
};

export const getDocumentById = (userId, docId) => {
  return getDocuments(userId).find((d) => d.id === docId) || null;
};

export const saveSignedDocument = (userId, docId, signedDataUrl) => {
  const docs = getDocuments(userId).map((d) =>
    d.id === docId
      ? { ...d, signed: true, signedDataUrl, signedAt: new Date().toISOString() }
      : d
  );
  save(userId, docs);
};

export const deleteDocument = (userId, docId) => {
  const docs = getDocuments(userId).filter((d) => d.id !== docId);
  save(userId, docs);
};

export const getDocumentStats = (userId) => {
  const docs = getDocuments(userId);
  return {
    total: docs.length,
    signed: docs.filter((d) => d.signed).length,
    unsigned: docs.filter((d) => !d.signed).length,
  };
};
