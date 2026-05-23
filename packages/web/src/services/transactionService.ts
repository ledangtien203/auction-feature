import { api } from '../lib/api';
import { parseTransaction, parseAuction } from '../lib/normalize';
import type { Transaction } from '../types/transaction';
import type { Auction } from '../types/auction';

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    const rows = await api<Record<string, unknown>[]>('/api/admin/transactions');
    return rows.map(parseTransaction);
  },

  async getWonAuctions(): Promise<any[]> {
    const rows = await api<any[]>('/api/bids/won');
    return rows;
  },

  async updateTransactionStatus(
    id: string,
    status: 'completed' | 'cancelled'
  ): Promise<Transaction> {
    const row = await api<Record<string, unknown>>(
      `/api/admin/transactions/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: JSON.stringify({ status }) }
    );
    return parseTransaction(row);
  },
};

export interface DashboardPayload {
  totalRevenue: number;
  activeAuctions: number;
  totalUsers: number;
  pendingTransactions: number;
  revenueGrowth: number;
  userGrowth: number;
  auctionGrowth: number;
  recentAuctions: Record<string, unknown>[];
  newUsers: Record<string, unknown>[];
}

export const adminDashboardService = {
  async getDashboard(): Promise<{
    totalRevenue: number;
    activeAuctions: number;
    totalUsers: number;
    pendingTransactions: number;
    revenueGrowth: number;
    userGrowth: number;
    auctionGrowth: number;
    recentAuctions: Auction[];
    newUsers: Array<{
      id: string;
      username: string;
      email: string;
      name: string | null;
      createdAt: string;
      isVerified: boolean;
      rating: number;
    }>;
  }> {
    const raw = await api<DashboardPayload>('/api/admin/dashboard');
    return {
      ...raw,
      recentAuctions: raw.recentAuctions.map(parseAuction),
      newUsers: raw.newUsers as any,
    };
  },

  async getRevenueChart(): Promise<Array<{ month: string; revenue: number; auctions: number }>> {
    return api('/api/admin/dashboard/charts/revenue');
  },

  async getCategoriesChart(): Promise<Array<{ name: string; value: number; color: string }>> {
    return api('/api/admin/dashboard/charts/categories');
  },

  async getActivityChart(): Promise<Array<{ hour: string; bids: number }>> {
    return api('/api/admin/dashboard/charts/activity');
  },
};
