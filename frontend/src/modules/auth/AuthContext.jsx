import { createContext, useCallback, useContext, useState } from 'react';
import { useDbVersion } from '../../hooks/useDbVersion';
import * as authService from '../../services/authService';
import { getUserById } from '../../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(authService.getSessionUserId);
  useDbVersion(); // keeps `user` fresh after profile edits

  const user = userId ? getUserById(userId) : null;

  const startWith = useCallback((result) => {
    if (result.userId) setUserId(result.userId);
    return result;
  }, []);

  const signIn = useCallback((credentials) => startWith(authService.login(credentials)), [startWith]);
  const signInDemo = useCallback((email) => startWith(authService.loginAsDemo(email)), [startWith]);
  const signOut = useCallback(() => {
    authService.logout();
    setUserId(null);
  }, []);

  const value = { user: user?.activo ? user : null, signIn, signInDemo, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}