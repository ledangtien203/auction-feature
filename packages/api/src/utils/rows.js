export function mapAuctionRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    image: row.image,
    category: row.category,
    currentBid: Number(row.current_bid),
    minIncrement: Number(row.min_increment),
    startingBid: Number(row.starting_bid),
    totalBids: Number(row.total_bids),
    endTime: row.end_time instanceof Date ? row.end_time.toISOString() : row.end_time,
    status: row.status,
    seller: row.seller,
  };
}

export function mapUserRow(row, extras = {}) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    joinDate: row.join_date instanceof Date ? row.join_date.toISOString() : row.join_date,
    totalBids: Number(extras.total_bids ?? row.total_bids ?? 0),
    totalSpent: Number(extras.total_spent ?? row.total_spent ?? 0),
  };
}

export function mapTransactionRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    auctionId: String(row.auction_id),
    auctionTitle: row.auction_title,
    userId: String(row.user_id),
    userName: row.user_name,
    amount: Number(row.amount),
    timestamp: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    status: row.status,
  };
}

export function mapBidRow(row) {
  return {
    id: String(row.id),
    auctionId: String(row.auction_id),
    auctionTitle: row.auction_title,
    amount: Number(row.amount),
    timestamp: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    isWinning: Boolean(row.is_winning),
  };
}
