/**
 * Central runtime configuration.
 * Only VITE_* keys are available in the browser bundle — never put secrets here.
 */

import { logger } from '../utils/logger';

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
  rawApiUrl || (isDev ? 'http://localhost:8084/api/v1' : '/api/v1');

/**
 * True only when VITE_API_URL is explicitly set.
 * Certificates (and future modules) use this to call Spring Boot instead of localStorage.
 */
export const isRemoteApiEnabled = Boolean(rawApiUrl);

/** Network defaults shared by api client + Groq fetch helper */
export const NETWORK = {
  /** Default request timeout (ms) */
  timeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS) || 30_000,
  /** Max retries for idempotent / retryable failures */
  maxRetries: Number(import.meta.env.VITE_REQUEST_RETRIES) || 2,
  /** Base delay for exponential backoff (ms) */
  retryBaseMs: 400,
};

/**
 * Phase 1 (Vercel static / localStorage): empty VITE_API_URL is intentional —
 * modules use isRemoteApiEnabled and stay on localStorage. Log once as info.
 * When a remote Spring API is hosted elsewhere, set VITE_API_URL in the host env.
 */
export function assertProductionConfig() {
  if (!isProd) return;
  if (!rawApiUrl) {
    logger.info(
      `[${APP_NAME}] VITE_API_URL is unset — Phase 1 localStorage mode ` +
        '(no remote API). Set VITE_API_URL when Spring Boot is hosted elsewhere.',
    );
  }
}