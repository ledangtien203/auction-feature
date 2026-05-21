import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { AuctionCard } from '../components/AuctionCard';
import { auctionService } from '../services/auctionService';
import type { Auction } from '../types/auction';
import { addSyncEventListener } from '../lib/syncStorage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';

export function Auctions() {
  const [allAuctions, setAllAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await auctionService.getAuctions({});
        if (!cancelled) setAllAuctions(list);
      } catch {
        if (!cancelled) setAllAuctions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = addSyncEventListener((type) => {
      if (type !== 'auctions') return;
      auctionService
        .getAuctions({})
        .then(setAllAuctions)
        .catch(() => setAllAuctions([]));
    });

    return cleanup;
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(allAuctions.map((a) => a.category))),
    [allAuctions]
  );

  const filteredAuctions = allAuctions.filter((auction) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      auction.title.toLowerCase().includes(q) ||
      auction.description.toLowerCase().includes(q) ||
      auction.category.toLowerCase().includes(q) ||
      auction.seller.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || auction.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div>
      {/* Hero Search Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Khám phá đấu giá</h1>
            <p className="text-lg text-white/80">
              Tìm kiếm và tham gia các phiên đấu giá đang diễn ra
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative text-foreground">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm, danh mục..."
                className="pl-12 h-14 text-lg bg-card text-foreground placeholder:text-muted-foreground border-0 shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Tìm kiếm đấu giá"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="bg-card border border-border rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">Bộ lọc</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang diễn ra</SelectItem>
                <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                <SelectItem value="ended">Đã kết thúc</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Đang lọc:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Tìm kiếm: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {statusFilter === 'active'
                      ? 'Đang diễn ra'
                      : statusFilter === 'upcoming'
                        ? 'Sắp diễn ra'
                        : 'Đã kết thúc'}
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {categoryFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? (
              'Đang tải…'
            ) : (
              <>
                Hiển thị{' '}
                <span className="font-semibold text-foreground">{filteredAuctions.length}</span> kết
                quả
              </>
            )}
          </p>
        </div>

        {/* Auction Grid */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Đang tải đấu giá…</div>
        ) : filteredAuctions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy kết quả</h3>
            <p className="text-muted-foreground mb-6">Thử điều chỉnh bộ lọc hoặc tìm kiếm khác</p>
            {hasActiveFilters && (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
              >
                Xóa tất cả bộ lọc
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
