/**
 * Shared fetch helpers — timeout, abort, retry with exponential backoff.
 */

import { NETWORK } from '../config/env';
import { logger } from './logger';

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, code?: string, body?: unknown, cause?: unknown }} [meta]
   */
  constructor(message, { status, code, body, cause } = {}) {
    super(message, cause != null ? { cause } : undefined);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

/**
 * @param {number} status
 * @returns {boolean}
 */
export function isRetryableStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

/**
 * @param {unknown} err
 * @returns {boolean}
 */
export function isAbortError(err) {
  return (
    err?.name === 'AbortError' ||
    err?.code === 'ABORT_ERR' ||
    (typeof DOMException !== 'undefined' && err instanceof DOMException && err.name === 'AbortError')
  );
}

/**
 * Merge caller signal with an internal timeout.
 * @param {AbortSignal | undefined} external
 * @param {number} timeoutMs
 * @returns {{ signal: AbortSignal, cleanup: () => void }}
 */
export function createTimeoutSignal(external, timeoutMs) {
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort(external?.reason);
  if (external) {
    if (external.aborted) controller.abort(external.reason);
    else external.addEventListener('abort', onExternalAbort, { once: true });
  }
  const timer = setTimeout(() => {
    controller.abort(new DOMException(`Request timed out after ${timeoutMs}ms`, 'AbortError'));
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      if (external) external.removeEventListener('abort', onExternalAbort);
    },
  };
}

/**
 * fetch with timeout + exponential backoff on network / 429 / 5xx.
 *
 * @param {string} url
 * @param {RequestInit & {
 *   timeoutMs?: number,
 *   retries?: number,
 *   retryBaseMs?: number,
 *   retryOn?: (res: Response) => boolean,
 * }} [options]
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options = {}) {
  const {
    timeoutMs = NETWORK.timeoutMs,
    retries = NETWORK.maxRetries,
    retryBaseMs = NETWORK.retryBaseMs,
    retryOn = (res) => isRetryableStatus(res.status),
    signal: externalSignal,
    ...fetchInit
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const { signal, cleanup } = createTimeoutSignal(externalSignal, timeoutMs);
    try {
      const response = await fetch(url, { ...fetchInit, signal });
      cleanup();

      if (!response.ok && retryOn(response) && attempt < retries) {
        const delay = retryBaseMs * 2 ** attempt;
        logger.warn(`[fetch] HTTP ${response.status} — retry ${attempt + 1}/${retries} in ${delay}ms`, url);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      return response;
    } catch (err) {
      cleanup();
      lastError = err;
      if (isAbortError(err)) throw err;
      if (attempt >= retries) break;
      const delay = retryBaseMs * 2 ** attempt;
      logger.warn(`[fetch] network error — retry ${attempt + 1}/${retries} in ${delay}ms`, err?.message || err);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new ApiError('Network request failed', { cause: lastError });
}

/**
 * User-facing message from unknown thrown values.
 * @param {unknown} err
 * @param {string} [fallback]
 */
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (isAbortError(err)) return 'Request was cancelled.';
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
