import type { Auction, Bid } from '../types/auction';
import type { User } from '../types/user';
import type { Transaction } from '../types/transaction';

export function parseAuction(raw: Record<string, unknown>): Auction {
  return {
    id: String(raw.id),
    title: String(raw.title),
    description: String(raw.description),
    image: String(raw.image),
    category: String(raw.category),
    currentBid: Number(raw.currentBid),
    minIncrement: Number(raw.minIncrement),
    startingBid: Number(raw.startingBid),
    totalBids: Number(raw.totalBids),
    endTime: new Date(raw.endTime as string),
    status: raw.status as Auction['status'],
    seller: String(raw.seller),
  };
}

export function parseUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw.id),
    name: String(raw.name),
    email: String(raw.email),
    role: raw.role as User['role'],
    status: raw.status as User['status'],
    joinDate: new Date(raw.joinDate as string),
    totalBids: Number(raw.totalBids ?? 0),
    totalSpent: Number(raw.totalSpent ?? 0),
    phone: raw.phone as string | undefined,
    avatar: raw.avatar as string | undefined,
  };
}

export function parseTransaction(raw: Record<string, unknown>): Transaction {
  return {
    id: String(raw.id),
    auctionId: String(raw.auctionId),
    auctionTitle: String(raw.auctionTitle),
    userId: String(raw.userId),
    userName: String(raw.userName),
    amount: Number(raw.amount),
    timestamp: new Date(raw.timestamp as string),
    status: raw.status as Transaction['status'],
  };
}

export function parseBid(raw: Record<string, unknown>): Bid {
  return {
    id: String(raw.id),
    auctionId: String(raw.auctionId),
    auctionTitle: String(raw.auctionTitle),
    amount: Number(raw.amount),
    timestamp: new Date(raw.timestamp as string),
    isWinning: Boolean(raw.isWinning),
  };
}
