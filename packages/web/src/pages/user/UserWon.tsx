import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Package, CreditCard, CheckCircle, Loader2, AlertCircle, Eye, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { transactionService } from '../../services/transactionService';

interface WonAuction {
  id: string;
  title: string;
  image: string;
  currentPrice: number;
  endTime: string;
  winningBid?: { bidAmount: number; bidTime: string };
  transactionStatus?: string;
}

export function UserWon() {
  const navigate = useNavigate();
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'completed'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await transactionService.getWonAuctions();
        const transformed = Array.isArray(data) ? data.map((item: any) => ({
          id: item.id,
          title: item.title || item.product_title || 'Sản phẩm đấu giá',
          image: item.image || item.product_image || '',
          currentPrice: item.currentPrice || item.current_price || item.winningBid?.bidAmount || 0,
          endTime: item.endTime || item.end_time || new Date().toISOString(),
          winningBid: item.winningBid || { bidAmount: item.currentPrice || 0, bidTime: item.endTime || '' },
          transactionStatus: item.transactionStatus || item.status || null,
        })) : [];
        setWonAuctions(transformed);
      } catch (e) {
        console.error('Failed to fetch', e);
        setError('Không thể tải danh sách');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status?: string | null) => {
    switch (status) {
      case 'paid': return <Badge className="bg-blue-500 text-white">Đã thanh toán</Badge>;
      case 'completed': return <Badge className="bg-green-500 text-white">Hoàn thành</Badge>;
      case 'shipped': return <Badge className="bg-purple-500 text-white">Đang giao</Badge>;
      default: return <Badge className="bg-orange-500 text-white">Chờ thanh toán</Badge>;
    }
  };

  const filtered = wonAuctions.filter(a => {
    if (filter === 'pending') return !a.transactionStatus || a.transactionStatus === 'pending';
    if (filter === 'paid') return a.transactionStatus === 'paid';
    if (filter === 'completed') return a.transactionStatus === 'completed';
    return true;
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 cursor-pointer hover:shadow-md" onClick={() => setFilter('pending')}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10"><Clock className="h-5 w-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold">{wonAuctions.filter(a => !a.transactionStatus || a.transactionStatus === 'pending').length}</p><p className="text-sm text-muted-foreground">Chờ thanh toán</p></div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md" onClick={() => setFilter('paid')}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><CreditCard className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{wonAuctions.filter(a => a.transactionStatus === 'paid').length}</p><p className="text-sm text-muted-foreground">Đã thanh toán</p></div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md" onClick={() => setFilter('completed')}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{wonAuctions.filter(a => a.transactionStatus === 'completed').length}</p><p className="text-sm text-muted-foreground">Hoàn thành</p></div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ({wonAuctions.length})</TabsTrigger>
          <TabsTrigger value="pending">Chờ thanh toán ({wonAuctions.filter(a => !a.transactionStatus).length})</TabsTrigger>
          <TabsTrigger value="paid">Đã thanh toán ({wonAuctions.filter(a => a.transactionStatus === 'paid').length})</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành ({wonAuctions.filter(a => a.transactionStatus === 'completed').length})</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Card key={i}><Skeleton className="aspect-square rounded-t-xl" /><CardContent className="p-4"><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>)}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm nào thắng</h3>
              <p className="text-muted-foreground mb-4">Hãy tham gia đấu giá để có cơ hội!</p>
              <Button onClick={() => navigate('/auctions')} className="gap-2"><Trophy className="h-4 w-4" />Khám phá đấu giá</Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((auction) => (
                <Card key={auction.id} className="overflow-hidden hover:shadow-lg">
                  <div className="aspect-square relative bg-muted">
                    {auction.image ? <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-16 w-16 text-muted-foreground/20" /></div>}
                    <div className="absolute top-2 left-2"><Badge className="bg-yellow-500 text-white gap-1"><Trophy className="h-3 w-3" />Chiến thắng</Badge></div>
                    <div className="absolute top-2 right-2">{getStatusBadge(auction.transactionStatus)}</div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate mb-2">{auction.title}</h3>
                    <div className="space-y-1 text-sm mb-4">
                      <div className="flex justify-between"><span className="text-muted-foreground">Giá thắng</span><span className="font-bold text-accent">{formatCurrency(auction.winningBid?.bidAmount || auction.currentPrice)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Ngày thắng</span><span>{formatDate(auction.winningBid?.bidTime || auction.endTime)}</span></div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => navigate(`/auctions/${auction.id}`)}><Eye className="h-3 w-3" />Chi tiết</Button>
                      {!auction.transactionStatus || auction.transactionStatus === 'pending' ? (
                        <Button size="sm" className="flex-1 gap-1"><CreditCard className="h-3 w-3" />Thanh toán</Button>
                      ) : (
                        <Button variant="secondary" size="sm" className="flex-1 gap-1"><Truck className="h-3 w-3" />Theo dõi</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
