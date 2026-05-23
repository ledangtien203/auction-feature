export interface Transaction {
  id: string;
  userId: string;
  userName: string | null;
  auctionId: string | null;
  auctionTitle: string | null;
  amount: number;
  type: 'deposit' | 'withdraw' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  createdAt: string;
}

export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type TransactionType = 'deposit' | 'withdraw' | 'payment' | 'refund';
