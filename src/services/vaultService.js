// ============================================
// DOCUMENT VAULT SERVICE — localStorage layer
// (Week 2: swap for axios → Spring Boot)
// ============================================

const getKey = (userId) => `cdh_vault_${userId}`;

export const VAULT_CATEGORIES = [
  { id: 'personal',     label: 'Personal ID',   color: '#6366f1', emoji: '🪪' },
  { id: 'academic',     label: 'Academic',       color: '#3b82f6', emoji: '🎓' },
  { id: 'professional', label: 'Professional',   color: '#10b981', emoji: '💼' },
  { id: 'financial',    label: 'Financial',      color: '#f59e0b', emoji: '💰' },
  { id: 'medical',      label: 'Medical',        color: '#ef4444', emoji: '🏥' },
  { id: 'other',        label: 'Other',          color: '#8b5cf6', emoji: '📁' },
];

export const getCategoryById = (id) =>
  VAULT_CATEGORIES.find((c) => c.id === id) || VAULT_CATEGORIES[5];

export const getVaultItems = (userId) =>
  JSON.parse(localStorage.getItem(getKey(userId)) || '[]');

const save = (userId, items) =>
  localStorage.setItem(getKey(userId), JSON.stringify(items));

export const addVaultItem = (userId, { name, dataUrl, type, size, category, tags, note, expiryDate }) => {
  const items = getVaultItems(userId);
  const newItem = {
    id: crypto.randomUUID(),
    name,
    dataUrl,
    type,   // 'pdf' | 'image'
    size,
    category: category || 'other',
    tags: tags || [],
    note: note || '',
    expiryDate: expiryDate || null,
    starred: false,
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem); // newest first
  save(userId, items);
  return newItem;
};

export const updateVaultItem = (userId, itemId, updates) => {
  const items = getVaultItems(userId).map((i) =>
    i.id === itemId ? { ...i, ...updates } : i
  );
  save(userId, items);
};

export const deleteVaultItem = (userId, itemId) => {
  const items = getVaultItems(userId).filter((i) => i.id !== itemId);
  save(userId, items);
};

export const toggleStar = (userId, itemId) => {
  const items = getVaultItems(userId).map((i) =>
    i.id === itemId ? { ...i, starred: !i.starred } : i
  );
  save(userId, items);
};

export const getExpiringItems = (userId, daysAhead = 90) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 86400000);
  return getVaultItems(userId).filter((i) => {
    if (!i.expiryDate) return false;
    const exp = new Date(i.expiryDate);
    return exp <= cutoff;
  }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
};

export const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  const exp = new Date(expiryDate);
  const days = Math.ceil((exp - now) / 86400000);
  if (days < 0)  return { label: 'Expired',     color: '#ef4444', bg: '#fee2e2', days };
  if (days <= 30) return { label: `${days}d left`, color: '#f59e0b', bg: '#fef3c7', days };
  if (days <= 90) return { label: `${days}d left`, color: '#3b82f6', bg: '#dbeafe', days };
  return { label: 'Valid',        color: '#10b981', bg: '#d1fae5', days };
};
