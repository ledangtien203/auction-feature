import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Trophy, CheckCircle, Clock, CreditCard, Package, ArrowRight } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { auctionService } from '../services/auctionService';
import type { Auction } from '../types/auction';
import { readStoredUser } from '../services/authService';

interface WonAuction extends Auction {
  winningBid?: {
    id: string;
    auctionId: string;
    userId: string;
    userName: string | null;
    bidAmount: number;
    bidTime: string;
    createdAt?: string;
  };
  transactionStatus?: string;
  paymentMethod?: string;
}

export function WonAuctions() {
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
  const [loading, setLoading] = useState(true);

  const user = readStoredUser();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await auctionService.getWonAuctions();
        if (!cancelled) {
          setWonAuctions(res.wonAuctions);
        }
      } catch {
        if (!cancelled) {
          setWonAuctions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimestamp = (date: Date | string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusBadge = (status?: string, paymentMethod?: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-success text-success-foreground gap-1">
          <CheckCircle className="h-3 w-3" />
          Đã thanh toán
        </Badge>
      );
    }
    if (status === 'pending') {
      return (
        <Badge variant="secondary" className="bg-warning text-warning-foreground gap-1">
          <Clock className="h-3 w-3" />
          Chờ thanh toán
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <CreditCard className="h-3 w-3" />
        Chưa có giao dịch
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method?: string) => {
    const methods: Record<string, string> = {
      bank_transfer: 'Chuyển khoản',
      momo: 'MoMo',
      vnpay: 'VNPay',
      cash: 'Tiền mặt',
      other: 'Khác',
    };
    return method ? methods[method] || method : null;
  };

  const pendingCount = wonAuctions.filter((a) => a.transactionStatus === 'pending').length;
  const completedCount = wonAuctions.filter((a) => a.transactionStatus === 'completed').length;
  const totalValue = wonAuctions.reduce((sum, a) => sum + (a.currentBid || 0), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Đăng nhập để xem đấu giá đã thắng</h1>
          <p className="text-muted-foreground mb-6">
            Bạn cần đăng nhập để xem các phiên đấu giá đã thắng.
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
      <div className="bg-gradient-to-r from-accent to-accent/70 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur">
              <Trophy className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Đấu giá đã thắng</h1>
              <p className="text-lg text-white/80">
                Theo dõi và quản lý các phiên đấu giá bạn đã chiến thắng
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-accent" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{wonAuctions.length}</div>
              <div className="text-sm text-muted-foreground">Tổng thắng</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
              <div className="text-2xl font-bold text-warning mb-1">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">Chờ thanh toán</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
              </div>
              <div className="text-2xl font-bold text-success mb-1">{completedCount}</div>
              <div className="text-sm text-muted-foreground">Đã thanh toán</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-xl font-bold text-primary mb-1">{formatCurrency(totalValue)}</div>
              <div className="text-sm text-muted-foreground">Tổng giá trị</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending payment alert */}
        {pendingCount > 0 && (
          <Card className="mb-8 border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-warning/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Thanh toán đang chờ</h3>
                  <p className="text-muted-foreground mb-3">
                    Bạn có {pendingCount} phiên đấu giá cần thanh toán. Vui lòng hoàn tất thanh toán
                    để nhận hàng.
                  </p>
                  <Link to="/my-bids">
                    <Button variant="outline" size="sm" className="gap-2">
                      Xem chi tiết
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Won auctions list */}
        {wonAuctions.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Danh sách đấu giá đã thắng</h2>
            <div className="grid gap-6">
              {wonAuctions.map((auction) => (
                <Card
                  key={auction.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-56 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={auction.image}
                        alt={auction.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/favicon1.jpg';
                        }}
                      />
                    </div>

                    <CardContent className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{auction.category}</Badge>
                            {getStatusBadge(auction.transactionStatus, auction.paymentMethod)}
                          </div>
                          <h3 className="text-2xl font-bold mb-1">{auction.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {auction.description}
                          </p>
                        </div>
                        <Link to={`/auctions/${auction.id}`}>
                          <Button variant="outline" className="gap-2">
                            Chi tiết
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Giá thắng</div>
                          <div className="text-xl font-bold text-success">
                            {formatCurrency(auction.winningBid?.bidAmount ?? auction.currentPrice)}
                          </div>
                        </div>

                        {auction.winningBid?.bidTime && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Ngày thắng</div>
                            <div className="text-sm font-medium">
                              {formatTimestamp(auction.winningBid.bidTime)}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Người bán</div>
                          <div className="text-sm font-medium">{auction.seller || '—'}</div>
                        </div>

                        {auction.paymentMethod && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Thanh toán</div>
                            <div className="text-sm font-medium">
                              {getPaymentMethodLabel(auction.paymentMethod)}
                            </div>
                          </div>
                        )}
                      </div>

                      {auction.transactionStatus === 'pending' && (
                        <div className="mt-4 flex items-center gap-4">
                          <Link to={`/auctions/${auction.id}`}>
                            <Button className="gap-2">
                              <CreditCard className="h-4 w-4" />
                              Thanh toán ngay
                            </Button>
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            Thanh toán để hoàn tất giao dịch và nhận hàng
                          </span>
                        </div>
                      )}

                      {auction.transactionStatus === 'completed' && (
                        <div className="mt-4 flex items-center gap-4">
                          <Button variant="outline" className="gap-2" disabled>
                            <Package className="h-4 w-4" />
                            Đang chờ giao hàng
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Hàng sẽ được giao trong 3-7 ngày làm việc
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center py-20">
            <CardContent>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
                <Trophy className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Chưa có đấu giá thắng</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Hãy tham gia đấu giá và trở thành người chiến thắng!
              </p>
              <Link to="/auctions">
                <Button size="lg" className="gap-2">
                  Khám phá phiên đấu giá
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
