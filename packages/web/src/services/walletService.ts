import { api } from '../lib/api';

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'payment' | 'refund' | 'bid_refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  balance: number;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_holder: string;
  qr_code_image: string | null;
}

export const walletService = {
  // Get user's wallet info
  async getWallet(): Promise<{ wallet: Wallet; transactions: WalletTransaction[] }> {
    return api('/api/wallet');
  },

  // Deposit money (fake top-up)
  async deposit(amount: number, paymentMethod = 'bank_transfer'): Promise<{
    success: boolean;
    message: string;
    transaction: WalletTransaction;
    wallet: Wallet;
  }> {
    return api('/api/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod }),
    });
  },

  // Withdraw money
  async withdraw(
    amount: number,
    bankAccount: { bankName: string; accountNumber: string; accountHolder: string }
  ): Promise<{
    success: boolean;
    message: string;
    transaction: WalletTransaction;
    wallet: Wallet;
  }> {
    return api('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, bankAccount }),
    });
  },

  // Pay for auction
  async pay(auctionId: string): Promise<{
    success: boolean;
    message: string;
    payment: {
      id: string;
      auctionId: string;
      amount: number;
      status: string;
    };
    wallet: Wallet;
  }> {
    return api('/api/wallet/pay', {
      method: 'POST',
      body: JSON.stringify({ auctionId }),
    });
  },

  // Get payment for specific auction
  async getPayment(auctionId: string): Promise<any> {
    return api(`/api/wallet/payments/${auctionId}`);
  },

  // Get available bank accounts for QR
  async getBanks(): Promise<BankAccount[]> {
    return api('/api/wallet/banks');
  },
};

// Admin wallet service
export const adminWalletService = {
  // Get all wallets
  async getWallets(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    wallets: any[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);

    const q = query.toString();
    return api(`/api/admin/wallet${q ? `?${q}` : ''}`);
  },

  // Get wallet details for specific user
  async getWalletDetails(userId: string): Promise<{
    user: any;
    wallet: Wallet;
    transactions: WalletTransaction[];
    payments: any[];
  }> {
    return api(`/api/admin/wallet/${userId}`);
  },

  // Add money to user wallet (admin)
  async addMoney(
    userId: string,
    amount: number,
    description?: string
  ): Promise<{
    success: boolean;
    message: string;
    transactionId: string;
    newBalance: number;
  }> {
    return api(`/api/admin/wallet/${userId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  },

  // Deduct money from user wallet (admin)
  async deductMoney(
    userId: string,
    amount: number,
    description?: string
  ): Promise<{
    success: boolean;
    message: string;
    transactionId: string;
    newBalance: number;
  }> {
    return api(`/api/admin/wallet/${userId}/deduct`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  },

  // Get wallet statistics
  async getStats(): Promise<{
    totalBalance: number;
    todayTransactions: { count: number; amount: number };
    typeStats: Array<{ type: string; count: number; total: number }>;
    topWallets: Array<{ userId: string; username: string; email: string; name: string; balance: number }>;
    recentTransactions: Array<{
      id: string;
      userId: string;
      username: string;
      amount: number;
      type: string;
      description: string;
      createdAt: string;
    }>;
  }> {
    return api('/api/admin/wallet/stats/overview');
  },
};
