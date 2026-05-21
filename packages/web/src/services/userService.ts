import { api } from '../lib/api';
import { parseUser } from '../lib/normalize';
import type { User } from '../types/user';

export const userService = {
  async getUsers(search?: string): Promise<User[]> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    const rows = await api<Record<string, unknown>[]>(`/api/admin/users${q}`);
    return rows.map(parseUser);
  },

  async toggleUserStatus(id: string): Promise<User> {
    const row = await api<Record<string, unknown>>(
      `/api/admin/users/${encodeURIComponent(id)}/status`,
      { method: 'PATCH' }
    );
    return parseUser(row);
  },
};
