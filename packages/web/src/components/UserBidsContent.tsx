import { useState, useEffect } from 'react';
import { Clock, TrendingUp, CheckCircle, XCircle, Gavel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface Bid {
  id: string;
  auctionId: string;
  bidAmount: number;
  bidTime: string;
  auctionTitle: string;
  currentPrice: number;
  isWinning: boolean;
  statusId: number;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

export function UserBidsContent() {
  const navigate = useNavigate();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const data = await api<{ bids: Bid[] }>('/api/bids/me');
        // Map bids with auction info
        const mappedBids = (data.bids || []).map((bid: any) => ({
          ...bid,
          auctionId: bid.auction_id || bid.auctionId,
          bidAmount: Number(bid.bid_amount || bid.bidAmount),
          currentPrice: Number(bid.current_price || bid.currentPrice || 0),
        }));
        setBids(mappedBids);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const getStatusBadge = (bid: Bid) => {
    if (bid.statusId === 2) {
      if (bid.isWinning) {
        return (
          <div className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm'>
            <CheckCircle className='w-4 h-4' />
            Thắng đấu giá
          </div>
        );
      }
      return (
        <div className='flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm'>
          <XCircle className='w-4 h-4' />
          Không thắng
        </div>
      );
    }
    if (bid.isWinning) {
      return (
        <div className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm'>
          <TrendingUp className='w-4 h-4' />
          Đang dẫn đầu
        </div>
      );
    }
    return (
      <div className='flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm'>
        Bị trả giá
      </div>
    );
  };

  const filteredBids = bids.filter(bid => {
    if (filter === 'all') return true;
    if (filter === 'active') return bid.statusId === 1;
    if (filter === 'won') return bid.statusId === 2 && bid.isWinning;
    if (filter === 'lost') return bid.statusId === 2 && !bid.isWinning;
    return true;
  });

  const activeCount = bids.filter(b => b.statusId === 1).length;
  const completedCount = bids.filter(b => b.statusId === 2).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='mb-2 text-xl font-semibold'>Đấu giá của tôi</h2>
        <p className='text-gray-600'>Quản lý tất cả các phiên đấu giá bạn đã tham gia</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          Tất cả ({bids.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          Đang tham gia ({activeCount})
        </button>
        <button
          onClick={() => setFilter('won')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'won' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          Đã thắng ({bids.filter(b => b.statusId === 2 && b.isWinning).length})
        </button>
        <button
          onClick={() => setFilter('lost')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'lost' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          Không thắng ({bids.filter(b => b.statusId === 2 && !b.isWinning).length})
        </button>
      </div>

      {/* Bids List */}
      {filteredBids.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Gavel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Chưa có đấu giá nào' : `Không có đấu giá "${filter === 'active' ? 'đang tham gia' : filter === 'won' ? 'đã thắng' : 'không thắng'}"`}
          </h3>
          <p className="text-gray-500 mb-4">Hãy khám phá các phiên đấu giá hấp dẫn</p>
          <button 
            onClick={() => navigate('/auctions')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Khám phá đấu giá
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBids.map((bid) => (
            <div 
              key={bid.id} 
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/auctions/${bid.auctionId}`)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-lg mb-2">{bid.auctionTitle || `Đấu giá #${bid.auctionId}`}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Giá của bạn</p>
                      <p className="font-medium">{formatCurrency(bid.bidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Giá hiện tại</p>
                      <p className={`font-medium ${bid.isWinning ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(bid.currentPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Thời gian đặt</p>
                      <p className="font-medium">{new Date(bid.bidTime).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(bid)}
                  {!bid.isWinning && bid.statusId === 1 && (
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/auctions/${bid.auctionId}`);
                      }}
                    >
                      Đặt giá mới
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
