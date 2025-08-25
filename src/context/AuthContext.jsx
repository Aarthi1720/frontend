// src/context/AuthContext.jsx
import { createContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/axios';

export const AuthContext = createContext({
  user: null,
  ready: false,
  setUser: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Hydrate immediately from localStorage (fast UI)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) {
      // api interceptor will attach it too; this is just immediate
      // no need to set headers here
    }
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === 'object') setUser(parsed);
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Verify with backend (authoritative)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setReady(true);
      return;
    }

    (async () => {
      try {
        const res = await api.get('/users/me');

        // Safety checks: ensure we got a user object, not HTML
        const contentType = res.headers?.['content-type'] || '';
        const data = res.data;

        const looksJson = contentType.includes('application/json');
        const looksUser =
          data && typeof data === 'object' && ('role' in data) && ('email' in data);

        if (!looksJson || !looksUser) {
          // Corrupted or wrong response; treat as logout
          throw new Error('Invalid /users/me response');
        }

        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const value = useMemo(() => ({ user, setUser, ready }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
