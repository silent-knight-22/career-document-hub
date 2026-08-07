/**
 * Browser-native password hashing (PBKDF2-SHA-256 via Web Crypto).
 * Not a substitute for server-side bcrypt/argon2, but far safer than plaintext
 * for this local-first Phase-1 store. Migrates legacy plaintext on next login.
 */

const PREFIX = 'pbkdf2';
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function toBase64(bytes) {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromBase64(str) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveBits(password, salt, iterations) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** @param {string} stored */
export function isHashedPassword(stored) {
  return typeof stored === 'string' && stored.startsWith(`${PREFIX}$`);
}

/** @param {string} password @returns {Promise<string>} */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveBits(password, salt, ITERATIONS);
  return `${PREFIX}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/**
 * @param {string} password
 * @param {string} stored — either pbkdf2$… or legacy plaintext
 * @returns {Promise<{ ok: boolean, needsUpgrade: boolean }>}
 */
export async function verifyPassword(password, stored) {
  if (!stored || typeof password !== 'string') {
    return { ok: false, needsUpgrade: false };
  }

  if (!isHashedPassword(stored)) {
    // Legacy plaintext accounts — upgrade on successful login
    return { ok: password === stored, needsUpgrade: password === stored };
  }

  const parts = stored.split('$');
  if (parts.length !== 4) return { ok: false, needsUpgrade: false };
  const iterations = Number(parts[1]);
  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);
  const actual = await deriveBits(password, salt, iterations);
  return { ok: timingSafeEqual(actual, expected), needsUpgrade: false };
}
