import { api } from '../lib/api';
import { parseUser } from '../lib/normalize';
import type { User } from '../types/user';

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api<{ token: string; user: Record<string, unknown> }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { token: res.token, user: parseUser(res.user) };
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const res = await api<{ token: string; user: Record<string, unknown> }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { token: res.token, user: parseUser(res.user) };
  },

  async me(): Promise<User> {
    const res = await api<{ user: Record<string, unknown> }>('/api/auth/me');
    return parseUser(res.user);
  },

  async updateProfile(data: {
    name?: string;
    phone?: string;
    avatar?: string;
    password?: string;
  }): Promise<User> {
    const res = await api<{ user: Record<string, unknown> }>('/api/auth/update-profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return parseUser(res.user);
  },
};

export function persistAuth(token: string, user: User) {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

export function readStoredUser(): User | null {
  const raw = sessionStorage.getItem('user');
  if (!raw) return null;
  try {
    return parseUser(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return null;
  }
}
