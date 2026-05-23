import { useState, useCallback, useEffect } from 'react';
import type { User } from '../types/user';
import { authService, clearAuth, persistAuth, readStoredUser } from '../services/authService';
import { joinUser } from '../lib/socket';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    authService
      .me()
      .then((u) => {
        setUser(u);
        sessionStorage.setItem('user', JSON.stringify(u));
        // Join user's personal socket room for notifications
        joinUser(u.id);
      })
      .catch(() => {
        clearAuth();
        setUser(null);
      });
  }, []);

  useEffect(() => {
    const handleAuthUpdate = (e: CustomEvent<User>) => {
      setUser(e.detail);
      sessionStorage.setItem('user', JSON.stringify(e.detail));
    };
    window.addEventListener('auth-updated', handleAuthUpdate as EventListener);
    return () => window.removeEventListener('auth-updated', handleAuthUpdate as EventListener);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const { token, user: u } = await authService.login(credentials.email, credentials.password);
      persistAuth(token, u);
      setUser(u);
      // Join user's personal socket room for notifications
      joinUser(u.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      const { token, user: u } = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      persistAuth(token, u);
      setUser(u);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearAuth();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    const u = await authService.me();
    persistAuth(token, u);
    setUser(u);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  };
};
