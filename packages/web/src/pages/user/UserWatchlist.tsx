import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Clock, Users, Gavel, AlertCircle, Eye, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface WatchedAuction {
  id: string;
  title: string;
  image: string;
  currentPrice: number;
  endTime: string;
  totalBids: number;
  statusId: number;
}

export function UserWatchlist() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<WatchedAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    api<{ watchlist: any[] }>('/api/watchlist').then(data => {
      setAuctions((data.watchlist || []).map((a: any) => ({
        id: a.id,
        title: a.title || a.productTitle || 'Sản phẩm',
        image: a.image || a.productImage || '',
        currentPrice: a.currentPrice || a.current_price || 0,
        endTime: a.endTime || a.end_time || '',
        totalBids: a.totalBids || a.total_bids || 0,
        statusId: a.statusId || a.status_id || 1,
      })));
    }).catch(() => setAuctions([])).finally(() => setLoading(false));
  }, []);

  const removeFromWatchlist = async (id: string) => {
    try {
      await api(`/api/watchlist/${id}`, { method: 'DELETE' });
      setAuctions(prev => prev.filter(a => a.id !== id));
      toast.success('Đã xóa khỏi danh sách theo dõi');
    } catch { toast.error('Không thể xóa'); }
    setDeleteId(null);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  const formatTime = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Đã kết thúc';
    const h = Math.floor(diff / 3600000);
    if (h > 24) return `${Math.floor(h / 24)} ngày`;
    return `${h}h ${Math.floor((diff % 3600000) / 60000)}p`;
  };

  const filtered = auctions.filter(a => {
    if (filter === 'active') return a.statusId === 1;
    if (filter === 'ended') return a.statusId !== 1;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="gap-1"><Heart className="h-3 w-3" />{auctions.length} theo dõi</Badge>
        <div className="flex gap-2 border-b">
          {(['all', 'active', 'ended'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm font-medium border-b-2 ${filter === f ? 'border-accent text-accent' : 'border-transparent text-muted-foreground'}`}>
              {f === 'all' ? `Tất cả (${auctions.length})` : f === 'active' ? `Đang diễn ra (${auctions.filter(a => a.statusId === 1).length})` : `Đã kết thúc (${auctions.filter(a => a.statusId !== 1).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Card key={i}><Skeleton className="aspect-square rounded-t-xl" /><CardContent className="p-4"><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm nào được theo dõi</h3>
          <Button onClick={() => navigate('/auctions')} className="gap-2"><Gavel className="h-4 w-4" />Khám phá đấu giá</Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((auction) => (
            <Card key={auction.id} className="overflow-hidden hover:shadow-lg group">
              <div className="aspect-square relative bg-muted">
                {auction.image ? <img src={auction.image} alt={auction.title} className="w-full h-full object-cover cursor-pointer" onClick={() => navigate(`/auctions/${auction.id}`)} /> : <div className="w-full h-full flex items-center justify-center"><Gavel className="h-16 w-16 text-muted-foreground/20" /></div>}
                <div className="absolute top-2 left-2"><Badge className={auction.statusId === 1 ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>{auction.statusId === 1 ? 'Đang diễn ra' : 'Đã kết thúc'}</Badge></div>
                <button className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteId(auction.id)}><Trash2 className="h-4 w-4" /></button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate cursor-pointer hover:text-accent mb-2" onClick={() => navigate(`/auctions/${auction.id}`)}>{auction.title}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Giá hiện tại</span><span className="font-bold text-accent">{formatCurrency(auction.currentPrice)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Lượt đặt</span><span>{auction.totalBids}</span></div>
                  {auction.statusId === 1 && <div className="flex justify-between"><span className="text-muted-foreground">Còn lại</span><Badge variant="outline" className="text-orange-600 border-orange-200">{formatTime(auction.endTime)}</Badge></div>}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => navigate(`/auctions/${auction.id}`)}><Eye className="h-3 w-3" />Xem</Button>
                  {auction.statusId === 1 && <Button size="sm" className="flex-1 gap-1" onClick={() => navigate(`/auctions/${auction.id}`)}><Gavel className="h-3 w-3" />Đặt giá</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Xóa khỏi danh sách theo dõi?</AlertDialogTitle><AlertDialogDescription>Hành động này có thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && removeFromWatchlist(deleteId)} className="bg-red-500 hover:bg-red-600">Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
