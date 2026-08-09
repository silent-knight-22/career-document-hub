/**
 * Sanitize user-controlled strings before persistence/display.
 * React already escapes JSX text; this blocks control chars / oversized payloads.
 */

// Strip C0 controls except TAB/LF/CR-equivalent already excluded by ranges
// eslint-disable-next-line no-control-regex -- intentional sanitization
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * @param {unknown} input
 * @param {{ maxLength?: number }} [options]
 * @returns {string}
 */
export function sanitizeText(input, { maxLength = 500 } = {}) {
  if (input == null) return '';
  return String(input)
    .replace(CONTROL_CHARS, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * @param {unknown} email
 * @returns {string}
 */
export function sanitizeEmail(email) {
  return sanitizeText(email, { maxLength: 254 }).toLowerCase();
}

/**
 * Strip HTML tags from untrusted markdown/text before download filenames etc.
 * @param {unknown} input
 * @returns {string}
 */
export function sanitizeFilename(input) {
  return sanitizeText(input, { maxLength: 80 })
    .replace(/[^\w\- ]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/^_+|_+$/g, '') || 'download';
}

/**
 * Allow only http(s) URLs for user-supplied links (blocks javascript:, data:, etc.).
 * @param {unknown} url
 * @returns {string} safe absolute URL or empty string
 */
export function sanitizeExternalUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withProto);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.href;
  } catch {
    return '';
  }
}
