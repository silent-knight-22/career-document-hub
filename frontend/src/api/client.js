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

import { API_BASE_URL, NETWORK } from '../config/env';
import { ApiError, fetchWithRetry, getErrorMessage } from '../utils/fetchWithRetry';

export { API_BASE_URL, ApiError, getErrorMessage };

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
    localStorage.removeItem('cdh_token');
  } catch {
    /* ignore quota / privacy mode */
  }
}

/**
 * @param {string} path
 * @param {RequestInit & {
 *   timeoutMs?: number,
 *   retries?: number,
 *   parseJson?: boolean,
 * }} [options]
 * @returns {Promise<Response | unknown>}
 */
export async function apiRequest(path, options = {}) {
  if (typeof path !== 'string' || !path.startsWith('/')) {
    throw new ApiError('API path must be a string starting with "/"');
  }

  const {
    timeoutMs = NETWORK.timeoutMs,
    retries = NETWORK.maxRetries,
    parseJson = false,
    headers: initHeaders,
    ...rest
  } = options;

  const headers = new Headers(initHeaders || {});
  if (!headers.has('Content-Type') && !(rest.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const method = (rest.method || 'GET').toUpperCase();
  // Only retry safe/idempotent methods by default
  const effectiveRetries = method === 'GET' || method === 'HEAD' ? retries : 0;

  const response = await fetchWithRetry(`${API_BASE_URL}${path}`, {
    ...rest,
    method,
    headers,
    credentials: 'same-origin',
    timeoutMs,
    retries: effectiveRetries,
  });

  if (response.status === 401) {
    clearAccessToken();
  }

  if (!response.ok) {
    let body;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    const message =
      body?.message ||
      body?.error?.message ||
      `Request failed (${response.status})`;
    throw new ApiError(message, { status: response.status, body });
  }

  if (parseJson) {
    if (response.status === 204) return null;
    return response.json();
  }

  return response;
}
