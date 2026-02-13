import { createContext, useContext, useMemo, useState } from 'react';
import { api, setAuthToken } from '../services/api';
import { AuthUser } from '../types';

type AuthContextData = {
  token?: string;
  user?: AuthUser;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | undefined>();
  const [user, setUser] = useState<AuthUser | undefined>();

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.accessToken);
    setUser(data.user);
    setAuthToken(data.accessToken);
  }

  function logout() {
    setToken(undefined);
    setUser(undefined);
    setAuthToken(undefined);
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
