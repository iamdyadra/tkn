// AuthContext — mengelola autentikasi dengan role sales/admin
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSales: boolean;
  role: User['role'] | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (data: { nama: string; email: string; password: string; telepon: string; wilayah?: string }) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('tkn_v4_auth_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const found = await authApi.login(email, password);
    if (found) {
      setUser(found);
      localStorage.setItem('tkn_v4_auth_user', JSON.stringify(found));
    }
    return found;
  };

  const register = async (data: { nama: string; email: string; password: string; telepon: string; wilayah?: string }): Promise<boolean> => {
    try {
      const newUser = await authApi.register(data);
      setUser(newUser);
      localStorage.setItem('tkn_v4_auth_user', JSON.stringify(newUser));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tkn_v4_auth_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isSales: user?.role === 'sales',
      role: user?.role ?? null,
      login,
      register,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
}
