import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CountdownTimer } from '../components/CountdownTimer';
import { auctionService } from '../services/auctionService';
import type { Bid } from '../types/auction';
import type { Auction } from '../types/auction';

export function MyBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [auctions, setAuctions] = useState<Record<string, Auction>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await auctionService.getMyBidsWithAuctions();
        if (!cancelled) {
          setBids(res.bids);
          setAuctions(res.auctions);
        }
      } catch {
        if (!cancelled) {
          setBids([]);
          setAuctions({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const activeBids = bids.length;
  const winningBids = bids.filter((b) => b.isWinning).length;
  const totalValue = bids.reduce((sum, bid) => sum + bid.amount, 0);

  if (!sessionStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Đăng nhập để xem giá đặt</h1>
          <p className="text-muted-foreground mb-6">
            Bạn cần đăng nhập để theo dõi các phiên đấu giá đã tham gia.
          </p>
          <Link to="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-3">Giá đặt của tôi</h1>
          <p className="text-lg text-white/80">
            Theo dõi và quản lý tất cả các phiên đấu giá bạn đang tham gia
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{activeBids}</div>
            <div className="text-sm text-muted-foreground">Đang tham gia</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <Trophy className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{winningBids}</div>
            <div className="text-sm text-muted-foreground">Đang dẫn đầu</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalValue)}</div>
            <div className="text-sm text-muted-foreground">Tổng giá trị</div>
          </div>
        </div>

        {bids.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Danh sách đấu giá</h2>
            <div className="space-y-4">
              {bids.map((bid) => {
                const auction = auctions[bid.auctionId];
                if (!auction) return null;

                return (
                  <div
                    key={bid.id}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent transition-colors"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                        <img
                          src={auction.image}
                          alt={auction.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">{bid.auctionTitle}</h3>
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline">{auction.category}</Badge>
                              {bid.isWinning ? (
                                <Badge className="bg-success text-success-foreground gap-1">
                                  <Trophy className="h-3 w-3" />
                                  Đang dẫn đầu
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Đã bị vượt qua</Badge>
                              )}
                            </div>
                          </div>
                          <Link to={`/auctions/${auction.id}`}>
                            <Button className="gap-2">
                              Xem chi tiết
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Giá bạn đặt</div>
                            <div className="text-xl font-bold text-accent">
                              {formatCurrency(bid.amount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Giá hiện tại</div>
                            <div className="text-xl font-bold">
                              {formatCurrency(auction.currentBid)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Thời gian đặt</div>
                            <div className="text-sm">{formatTimestamp(bid.timestamp)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Còn lại</div>
                            <CountdownTimer endTime={auction.endTime} compact />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
              <Trophy className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Bạn chưa tham gia đấu giá nào</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Khám phá các sản phẩm đang đấu giá và bắt đầu đặt giá ngay!
            </p>
            <Link to="/auctions">
              <Button size="lg" className="gap-2">
                Xem các phiên đấu giá <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
