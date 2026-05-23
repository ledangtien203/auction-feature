import { useState, useEffect } from 'react';
import { TrendingUp, Gavel, Trophy, DollarSign, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userDashboardService } from '../services/userDashboardService';
import { api } from '../lib/api';
import type { Auction } from '../../types/auction';

interface DashboardData {
  activeBids: number;
  wonAuctions: number;
  myAuctions: number;
  pendingPayments: number;
  watchedAuctions: number;
  recentBids: Array<{
    id: string;
    auctionId: string;
    bidAmount: number;
    bidTime: string;
    auctionTitle: string;
    currentPrice: number;
    isWinning: boolean;
    statusId: number;
  }>;
  myAuctionsList: Auction[];
}

export function UserDashboardContent() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await userDashboardService.getStats();
        setData(result as unknown as DashboardData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

  const stats = [
    { name: 'Tổng lượt đấu giá', value: data?.activeBids || 0, icon: Gavel, color: 'bg-blue-500', href: '/user/bids' },
    { name: 'Đấu giá thành công', value: data?.wonAuctions || 0, icon: Trophy, color: 'bg-green-500', href: '/user/won' },
    { name: 'Đang theo dõi', value: data?.watchedAuctions || 0, icon: TrendingUp, color: 'bg-purple-500', href: '/user/watchlist' },
    { name: 'Phiên đã đăng', value: data?.myAuctions || 0, icon: Activity, color: 'bg-orange-500', href: '/user/auctions' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-semibold">Dashboard</h2>
        <p className="text-gray-600">Chào mừng trở lại! Đây là tổng quan hoạt động của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(stat.href)}
            >
              <div className={`${stat.color} p-3 rounded-lg inline-block mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Active Bids */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Đấu giá đang tham gia</h3>
          <button 
            onClick={() => navigate('/user/bids')}
            className="text-sm text-blue-600 hover:underline"
          >
            Xem tất cả
          </button>
        </div>

        {!data?.recentBids || data.recentBids.length === 0 ? (
          <div className="text-center py-8">
            <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Bạn chưa tham gia đấu giá nào</p>
            <button 
              onClick={() => navigate('/auctions')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá đấu giá
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.recentBids.slice(0, 5).map((bid) => (
              <div 
                key={bid.id} 
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => navigate(`/auctions/${bid.auctionId}`)}
              >
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{bid.auctionTitle || `Đấu giá #${bid.auctionId}`}</h4>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Giá của bạn: <span className="text-gray-900">{formatCurrency(bid.bidAmount)}</span></span>
                    <span>Giá hiện tại: <span className={bid.isWinning ? 'text-green-600' : 'text-red-600'}>{formatCurrency(bid.currentPrice)}</span></span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm mb-2 ${
                    bid.isWinning ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {bid.isWinning ? 'Đang dẫn đầu' : 'Bị trả giá'}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(bid.bidTime).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Auctions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Phiên đấu giá của tôi</h3>
          <button 
            onClick={() => navigate('/user/auctions')}
            className="text-sm text-blue-600 hover:underline"
          >
            Xem tất cả
          </button>
        </div>

        {!data?.myAuctionsList || data.myAuctionsList.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Bạn chưa tạo phiên đấu giá nào</p>
            <button 
              onClick={() => navigate('/user/auctions')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo phiên mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.myAuctionsList.slice(0, 6).map((auction) => (
              <div 
                key={auction.id} 
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => navigate(`/auctions/${auction.id}`)}
              >
                <div className="aspect-video bg-gray-100 relative">
                  {auction.image ? (
                    <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gavel className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      auction.statusId === 1 ? 'bg-green-500 text-white' : 
                      auction.statusId === 2 ? 'bg-gray-500 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {auction.statusId === 1 ? 'Đang' : auction.statusId === 2 ? 'Kết thúc' : 'Chờ'}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium truncate mb-2">{auction.title}</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{formatCurrency(auction.currentPrice)}</span>
                    <span className="text-gray-500">{auction.totalBids} lượt</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
