import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true on mount to restore session

  // ── Restore session from localStorage token ──────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('lms_token'))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password, role });
      localStorage.setItem('lms_token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message;
      console.error('Login error:', message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('lms_token', data.token);
      setUser(data.user);
      return true;
    } catch (err: any) {
      console.error('Register error:', err.response?.data?.message || err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('lms_token');
    setUser(null);
  }, []);

  // ── Update user locally (and optionally sync to API) ─────────────────────
  const updateUser = useCallback(async (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
    if (user?.id) {
      try {
        await api.patch(`/users/${user.id}`, updates);
      } catch (err) {
        console.error('Failed to sync user update:', err);
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
