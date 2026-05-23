import { useState, useEffect } from 'react';
import { Heart, Clock, Gavel, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Badge } from './ui/badge';

interface WatchedAuction {
  id: string;
  auctionId: string;
  title: string;
  image?: string;
  currentPrice: number;
  startPrice: number;
  endTime: string;
  totalBids: number;
  statusId: number;
  isWatching: boolean;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

const formatTimeRemaining = (endTime: string) => {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'Đã kết thúc';
  const h = Math.floor(diff / 3600000);
  if (h > 24) return `${Math.floor(h / 24)} ngày`;
  return `${h}h ${Math.floor((diff % 3600000) / 60000)}p`;
};

export function UserWatchlistContent() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<WatchedAuction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const data = await api<{ watchlist: any[] }>('/api/watchlist');
        const mapped = (data.watchlist || []).map((item: any) => ({
          id: item.id || item.auctionId,
          auctionId: item.auctionId || item.auction_id || item.id,
          title: item.title || item.productTitle || item.product_title,
          image: item.image || item.productImage || item.product_image,
          currentPrice: Number(item.currentPrice || item.current_price || 0),
          startPrice: Number(item.startPrice || item.start_price || 0),
          endTime: item.endTime || item.end_time,
          totalBids: Number(item.totalBids || item.total_bids || 0),
          statusId: Number(item.statusId || item.status_id || 1),
          isWatching: true,
        }));
        setAuctions(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, []);

  const handleRemove = async (e: React.MouseEvent, auctionId: string) => {
    e.stopPropagation();
    try {
      await api(`/api/watchlist/${auctionId}`, { method: 'DELETE' });
      setAuctions(prev => prev.filter(a => a.auctionId !== auctionId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='mb-2 text-xl font-semibold'>Danh sách theo dõi</h2>
        <p className='text-gray-600'>Những phiên đấu giá bạn đang theo dõi</p>
      </div>

      {auctions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có sản phẩm nào được theo dõi</h3>
          <p className="text-gray-500 mb-4">Theo dõi các phiên đấu giá bạn quan tâm</p>
          <button 
            onClick={() => navigate('/auctions')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Khám phá đấu giá
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map((auction) => (
            <div 
              key={auction.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/auctions/${auction.auctionId}`)}
            >
              <div className="aspect-video bg-gray-100 relative">
                {auction.image ? (
                  <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Eye className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge className={auction.statusId === 1 ? 'bg-green-500' : 'bg-gray-500'}>
                    {auction.statusId === 1 ? formatTimeRemaining(auction.endTime) : 'Kết thúc'}
                  </Badge>
                </div>
                <button 
                  className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  onClick={(e) => handleRemove(e, auction.auctionId)}
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>
              </div>
              <div className="p-4">
                <h4 className="font-medium mb-2 line-clamp-2">{auction.title}</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Giá hiện tại</p>
                    <p className="font-bold text-blue-600">{formatCurrency(auction.currentPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{auction.totalBids} lượt</p>
                    {auction.statusId === 1 && (
                      <div className="flex items-center gap-1 text-xs text-orange-500">
                        <Clock className="w-3 h-3" />
                        {formatTimeRemaining(auction.endTime)}
                      </div>
                    )}
                  </div>
                </div>
                {auction.statusId === 1 && (
                  <button 
                    className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/auctions/${auction.auctionId}`);
                    }}
                  >
                    <Gavel className="w-4 h-4 inline mr-1" />
                    Đặt giá ngay
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
