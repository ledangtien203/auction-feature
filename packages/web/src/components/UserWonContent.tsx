import { useState, useEffect } from 'react';
import { Trophy, Package, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface WonAuction {
  id: string;
  auctionId: string;
  auctionTitle: string;
  currentPrice: number;
  endTime: string;
  totalBids: number;
  status: string;
  paymentStatus?: string;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

export function UserWonContent() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<WonAuction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWon = async () => {
      try {
        const data = await api<{ wonAuctions: any[] }>('/api/bids/won');
        const mapped = (data.wonAuctions || []).map((auction: any) => ({
          id: String(auction.id),
          auctionId: auction.auctionId || String(auction.id),
          auctionTitle: auction.title || auction.productTitle || auction.product_title,
          currentPrice: Number(auction.currentPrice || auction.current_price || 0),
          endTime: auction.endTime || auction.end_time,
          totalBids: Number(auction.totalBids || auction.total_bids || 0),
          status: auction.statusName || auction.status_name,
          paymentStatus: auction.transactionStatus,
        }));
        setAuctions(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWon();
  }, []);

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
        <h2 className='mb-2 text-xl font-semibold'>Sản phẩm đã thắng</h2>
        <p className='text-gray-600'>Danh sách các phiên đấu giá bạn đã chiến thắng</p>
      </div>

      {auctions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có sản phẩm nào được thắng</h3>
          <p className="text-gray-500 mb-4">Hãy tham gia đấu giá để có cơ hội chiến thắng</p>
          <button 
            onClick={() => navigate('/auctions')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Khám phá đấu giá
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {auctions.map((auction) => (
            <div 
              key={auction.id} 
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/auctions/${auction.auctionId}`)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-lg mb-1">{auction.auctionTitle}</h4>
                      <p className="text-sm text-gray-500">Mã phiên: #{auction.auctionId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">Đã thắng</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Giá cuối cùng</p>
                      <p className="font-bold text-lg text-blue-600">{formatCurrency(auction.currentPrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Số lượt đấu</p>
                      <p className="font-medium">{auction.totalBids} lượt</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ngày kết thúc</p>
                      <p className="font-medium">{new Date(auction.endTime).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {auction.paymentStatus === 'paid' ? (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      Đã thanh toán
                    </span>
                  ) : (
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/user/wallet');
                      }}
                    >
                      Thanh toán ngay
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
