export interface Auction {
  id: string;
  productId: number;
  sellerId: number;
  winnerId: number | null;
  startPrice: number;
  currentPrice: number;
  bidIncrement: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  statusId: number;
  createdAt: string;
  // product join fields
  productName: string | null;
  productTitle: string | null;
  productDescription: string | null;
  productImage: string | null;
  productCategoryId: number | null;
  productCategoryName: string | null;
  sellerName: string | null;
  // alias fields used by pages
  title: string;
  description: string;
  image: string;
  category: string;
  currentBid: number;
  minIncrement: number;
  startingBid: number;
  totalBids: number;
  endTimeRaw: string;
  status: number;
  seller: string | null;
  sellerIdMap: number;
  // nested objects from joined endpoints
  winningBid?: {
    id: string;
    auctionId: string;
    userId: string;
    userName?: string;
    bidAmount: number;
    bidTime: string;
    auctionTitle?: string;
    amount?: number;
    timestamp?: string;
    isWinning?: boolean;
  };
  transactionStatus?: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName?: string;
  bidAmount: number;
  bidTime: string;
  auctionTitle: string | null;
  // alias
  amount: number;
  timestamp: string;
  isWinning: boolean;
}

export type AuctionStatusId = 1 | 2 | 3;
export type AuctionStatusName = 'Đang diễn ra' | 'Đã kết thúc' | 'Đã hủy';

export type AuctionCategory =
  | 'Điện thoại & Tablet'
  | 'Laptop & Máy tính'
  | 'Đồng hồ'
  | 'Giày dép'
  | 'Túi xách'
  | 'Trang sức'
  | 'Đồ gia dụng'
  | 'Sách & Văn phòng phẩm';
