/**
 * Safe JSON helpers for localStorage.
 * Prevents corrupt values from crashing the app.
 */

/**
 * @template T
 * @param {string | null} raw
 * @param {T} fallback
 * @returns {T}
 */
export function safeJsonParse(raw, fallback) {
  if (raw == null || raw === '') return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function readJson(key, fallback) {
  return safeJsonParse(localStorage.getItem(key), fallback);
}

/**
 * @param {string} key
 * @param {unknown} value
 */
export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      throw new Error('Storage full. Please delete some items and try again.', { cause: err });
    }
    throw err;
  }
}
