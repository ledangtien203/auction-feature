import { api } from '../lib/api';
import { parseTransaction, parseAuction } from '../lib/normalize';
import type { Transaction } from '../types/transaction';
import type { Auction } from '../types/auction';

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    const rows = await api<Record<string, unknown>[]>('/api/admin/transactions');
    return rows.map(parseTransaction);
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
  recentTransactions: Record<string, unknown>[];
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
    recentTransactions: Transaction[];
  }> {
    const raw = await api<DashboardPayload>('/api/admin/dashboard');
    return {
      ...raw,
      recentAuctions: raw.recentAuctions.map(parseAuction),
      recentTransactions: raw.recentTransactions.map(parseTransaction),
    };
  },
};
