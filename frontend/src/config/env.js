/**
 * Central runtime configuration.
 * Only VITE_* keys are available in the browser bundle — never put secrets here.
 */

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const isProd = import.meta.env.PROD;
const isDev = import.meta.env.DEV;

/** App display name for titles / SEO */
export const APP_NAME = 'Career Document Hub';

/**
 * Backend API base. In production, prefer an explicit VITE_API_URL.
 * Falls back to localhost only for local development.
 */
export const API_BASE_URL =
  rawApiUrl || (isDev ? 'http://localhost:8080/api/v1' : '/api/v1');

/** Network defaults shared by api client + Groq fetch helper */
export const NETWORK = {
  /** Default request timeout (ms) */
  timeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS) || 30_000,
  /** Max retries for idempotent / retryable failures */
  maxRetries: Number(import.meta.env.VITE_REQUEST_RETRIES) || 2,
  /** Base delay for exponential backoff (ms) */
  retryBaseMs: 400,
};

export const FEATURES = {
  /** Client-side Groq is demo-only; production should proxy via backend */
  clientSideAi: import.meta.env.VITE_CLIENT_SIDE_AI !== 'false',
};

/** Warn once in production if API URL was not configured. */
export function assertProductionConfig() {
  if (!isProd) return;
  if (!rawApiUrl) {
    // eslint-disable-next-line no-console
    console.warn(
      `[${APP_NAME}] VITE_API_URL is not set. API calls will use relative "/api/v1". ` +
        'Configure it for your deployment or proxy /api to the Spring Boot service.',
    );
  }
}

export const ENV = { isProd, isDev, mode: import.meta.env.MODE };
