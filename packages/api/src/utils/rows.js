export function mapAuctionRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    productId: Number(row.product_id),
    sellerId: Number(row.seller_id),
    winnerId: row.winner_id != null ? Number(row.winner_id) : null,
    startPrice: Number(row.start_price),
    currentPrice: Number(row.current_price),
    bidIncrement: Number(row.bid_increment),
    startTime: row.start_time instanceof Date ? row.start_time.toISOString() : row.start_time,
    endTime: row.end_time instanceof Date ? row.end_time.toISOString() : row.end_time,
    durationMinutes: Number(row.duration_minutes),
    statusId: Number(row.status_id),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    // join with product
    productName: row.product_name || null,
    productTitle: row.product_title || null,
    productDescription: row.product_description || null,
    productImage: row.product_image || null,
    productCategoryId: row.category_id != null ? Number(row.category_id) : null,
    productCategoryName: row.category_name || null,
    // computed / alias fields used by frontend
    title: row.product_title || row.product_name || `Đấu giá #${row.id}`,
    description: row.product_description || '',
    image: row.product_image || '',
    category: row.category_name || '',
    currentBid: Number(row.current_price),
    minIncrement: Number(row.bid_increment),
    startingBid: Number(row.start_price),
    totalBids: Number(row.total_bids || 0),
    endTimeRaw: row.end_time,
    status: row.status_id,
    seller: row.seller_name || null,
    sellerId: Number(row.seller_id),
  };
}

export function mapUserRow(row, extras = {}) {
  if (!row) return null;
  return {
    id: String(row.id),
    username: row.username,
    email: row.email,
    name: row.name || null,
    phone: row.phone || null,
    avatar: row.avatar || null,
    address: row.address || null,
    birthday: row.birthday || null,
    roleId: row.role_id || 'user',
    isVerified: Boolean(row.is_verified),
    isBlocked: Boolean(row.is_blocked),
    balance: Number(row.balance ?? 0),
    rating: Number(row.rating ?? 5.0),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    // join data
    roleName: row.role_name || null,
    // mapped fields
    role: row.role_id || 'user',
    status: row.is_blocked ? 'blocked' : 'active',
    joinDate: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    totalBids: Number(extras.total_bids ?? row.total_bids ?? 0),
    totalSpent: Number(extras.total_spent ?? row.total_spent ?? 0),
  };
}

export function mapTransactionRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    userName: row.user_name || null,
    auctionId: row.auction_id != null ? String(row.auction_id) : null,
    auctionTitle: row.auction_title || null,
    amount: Number(row.amount),
    type: row.type,
    status: row.status,
    timestamp: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export function mapBidRow(row) {
  return {
    id: String(row.id),
    auctionId: String(row.auction_id),
    userId: String(row.user_id),
    bidAmount: Number(row.bid_amount),
    bidTime: row.bid_time instanceof Date ? row.bid_time.toISOString() : row.bid_time,
    auctionTitle: row.auction_title || null,
    // mapped
    amount: Number(row.bid_amount || row.amount),
    timestamp: row.bid_time instanceof Date ? row.bid_time.toISOString() : (row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at),
    isWinning: Boolean(row.is_winning),
  };
}

export function mapNotificationRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: row.title,
    message: row.message || null,
    auctionId: row.auction_id != null ? String(row.auction_id) : null,
    auctionTitle: row.auction_title || null,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export function mapProductCategoryRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description || null,
    image: row.image || null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}
