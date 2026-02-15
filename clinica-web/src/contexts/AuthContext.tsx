import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../services/api';
import { AuthUser } from '../types';

type AuthContextData = {
  token?: string;
  user?: AuthUser;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);
const AUTH_STORAGE_KEY = 'clinica_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | undefined>();
  const [user, setUser] = useState<AuthUser | undefined>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.token) {
        setToken(parsed.token);
        setUser(parsed.user);
        setAuthToken(parsed.token);
      }
    } catch {
      // noop
    }
  }, []);

  async function login(email: string, password: string, remember = false) {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.accessToken);
    setUser(data.user);
    setAuthToken(data.accessToken);

    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: data.accessToken, user: data.user }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  function logout() {
    setToken(undefined);
    setUser(undefined);
    setAuthToken(undefined);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
