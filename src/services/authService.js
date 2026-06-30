// ============================================
// AUTH SERVICE — localStorage layer
// (Week 2: swap these calls for axios → Spring Boot)
// ============================================

const USERS_KEY = 'cdh_users';
const SESSION_KEY = 'cdh_session';

// ---- Helpers ----
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const setUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

// ---- Register ----
export const registerUser = ({ name, email, password }) => {
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) throw new Error('An account with this email already exists.');

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    password, // NOTE: plain text — Week 2 will use bcrypt + JWT
    avatar: null,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  setUsers(users);

  // Auto-login after register
  const session = { userId: newUser.id, name: newUser.name, email: newUser.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

// ---- Login ----
export const loginUser = ({ email, password, remember }) => {
  const users = getUsers();
  const user = users.find(
    (u) => u.email === email.toLowerCase() && u.password === password
  );
  if (!user) throw new Error('Invalid email or password.');

  const session = { userId: user.id, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  if (remember) {
    localStorage.setItem('cdh_remember', email.toLowerCase());
  } else {
    localStorage.removeItem('cdh_remember');
  }

  return session;
};

// ---- Logout ----
export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

// ---- Get current session ----
export const getCurrentSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

// ---- Get user profile ----
export const getUserProfile = (userId) => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
};

// ---- Update profile ----
export const updateUserProfile = (userId, updates) => {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('User not found.');
  users[idx] = { ...users[idx], ...updates };
  setUsers(users);

  // Update session name if name changed
  const session = getCurrentSession();
  if (session && updates.name) {
    const updatedSession = { ...session, name: updates.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
  }
  return getUserProfile(userId);
};

// ---- Delete account ----
export const deleteAccount = (userId) => {
  let users = getUsers();
  users = users.filter((u) => u.id !== userId);
  setUsers(users);
  logoutUser();
};

// ---- Get remembered email ----
export const getRememberedEmail = () => localStorage.getItem('cdh_remember') || '';
