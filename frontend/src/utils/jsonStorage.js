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

/** Approximate localStorage usage for the Profile quota meter. */
export function getLocalStorageUsage() {
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    totalBytes += ((key?.length || 0) + (value?.length || 0)) * 2;
  }
  const usedMb = totalBytes / (1024 * 1024);
  const limitMb = 5.0;
  const percent = Math.min((usedMb / limitMb) * 100, 100);
  return {
    usedMb: parseFloat(usedMb.toFixed(2)),
    limitMb,
    percent: parseFloat(percent.toFixed(1)),
  };
}
