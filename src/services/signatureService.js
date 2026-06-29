// ============================================
// SIGNATURE SERVICE — localStorage layer
// (Week 2: swap for axios → Spring Boot REST APIs)
// ============================================

const getKey = (userId) => `signflow_signatures_${userId}`;

export const getSignatures = (userId) => {
  return JSON.parse(localStorage.getItem(getKey(userId)) || '[]');
};

const save = (userId, sigs) => {
  localStorage.setItem(getKey(userId), JSON.stringify(sigs));
};

export const saveSignature = (userId, { name, dataUrl, type }) => {
  const sigs = getSignatures(userId);
  const newSig = {
    id: crypto.randomUUID(),
    name: name || `Signature ${sigs.length + 1}`,
    dataUrl, // base64 image
    type,    // 'upload' | 'draw' | 'type'
    isDefault: sigs.length === 0,
    createdAt: new Date().toISOString(),
  };
  sigs.push(newSig);
  save(userId, sigs);
  return newSig;
};

export const deleteSignature = (userId, sigId) => {
  let sigs = getSignatures(userId);
  const wasDefault = sigs.find((s) => s.id === sigId)?.isDefault;
  sigs = sigs.filter((s) => s.id !== sigId);
  if (wasDefault && sigs.length > 0) sigs[0].isDefault = true;
  save(userId, sigs);
};

export const setDefaultSignature = (userId, sigId) => {
  const sigs = getSignatures(userId).map((s) => ({
    ...s,
    isDefault: s.id === sigId,
  }));
  save(userId, sigs);
};

export const renameSignature = (userId, sigId, newName) => {
  const sigs = getSignatures(userId).map((s) =>
    s.id === sigId ? { ...s, name: newName } : s
  );
  save(userId, sigs);
};

export const getDefaultSignature = (userId) => {
  return getSignatures(userId).find((s) => s.isDefault) || null;
};
