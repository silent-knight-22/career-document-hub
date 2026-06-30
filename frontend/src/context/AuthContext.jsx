import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentSession, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getCurrentSession();
    setUser(session);
    setLoading(false);
  }, []);

  const login = (session) => setUser(session);

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const updateSession = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSession, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
