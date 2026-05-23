import { useState, useEffect } from 'react';
import { Plus, Package, Clock, Users, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Badge } from './ui/badge';

interface MyAuction {
  id: string;
  title: string;
  image?: string;
  currentPrice: number;
  startPrice: number;
  statusId: number;
  totalBids: number;
  endTime: string;
  categoryName?: string;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

const formatTimeRemaining = (endTime: string) => {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'Đã kết thúc';
  const h = Math.floor(diff / 3600000);
  if (h > 24) return `${Math.floor(h / 24)} ngày`;
  return `${h}h ${Math.floor((diff % 3600000) / 60000)}p`;
};

export function UserAuctionsContent() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<MyAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const data = await api<MyAuction[]>('/api/user-dashboard/auctions');
        setAuctions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const handleDelete = async (e: React.MouseEvent, auctionId: string) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa phiên đấu giá này?')) return;
    try {
      await api(`/api/user-dashboard/auctions/${auctionId}`, { method: 'DELETE' });
      setAuctions(prev => prev.filter(a => a.id !== auctionId));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAuctions = auctions.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'active') return a.statusId === 1;
    if (filter === 'ended') return a.statusId === 2;
    return true;
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className='mb-2 text-xl font-semibold'>Phiên đấu giá của tôi</h2>
          <p className='text-gray-600'>Quản lý các phiên đấu giá bạn đã tạo</p>
        </div>
        <button 
          onClick={() => navigate('/user/auctions/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo phiên mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          Tất cả ({auctions.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          Đang diễn ra ({auctions.filter(a => a.statusId === 1).length})
        </button>
        <button
          onClick={() => setFilter('ended')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'ended' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          Đã kết thúc ({auctions.filter(a => a.statusId === 2).length})
        </button>
      </div>

      {/* Auctions List */}
      {filteredAuctions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Chưa có phiên đấu giá nào' : `Không có phiên đấu giá "${filter === 'active' ? 'đang diễn ra' : 'đã kết thúc'}"`}
          </h3>
          <p className="text-gray-500 mb-4">Tạo phiên đấu giá đầu tiên của bạn</p>
          <button 
            onClick={() => navigate('/user/auctions/create')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tạo phiên mới
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAuctions.map((auction) => (
            <div 
              key={auction.id} 
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/auctions/${auction.id}`)}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {auction.image ? (
                    <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-lg mb-1">{auction.title}</h4>
                      {auction.categoryName && (
                        <Badge variant="outline" className="text-xs">{auction.categoryName}</Badge>
                      )}
                    </div>
                    <Badge className={
                      auction.statusId === 1 ? 'bg-green-500' : 
                      auction.statusId === 2 ? 'bg-gray-500' : 'bg-yellow-500'
                    }>
                      {auction.statusId === 1 ? 'Đang diễn ra' : 
                       auction.statusId === 2 ? 'Đã kết thúc' : 'Chờ duyệt'}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Giá hiện tại</p>
                      <p className="font-bold text-blue-600">{formatCurrency(auction.currentPrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Giá khởi điểm</p>
                      <p className="font-medium">{formatCurrency(auction.startPrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Số lượt đấu</p>
                      <p className="font-medium flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {auction.totalBids}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Thời gian còn lại</p>
                      <p className={`font-medium flex items-center gap-1 ${auction.statusId === 1 ? 'text-orange-500' : 'text-gray-500'}`}>
                        <Clock className="w-4 h-4" />
                        {auction.statusId === 1 ? formatTimeRemaining(auction.endTime) : 'Đã kết thúc'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={(e) => handleDelete(e, auction.id)}
                    title="Xóa"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
