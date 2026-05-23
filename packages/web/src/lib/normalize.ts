import type { Auction, Bid } from '../types/auction';
import type { User } from '../types/user';
import type { Transaction } from '../types/transaction';

export function parseAuction(raw: Record<string, unknown>): Auction {
  const base = {
    id: String(raw.id),
    productId: Number(raw.productId ?? raw.product_id ?? 0),
    sellerId: Number(raw.sellerId ?? raw.seller_id ?? 0),
    winnerId: raw.winnerId != null ? Number(raw.winnerId ?? raw.winner_id) : null,
    startPrice: Number(raw.startPrice ?? raw.start_price ?? 0),
    currentPrice: Number(raw.currentPrice ?? raw.current_price ?? 0),
    bidIncrement: Number(raw.bidIncrement ?? raw.bid_increment ?? 0),
    startTime: String(raw.startTime ?? raw.start_time ?? ''),
    endTime: String(raw.endTime ?? raw.end_time ?? ''),
    durationMinutes: Number(raw.durationMinutes ?? raw.duration_minutes ?? 15),
    statusId: Number(raw.statusId ?? raw.status_id ?? 1),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    // product join
    productName: raw.productName as string | null ?? raw.product_name as string | null ?? null,
    productTitle: raw.productTitle as string | null ?? raw.product_title as string | null ?? null,
    productDescription: raw.productDescription as string | null ?? raw.product_description as string | null ?? null,
    productImage: raw.productImage as string | null ?? raw.product_image as string | null ?? null,
    productCategoryId: raw.productCategoryId != null ? Number(raw.productCategoryId ?? raw.category_id) : null,
    productCategoryName: raw.productCategoryName as string | null ?? raw.category_name as string | null ?? null,
    sellerName: raw.sellerName as string | null ?? raw.seller_name as string | null ?? null,
    // alias
    title: String(raw.productTitle ?? raw.product_title ?? raw.title ?? raw.id),
    description: String(raw.productDescription ?? raw.product_description ?? raw.description ?? ''),
    image: String(raw.productImage ?? raw.product_image ?? raw.image ?? ''),
    category: String(raw.productCategoryName ?? raw.category_name ?? raw.category ?? ''),
    currentBid: Number(raw.currentPrice ?? raw.current_price ?? raw.currentBid ?? raw.current_bid ?? 0),
    minIncrement: Number(raw.bidIncrement ?? raw.bid_increment ?? raw.minIncrement ?? raw.min_increment ?? 0),
    startingBid: Number(raw.startPrice ?? raw.start_price ?? raw.startingBid ?? raw.starting_bid ?? 0),
    totalBids: Number(raw.totalBids ?? raw.total_bids ?? 0) || 0,
    endTimeRaw: String(raw.endTime ?? raw.end_time ?? ''),
    status: Number(raw.statusId ?? raw.status_id ?? raw.status ?? 1),
    seller: raw.sellerName as string | null ?? raw.seller_name as string | null ?? raw.seller as string | null ?? null,
    sellerIdMap: Number(raw.sellerId ?? raw.seller_id ?? 0),
  };

  // winningBid from won auctions endpoint
  if (raw.winningBid && typeof raw.winningBid === 'object') {
    const wb = raw.winningBid as Record<string, unknown>;
    return {
      ...base,
      winningBid: {
        id: String(wb.id ?? wb.bid_id ?? wb.history_id ?? ''),
        auctionId: String(wb.auction_id ?? wb.auctionId ?? ''),
        userId: String(wb.user_id ?? wb.userId ?? ''),
        userName: wb.user_name as string | null ?? wb.username as string | null ?? null,
        bidAmount: Number(wb.bid_amount ?? wb.bidAmount ?? wb.amount ?? 0),
        bidTime: String(wb.bid_time ?? wb.bidTime ?? wb.created_at ?? wb.timestamp ?? ''),
        createdAt: String(wb.created_at ?? wb.bid_time ?? wb.bidTime ?? ''),
      },
    } as Auction & { winningBid: NonNullable<Auction['winningBid']> };
  }

  return base as Auction;
}

export function parseUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw.id),
    username: String(raw.username ?? ''),
    email: String(raw.email ?? ''),
    name: raw.name as string | null ?? null,
    phone: raw.phone as string | null ?? null,
    avatar: raw.avatar as string | null ?? null,
    address: raw.address as string | null ?? null,
    birthday: raw.birthday as string | null ?? null,
    roleId: String(raw.roleId ?? raw.role_id ?? 'user'),
    isVerified: Boolean(raw.isVerified ?? raw.is_verified),
    isBlocked: Boolean(raw.isBlocked ?? raw.is_blocked),
    balance: Number(raw.balance ?? 0),
    rating: Number(raw.rating ?? 5.0),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    // join
    roleName: raw.roleName as string | null ?? raw.role_name as string | null ?? null,
    // mapped
    role: String(raw.roleId ?? raw.role_id ?? 'user'),
    status: (raw.isBlocked || raw.is_blocked) ? 'blocked' : 'active',
    joinDate: String(raw.joinDate ?? raw.join_date ?? raw.createdAt ?? raw.created_at ?? ''),
    totalBids: Number(raw.totalBids ?? raw.total_bids ?? 0) || 0,
    totalSpent: Number(raw.totalSpent ?? raw.total_spent ?? 0),
  };
}

export function parseTransaction(raw: Record<string, unknown>): Transaction {
  return {
    id: String(raw.id),
    userId: String(raw.userId ?? raw.user_id ?? ''),
    userName: raw.userName as string | null ?? raw.user_name as string | null ?? null,
    auctionId: raw.auctionId != null ? String(raw.auctionId ?? raw.auction_id) : null,
    auctionTitle: raw.auctionTitle as string | null ?? raw.auction_title as string | null ?? null,
    amount: Number(raw.amount ?? 0),
    type: raw.type as Transaction['type'],
    status: raw.status as Transaction['status'],
    timestamp: String(raw.timestamp ?? raw.created_at ?? ''),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
  };
}

export function parseBid(raw: Record<string, unknown>): Bid {
  return {
    id: String(raw.id ?? ''),
    auctionId: String(raw.auctionId ?? raw.auction_id ?? ''),
    userId: String(raw.userId ?? raw.user_id ?? ''),
    userName: raw.userName as string | undefined ?? raw.user_name as string | undefined,
    bidAmount: Number(raw.bidAmount ?? raw.bid_amount ?? raw.amount ?? 0),
    bidTime: String(raw.bidTime ?? raw.bid_time ?? raw.timestamp ?? raw.created_at ?? ''),
    auctionTitle: raw.auctionTitle as string | null ?? raw.auction_title as string | null ?? null,
    // alias
    amount: Number(raw.bidAmount ?? raw.bid_amount ?? raw.amount ?? 0),
    timestamp: String(raw.bidTime ?? raw.bid_time ?? raw.timestamp ?? raw.created_at ?? ''),
    isWinning: Boolean(raw.isWinning ?? raw.is_winning),
  };
}
