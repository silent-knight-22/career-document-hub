/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import {
  getCurrentSession,
  logoutUser,
  validateSession,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentSession());
  const [loading] = useState(false);

  const login = useCallback((session) => {
    setUser(validateSession(session) || session);
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  const updateSession = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      // Never allow credentials into session state
      delete next.password;
      delete next.passwordHash;
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, updateSession, loading }),
    [user, login, logout, updateSession, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
