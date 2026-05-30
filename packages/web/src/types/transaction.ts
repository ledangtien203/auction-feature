export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  auctionId: string;
  auctionTitle: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

export type TransactionStatus = 'pending' | 'completed' | 'cancelled';
