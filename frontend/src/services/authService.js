/**
 * Auth service — localStorage + PBKDF2 password hashes.
 * Session never contains credentials. JWT/httpOnly cookies come with backend.
 */

import { clearUserLocalData, STORAGE_KEYS } from '../api/storage/keys';
import { readJson, writeJson, safeJsonParse } from '../utils/jsonStorage';
import { hashPassword, verifyPassword } from '../utils/passwordCrypto';
import { sanitizeEmail, sanitizeText } from '../utils/sanitize';
import { getDocuments } from './documentService';
import { getVaultItems } from './vaultService';

const getUsers = () => readJson(STORAGE_KEYS.USERS, []);
const setUsers = (users) => writeJson(STORAGE_KEYS.USERS, users);

const PROFILE_ALLOWED = new Set(['name', 'avatar', 'themePreference']);

function toSession(user) {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
  };
}

/** Re-check session against the user directory (blocks forged localStorage sessions). */
export function validateSession(session) {
  if (!session?.userId) return null;
  const user = getUsers().find((u) => u.id === session.userId);
  if (!user) return null;
  return toSession(user);
}

export async function registerUser({ name, email, password }) {
  const cleanEmail = sanitizeEmail(email);
  const cleanName = sanitizeText(name, { maxLength: 80 });
  if (!cleanName || !cleanEmail || !password) {
    throw new Error('Name, email, and password are required.');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  const users = getUsers();
  if (users.some((u) => u.email === cleanEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    id: crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    avatar: null,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  setUsers(users);

  const session = toSession(newUser);
  writeJson(STORAGE_KEYS.SESSION, session);
  return session;
}

export async function loginUser({ email, password, remember }) {
  const cleanEmail = sanitizeEmail(email);
  const users = getUsers();
  const user = users.find((u) => u.email === cleanEmail);
  if (!user) throw new Error('Invalid email or password.');

  const stored = user.passwordHash || user.password;
  const { ok, needsUpgrade } = await verifyPassword(password, stored);
  if (!ok) throw new Error('Invalid email or password.');

  if (needsUpgrade || user.password) {
    const idx = users.findIndex((u) => u.id === user.id);
    users[idx] = {
      ...users[idx],
      passwordHash: await hashPassword(password),
    };
    delete users[idx].password;
    setUsers(users);
  }

  const session = toSession(user);
  writeJson(STORAGE_KEYS.SESSION, session);

  if (remember) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER, cleanEmail);
  } else {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  }

  return session;
}

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

export const getCurrentSession = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  const parsed = raw ? safeJsonParse(raw, null) : null;
  return validateSession(parsed);
};

export const getUserProfile = (userId) => {
  const user = getUsers().find((u) => u.id === userId);
  if (!user) return null;
  const { password, passwordHash, ...safeUser } = user;
  return safeUser;
};

export const updateUserProfile = (userId, updates = {}) => {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('User not found.');

  const safeUpdates = {};
  Object.keys(updates).forEach((key) => {
    if (!PROFILE_ALLOWED.has(key)) return;
    if (key === 'name') safeUpdates.name = sanitizeText(updates.name, { maxLength: 80 });
    else safeUpdates[key] = updates[key];
  });

  users[idx] = { ...users[idx], ...safeUpdates };
  setUsers(users);

  const session = getCurrentSession();
  if (session && safeUpdates.name) {
    writeJson(STORAGE_KEYS.SESSION, { ...session, name: safeUpdates.name });
  }
  return getUserProfile(userId);
};

export const deleteAccount = (userId) => {
  const docIds = [
    ...getDocuments(userId).map((d) => d.id),
    ...getVaultItems(userId).map((d) => d.id),
  ];

  clearUserLocalData(userId, { documentIds: docIds });
  setUsers(getUsers().filter((u) => u.id !== userId));
  logoutUser();
};

export const getRememberedEmail = () => localStorage.getItem(STORAGE_KEYS.REMEMBER) || '';
