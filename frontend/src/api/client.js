/**
 * API client boundary for the future Spring Boot cutover.
 *
 * Today the app uses localStorage adapters via services.
 * When axios lands, keep this module as the single place for:
 * - base URL
 * - Authorization header
 * - 401 handling
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const TOKEN_KEY = 'cdh_token';

/** @returns {string | null} */
export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** @param {string} token */
export function setAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Placeholder fetch wrapper — unused until backend is wired.
 * Services should migrate here instead of calling axios ad hoc.
 *
 * @param {string} path
 * @param {RequestInit} [options]
 */
export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAccessToken();
  }

  return response;
}
