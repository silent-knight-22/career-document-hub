/**
 * Document Vault service — facade over createUserStore.
 * Public API preserved for existing pages/components.
 */

import { createUserStore } from '../api/storage/createUserStore';
import { STORAGE_KEYS } from '../api/storage/keys';
import { getExpiryStatus as computeExpiryStatus } from '../utils/expiry';

const store = createUserStore(STORAGE_KEYS.VAULT);

export const VAULT_CATEGORIES = [
  { id: 'personal', label: 'Personal ID', color: '#6366f1', emoji: '🪪' },
  { id: 'academic', label: 'Academic', color: '#3b82f6', emoji: '🎓' },
  { id: 'professional', label: 'Professional', color: '#10b981', emoji: '💼' },
  { id: 'financial', label: 'Financial', color: '#f59e0b', emoji: '💰' },
  { id: 'medical', label: 'Medical', color: '#ef4444', emoji: '🏥' },
  { id: 'other', label: 'Other', color: '#8b5cf6', emoji: '📁' },
];

export const getCategoryById = (id) =>
  VAULT_CATEGORIES.find((c) => c.id === id) || VAULT_CATEGORIES[5];

export const getVaultItems = (userId) => store.getAll(userId);

export const addVaultItem = (userId, { name, dataUrl, type, size, category, tags, note, expiryDate }) => {
  const newItem = {
    id: crypto.randomUUID(),
    name,
    dataUrl,
    type,
    size,
    category: category || 'other',
    tags: tags || [],
    note: note || '',
    expiryDate: expiryDate || null,
    starred: false,
    createdAt: new Date().toISOString(),
  };
  return store.insert(userId, newItem, { prepend: true });
};

export const updateVaultItem = (userId, itemId, updates) => {
  store.update(userId, itemId, updates);
};

export const deleteVaultItem = (userId, itemId) => {
  store.remove(userId, itemId);
};

export const toggleStar = (userId, itemId) => {
  store.mapAll(userId, (item) =>
    item.id === itemId ? { ...item, starred: !item.starred } : item,
  );
};

export const getExpiringItems = (userId, daysAhead = 90) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 86400000);
  return getVaultItems(userId)
    .filter((i) => {
      if (!i.expiryDate) return false;
      return new Date(i.expiryDate) <= cutoff;
    })
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
};

/** Re-export shared helper (null when no date). */
export const getExpiryStatus = (expiryDate) => computeExpiryStatus(expiryDate);
