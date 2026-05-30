export interface Auction {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  currentBid: number;
  minIncrement: number;
  startingBid: number;
  totalBids: number;
  endTime: Date;
  status: 'active' | 'upcoming' | 'ended';
  seller: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  auctionTitle: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
}

export type AuctionStatus = 'active' | 'upcoming' | 'ended';

export type AuctionCategory = 
  | 'Đồng hồ' 
  | 'Máy ảnh' 
  | 'Nội thất' 
  | 'Trang sức' 
  | 'Xe cổ' 
  | 'Nghệ thuật'
  | 'Thời trang'
  | 'Sưu tầm'
  | 'Rượu vang'
  | 'Xe thuyền'
  | 'Nhạc cụ';
