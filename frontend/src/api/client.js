/**
 * API client boundary for the future Spring Boot cutover.
 *
 * Security notes (when backend ships):
 * - Prefer short-lived access tokens in memory + httpOnly refresh cookies.
 * - sessionStorage is used here as a safer stopgap than localStorage (cleared on tab close).
 * - CSRF: Bearer tokens in Authorization headers are not sent automatically by the browser,
 *   so classic cookie CSRF does not apply. If you switch to cookie sessions, require
 *   SameSite=Strict/Lax cookies and a double-submit or synchronizer CSRF token on mutating requests.
 * - Never put secrets in VITE_* env vars that ship to the client bundle.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const TOKEN_KEY = 'cdh_access_token';

/** @returns {string | null} */
export function getAccessToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** @param {string} token */
export function setAccessToken(token) {
  if (!token || typeof token !== 'string') return;
  sessionStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearAccessToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    // Migrate away from any legacy localStorage token
    localStorage.removeItem('cdh_token');
  } catch {
    /* ignore quota / privacy mode */
  }
}

/**
 * Placeholder fetch wrapper — unused until backend is wired.
 * Services should migrate here instead of calling fetch/axios ad hoc.
 *
 * @param {string} path
 * @param {RequestInit} [options]
 */
export async function apiRequest(path, options = {}) {
  if (typeof path !== 'string' || !path.startsWith('/')) {
    throw new Error('API path must be a string starting with "/"');
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  if (response.status === 401) {
    clearAccessToken();
  }

  return response;
}
