import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/services/api';

interface User {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  role_id: number;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; display_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  isAdminOrManager: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getMe() as { success: boolean; user: User | null };
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password) as { success: boolean; user: User };
    if (data.success && data.user) {
      setUser(data.user);
    }
  };

  const register = async (regData: { username: string; email: string; password: string; display_name?: string }) => {
    const data = await api.register(regData) as { success: boolean; user: User };
    if (data.success && data.user) {
      setUser(data.user);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const isAdmin = user?.role_id === 1;
  const isManager = user?.role_id === 2;
  const isAdminOrManager = isAdmin || isManager;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAdmin, isManager, isAdminOrManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
