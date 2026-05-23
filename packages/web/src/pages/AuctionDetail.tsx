import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, User, Shield, Clock, Flame } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CountdownTimer } from '../components/CountdownTimer';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Separator } from '../components/ui/separator';
import { auctionService } from '../services/auctionService';
import type { Auction } from '../types/auction';
import { parseAuction } from '../lib/normalize';
import { ApiError } from '../lib/api';
import { joinAuction, leaveAuction, onBidUpdate } from '../lib/socket';

export function AuctionDetail() {
  const { id } = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidHistory, setBidHistory] = useState<
    { id: string; auctionId: string; userId: string; userName: string; bidAmount: number; bidTime: string }[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const a = await auctionService.getAuctionById(id);
        if (!cancelled) setAuction(a);
      } catch {
        if (!cancelled) setAuction(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await auctionService.getAuctionBidHistory(id);
        if (!cancelled) setBidHistory(rows);
      } catch {
        if (!cancelled) setBidHistory([]);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    joinAuction(id);
    return () => { leaveAuction(id); };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onBidUpdate((payload) => {
      if (String(payload.auctionId) !== String(id)) return;
      if (payload.auction) {
        setAuction(parseAuction(payload.auction as Record<string, unknown>));
      }
      auctionService.getAuctionBidHistory(id).then(setBidHistory).catch(() => {});
    });
    return unsubscribe;
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
          <p className="text-muted-foreground mb-6">Sản phẩm không tồn tại hoặc đã bị xóa</p>
          <Link to="/auctions">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isActive = auction.statusId === 1;
  const isEnded = auction.statusId === 2;

  const minNextBid =
    auction.currentPrice > 0 ? auction.currentPrice + auction.bidIncrement : auction.startPrice;

  const handleBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!sessionStorage.getItem('token')) {
      toast.error('Vui lòng đăng nhập để đặt giá');
      return;
    }
    if (isNaN(amount)) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (amount < minNextBid) {
      toast.error(`Giá đặt phải từ ${formatCurrency(minNextBid)} trở lên`);
      return;
    }
    try {
      const updated = await auctionService.placeBid(auction.id, amount);
      setAuction(updated);
      toast.success('Đặt giá thành công!', {
        description: `Bạn đã đặt giá ${formatCurrency(amount)} cho sản phẩm này.`,
      });
      setBidAmount('');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Đặt giá thất bại';
      toast.error(msg);
    }
  };

  const handleQuickBid = (amount: number) => {
    setBidAmount(amount.toString());
  };

  const formatBidTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return d.toLocaleString('vi-VN');
  };

  const statusBadgeClass = isActive
    ? 'bg-success text-success-foreground'
    : isEnded
    ? 'bg-muted text-muted-foreground'
    : 'bg-warning text-warning-foreground';

  const statusText = isActive ? 'Đang diễn ra' : isEnded ? 'Đã kết thúc' : 'Đã hủy';

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/auctions">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square bg-card rounded-2xl overflow-hidden border border-border">
              <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <Badge className={statusBadgeClass}>
                  {statusText}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3">
                {auction.category}
              </Badge>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">{auction.title}</h1>
            </div>

            <div className="flex items-baseline gap-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Giá hiện tại</div>
                <div className="text-4xl font-bold text-accent">
                  {auction.currentPrice > 0
                    ? formatCurrency(auction.currentPrice)
                    : formatCurrency(auction.startPrice)}
                </div>
              </div>
              {isActive && (
                <div className="flex items-center gap-1 text-success">
                  <Flame className="h-5 w-5" />
                  <span className="text-sm font-semibold">{auction.totalBids} lượt</span>
                </div>
              )}
            </div>

            {isActive && (
              <div className="bg-urgent/5 border border-urgent/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-urgent" />
                  <span className="font-semibold text-foreground">Thời gian còn lại</span>
                </div>
                <CountdownTimer endTime={new Date(auction.endTime)} />
              </div>
            )}

            <Separator />

            {isActive && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Đặt giá của bạn</label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder={formatCurrency(minNextBid)}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={minNextBid}
                      step={auction.bidIncrement}
                      className="h-14 text-lg"
                    />
                    <Button
                      onClick={handleBid}
                      size="lg"
                      className="bg-accent hover:bg-accent/90 px-8"
                    >
                      Đặt giá
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Giá tối thiểu:{' '}
                    <span className="font-semibold">{formatCurrency(minNextBid)}</span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Đặt giá nhanh</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => handleQuickBid(minNextBid)} className="h-12">
                      {formatCurrency(minNextBid)}
                    </Button>
                    <Button variant="outline" onClick={() => handleQuickBid(minNextBid + auction.bidIncrement)} className="h-12">
                      {formatCurrency(minNextBid + auction.bidIncrement)}
                    </Button>
                    <Button variant="outline" onClick={() => handleQuickBid(minNextBid + auction.bidIncrement * 2)} className="h-12">
                      {formatCurrency(minNextBid + auction.bidIncrement * 2)}
                    </Button>
                    <Button variant="outline" onClick={() => handleQuickBid(minNextBid + auction.bidIncrement * 5)} className="h-12">
                      {formatCurrency(minNextBid + auction.bidIncrement * 5)}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isEnded && (
              <div className="bg-muted border border-border rounded-xl p-6">
                <p className="text-muted-foreground font-semibold">
                  Phiên đấu giá này đã kết thúc.
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Chi tiết sản phẩm</h3>
              <p className="text-muted-foreground leading-relaxed">{auction.description}</p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Người bán</div>
                    <div className="font-semibold">{auction.seller || auction.sellerName || '—'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Bước giá</div>
                    <div className="font-semibold">{formatCurrency(auction.bidIncrement)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Giá khởi điểm</div>
                    <div className="font-semibold">{formatCurrency(auction.startPrice)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Kết thúc</div>
                    <div className="font-semibold">
                      {new Date(auction.endTime).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {bidHistory.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Lịch sử đặt giá</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {historyLoading ? (
                <div className="p-8 text-center text-muted-foreground">Đang tải…</div>
              ) : (
                <div className="divide-y divide-border">
                  {bidHistory.map((bid, index) => (
                    <div
                      key={`${bid.bidTime}-${index}`}
                      className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <div className="font-semibold">{bid.userName || `Người dùng #${bid.userId}`}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatBidTime(bid.bidTime)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-accent">
                          {formatCurrency(bid.bidAmount)}
                        </div>
                        {index === 0 && (
                          <Badge variant="default" className="bg-success">
                            Giá cao nhất
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
