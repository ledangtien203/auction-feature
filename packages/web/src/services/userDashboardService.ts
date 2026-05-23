import { api } from '../lib/api';
import type { Auction } from '../types/auction';

export interface UserQuickStats {
  activeBids: number;
  wonAuctions: number;
  myAuctions: number;
  pendingPayments: number;
  watchedAuctions: number;
}

export const userDashboardService = {
  async getStats(): Promise<UserQuickStats> {
    return api<UserQuickStats>('/api/user-dashboard/stats');
  },

  async getTransactions(): Promise<any[]> {
    const data = await api<{ transactions: any[] }>('/api/user-dashboard/transactions');
    return data.transactions || [];
  },
};
