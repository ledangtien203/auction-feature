import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowRight, Clock, TrendingUp, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { CountdownTimer } from '../components/CountdownTimer';
import { auctionService } from '../services/auctionService';
import type { Auction } from '../types/auction';
import { formatCurrency } from '../utils/formatters';

export function Home() {
  const [allAuctions, setAllAuctions] = useState<Auction[]>([]);
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const [featuredAuctions, setFeaturedAuctions] = useState<Auction[]>([]);
  const [hotDeals, setHotDeals] = useState<Auction[]>([]);
  const [trendingAuctions, setTrendingAuctions] = useState<Auction[]>([]);
  const [newAuctions, setNewAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const fetchAuctions = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    setLoading(true);
    try {
      // Fetch all auctions without limit for home page
      const [allList, activeList] = await Promise.all([
        auctionService.getAuctions({ limit: 100 }),
        auctionService.getAuctions({ status: 'active', limit: 100 }),
      ]);

      // Deduplicate by id - track globally
      const globalSeen = new Set<string>();
      
      const uniqueAll = allList.filter((a) => {
        if (globalSeen.has(a.id)) return false;
        globalSeen.add(a.id);
        return true;
      });
      
      const uniqueActive = activeList.filter((a) => {
        if (globalSeen.has(a.id)) return false;
        globalSeen.add(a.id);
        return true;
      });

      const safeActiveList = uniqueActive.length
        ? uniqueActive
        : uniqueAll.filter((auction) => auction.status === 'active');
      const activeSource = safeActiveList.length ? safeActiveList : uniqueAll;

      // Featured/trending/new with more results - deduplicate
      const [featuredResult, trendingResult, newResult] = await Promise.allSettled([
        auctionService.getFeaturedAuctions(12),
        auctionService.getTrendingAuctions(12),
        auctionService.getNewAuctions(12),
      ]);

      const featuredList = (featuredResult.status === 'fulfilled' ? featuredResult.value : [])
        .filter((a) => {
          if (globalSeen.has(a.id)) return false;
          globalSeen.add(a.id);
          return true;
        });
      
      const trendingList = (trendingResult.status === 'fulfilled' ? trendingResult.value : [])
        .filter((a) => {
          if (globalSeen.has(a.id)) return false;
          globalSeen.add(a.id);
          return true;
        });

      const newList = (newResult.status === 'fulfilled' ? newResult.value : [])
        .filter((a) => {
          if (globalSeen.has(a.id)) return false;
          globalSeen.add(a.id);
          return true;
        });

      setAllAuctions(uniqueAll);
      setActiveAuctions(activeSource);
      setHotDeals(featuredList.length ? featuredList : activeSource.slice(0, 12));
      setFeaturedAuctions(featuredList);
      setTrendingAuctions(trendingList);
      setNewAuctions(newList);
    } catch {
      setAllAuctions([]);
      setActiveAuctions([]);
      setHotDeals([]);
      setFeaturedAuctions([]);
      setTrendingAuctions([]);
      setNewAuctions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const highestBidAuction =
    [...activeAuctions].sort((a, b) => b.totalBids - a.totalBids)[0] || null;
  const featuredAuction = featuredAuctions[0] || highestBidAuction;
  const hotDealsList = hotDeals.length ? hotDeals : activeAuctions.slice(0, 12);
  const trendingAuctionsList = trendingAuctions.length
    ? trendingAuctions
    : activeAuctions.slice(0, 6);
  const newArrivalsList = newAuctions.length ? newAuctions : activeAuctions.slice(0, 12);

  const getDisplayPrice = (auction: Auction) =>
    auction.currentBid > 0 ? auction.currentBid : auction.startingBid;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        Đang tải dữ liệu đấu giá…
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section - Full Bleed */}
      <section className="relative min-h-[85vh] flex items-center bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1605101232508-283d0cd4909e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaCUyMGF1Y3Rpb258ZW58MXx8fHwxNzc2MDc4MzgxfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/60"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">
                  Nền tảng đấu giá hàng đầu Việt Nam
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Sở hữu
                <br />
                <span className="text-accent">Đẳng cấp</span>
              </h1>

              <p className="text-xl text-white/80 mb-8 max-w-lg">
                Khám phá và đấu giá những sản phẩm xa xỉ, hiếm có từ khắp nơi trên thế giới
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auctions">
                  <Button
                    size="lg"
                    className="bg-yellow-300 text-black hover:bg-yellow-300"
                  >
                    Khám phá ngay <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-yellow-300 text-black hover:bg-yellow-300"
                  >
                    Đăng ký tham gia
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold mb-1">{activeAuctions.length || '—'}</div>
                  <div className="text-sm text-white/70">Sản phẩm</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">5K+</div>
                  <div className="text-sm text-white/70">Thành viên</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">99%</div>
                  <div className="text-sm text-white/70">Hài lòng</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1636289026470-cb40ece1ebc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjB3YXRjaCUyMGF1Y3Rpb258ZW58MXx8fHwxNzc2MDc4MzgxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Luxury watch"
                className="relative rounded-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auction with Countdown */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-urgent/10 border border-urgent/20 rounded-full mb-4">
              <Clock className="h-4 w-4 text-urgent" />
              <span className="text-sm font-semibold text-urgent">ĐẤU GIÁ NỔI BẬT</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">Đang diễn ra</h2>
            <p className="text-muted-foreground text-lg">
              Đừng bỏ lỡ cơ hội sở hữu sản phẩm đẳng cấp
            </p>
          </div>

          {featuredAuction ? (
            <div className="grid lg:grid-cols-2 gap-8 items-center bg-background border border-border rounded-2xl overflow-hidden">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
                <img
                  src={featuredAuction.image}
                  alt={featuredAuction.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-accent text-accent-foreground text-sm font-semibold rounded-full">
                    {featuredAuction.category}
                  </span>
                </div>
              </div>

              <div className="p-8 lg:p-12">
                <h3 className="text-3xl font-bold mb-4">{featuredAuction.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {featuredAuction.description}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-baseline justify-between pb-4 border-b border-border">
                    <span className="text-sm text-muted-foreground">Giá hiện tại</span>
                    <span className="text-3xl font-bold text-accent">
                      {formatCurrency(getDisplayPrice(featuredAuction))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Số lượt đặt giá</span>
                    <span className="text-lg font-semibold">{featuredAuction.totalBids} lượt</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bước giá tối thiểu</span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(featuredAuction.minIncrement)}
                    </span>
                  </div>
                </div>

                <div className="bg-urgent/5 border border-urgent/20 rounded-xl p-6 mb-6">
                  <div className="text-sm text-muted-foreground mb-2">Thời gian còn lại</div>
                  <CountdownTimer endTime={featuredAuction.endTime} />
                </div>

                <Link to={`/auctions/${featuredAuction.id}`}>
                  <Button size="lg" className="w-full gap-2 bg-accent hover:bg-accent/90">
                    Đặt giá ngay <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background p-16 text-center text-muted-foreground">
              Hiện chưa có đấu giá nổi bật nào. Hãy kiểm tra lại sau hoặc xem danh sách đấu giá.
            </div>
          )}
        </div>
      </section>

      {/* Hot Deals - Ending Soon */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-urgent/10 border border-urgent/20 rounded-full mb-3">
                <Clock className="h-4 w-4 text-urgent" />
                <span className="text-xs font-semibold text-urgent uppercase">Sắp kết thúc</span>
              </div>
              <h2 className="text-4xl font-bold mb-3">Ưu đãi Hot</h2>
              <p className="text-muted-foreground text-lg">Đặt giá ngay trước khi hết hạn</p>
            </div>
            <Link to="/auctions">
              <Button variant="outline" className="gap-2">
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotDealsList.length ? (
              hotDealsList.map((auction) => (
                <Link key={auction.id} to={`/auctions/${auction.id}`} className="group">
                  <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={auction.image}
                        alt={auction.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-card/95 backdrop-blur-sm text-xs font-semibold rounded-full">
                          {auction.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="px-2 py-1 bg-urgent text-urgent-foreground text-xs font-bold rounded">
                          <CountdownTimer endTime={auction.endTime} compact />
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-3 group-hover:text-accent transition-colors line-clamp-2 min-h-[3.5rem]">
                        {auction.title}
                      </h3>

                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-xs text-muted-foreground">Giá hiện tại</span>
                        <span className="text-xl font-bold text-accent">
                          {formatCurrency(getDisplayPrice(auction))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground pb-3 border-b border-border mb-3">
                        <span>{auction.totalBids} lượt</span>
                        <span className="text-xs">{auction.seller}</span>
                      </div>

                      <Button className="w-full" variant="outline" size="sm">
                        Đặt giá ngay
                      </Button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                Không có ưu đãi hot nào vào lúc này.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trending Auctions */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full mb-3">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-accent uppercase">Xu hướng</span>
              </div>
              <h2 className="text-4xl font-bold mb-3">Đấu giá được quan tâm</h2>
              <p className="text-muted-foreground text-lg">Những sản phẩm được săn đón nhất</p>
            </div>
            <Link to="/auctions">
              <Button variant="outline" className="gap-2">
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingAuctionsList.length ? (
              trendingAuctionsList.map((auction) => (
                <Link key={auction.id} to={`/auctions/${auction.id}`} className="group">
                  <div className="bg-background border border-border rounded-xl overflow-hidden hover:border-accent transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={auction.image}
                        alt={auction.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-card/95 backdrop-blur-sm text-xs font-semibold rounded-full">
                          {auction.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors line-clamp-2 min-h-[3.5rem]">
                        {auction.title}
                      </h3>

                      <div className="flex items-baseline justify-between mb-4">
                        <span className="text-xs text-muted-foreground">Giá hiện tại</span>
                        <span className="text-2xl font-bold text-accent">
                          {formatCurrency(getDisplayPrice(auction))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{auction.totalBids} lượt đặt giá</span>
                        <CountdownTimer endTime={auction.endTime} compact />
                      </div>

                      <Button className="w-full" variant="outline">
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                Không có đấu giá được quan tâm nào vào lúc này.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full mb-3">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-accent uppercase">Mới nhất</span>
              </div>
              <h2 className="text-4xl font-bold mb-3">Sản phẩm mới</h2>
              <p className="text-muted-foreground text-lg">Những sản phẩm vừa được thêm vào</p>
            </div>
            <Link to="/auctions">
              <Button variant="outline" className="gap-2">
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivalsList.length ? (
              newArrivalsList.map((auction) => (
                <Link key={auction.id} to={`/auctions/${auction.id}`} className="group">
                  <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={auction.image}
                        alt={auction.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-card/95 backdrop-blur-sm text-xs font-semibold rounded-full">
                          {auction.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-3 group-hover:text-accent transition-colors line-clamp-2 min-h-[3.5rem]">
                        {auction.title}
                      </h3>

                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-xs text-muted-foreground">Giá hiện tại</span>
                        <span className="text-xl font-bold text-accent">
                          {formatCurrency(getDisplayPrice(auction))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground pb-3 border-b border-border mb-3">
                        <span>{auction.totalBids} lượt</span>
                        <CountdownTimer endTime={auction.endTime} compact />
                      </div>

                      <Button className="w-full" variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                Không có sản phẩm mới nào vào lúc này.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tại sao chọn chúng tôi</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trải nghiệm đấu giá minh bạch, an toàn và hiện đại nhất
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-6">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">An toàn tuyệt đối</h3>
              <p className="text-muted-foreground leading-relaxed">
                Mọi giao dịch được bảo vệ với công nghệ mã hóa tiên tiến và xác thực đa lớp
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-6">
                <Zap className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Đấu giá thời gian thực</h3>
              <p className="text-muted-foreground leading-relaxed">
                Cập nhật giá đấu tức thì, không trễ, không gián đoạn trong suốt phiên đấu giá
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-6">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sản phẩm chính hãng</h3>
              <p className="text-muted-foreground leading-relaxed">
                100% sản phẩm được xác thực nguồn gốc và kiểm định chất lượng trước khi đấu giá
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Bắt đầu hành trình đấu giá của bạn
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn người dùng đang sở hữu những sản phẩm đẳng cấp mỗi ngày
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auctions">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              >
                Khám phá đấu giá <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Đăng ký miễn phí
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
