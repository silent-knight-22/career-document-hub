/**
 * Shared expiry status for vault items and certificates.
 */

/**
 * @typedef {{ label: string, color: string, bg: string, days: number | null }} ExpiryStatus
 */

/**
 * @param {string | null | undefined} expiryDate
 * @param {{ whenEmpty?: ExpiryStatus | null }} [options]
 * @returns {ExpiryStatus | null}
 */
export function getExpiryStatus(expiryDate, { whenEmpty = null } = {}) {
  if (!expiryDate) return whenEmpty;

  const now = new Date();
  const exp = new Date(expiryDate);
  const days = Math.ceil((exp - now) / 86400000);

  if (days < 0) return { label: 'Expired', color: '#ef4444', bg: '#fee2e2', days };
  if (days <= 30) return { label: `${days}d left`, color: '#f59e0b', bg: '#fef3c7', days };
  if (days <= 90) return { label: `${days}d left`, color: '#3b82f6', bg: '#dbeafe', days };
  return { label: 'Valid', color: '#10b981', bg: '#d1fae5', days };
}

/** Certificate-friendly empty state (preserves prior getCertExpiryStatus behavior). */
export const CERT_NO_EXPIRY = {
  label: 'No Expiry',
  color: '#10b981',
  bg: '#d1fae5',
  days: null,
};
