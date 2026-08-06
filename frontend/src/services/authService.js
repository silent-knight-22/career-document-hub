/**
 * Auth service — localStorage layer (JWT cutover via api/client later).
 */

import { clearUserLocalData, STORAGE_KEYS } from '../api/storage/keys';
import { readJson, writeJson, safeJsonParse } from '../utils/jsonStorage';
import { getDocuments } from './documentService';
import { getVaultItems } from './vaultService';

const getUsers = () => readJson(STORAGE_KEYS.USERS, []);
const setUsers = (users) => writeJson(STORAGE_KEYS.USERS, users);

export const registerUser = ({ name, email, password }) => {
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) throw new Error('An account with this email already exists.');

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    password, // NOTE: plain text — backend will use bcrypt + JWT
    avatar: null,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  setUsers(users);

  const session = { userId: newUser.id, name: newUser.name, email: newUser.email };
  writeJson(STORAGE_KEYS.SESSION, session);
  return session;
};

export const loginUser = ({ email, password, remember }) => {
  const users = getUsers();
  const user = users.find(
    (u) => u.email === email.toLowerCase() && u.password === password,
  );
  if (!user) throw new Error('Invalid email or password.');

  const session = { userId: user.id, name: user.name, email: user.email };
  writeJson(STORAGE_KEYS.SESSION, session);

  if (remember) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER, email.toLowerCase());
  } else {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  }

  return session;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

export const getCurrentSession = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  return raw ? safeJsonParse(raw, null) : null;
};

export const getUserProfile = (userId) => {
  const user = getUsers().find((u) => u.id === userId);
  if (!user) return null;
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
};

export const updateUserProfile = (userId, updates) => {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('User not found.');
  users[idx] = { ...users[idx], ...updates };
  setUsers(users);

  const session = getCurrentSession();
  if (session && updates.name) {
    writeJson(STORAGE_KEYS.SESSION, { ...session, name: updates.name });
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
