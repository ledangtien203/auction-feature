import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Info,
  LogIn,
  Mail,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { readStoredUser } from '../services/authService';
import { api } from '../lib/api';
import { UserDashboardPanel } from './UserDashboardPanel';

interface SiteSettings {
  siteName: string;
  siteEmail: string;
  supportPhone: string;
  address: string;
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = readStoredUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; currentPrice: number; image?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Đấu Giá Trực Tuyến',
    siteEmail: 'contact@daugia.com',
    supportPhone: '1900 1234',
    address: '',
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const { auctionService } = await import('../services/auctionService');
          const results = await auctionService.getAuctions({ search: searchQuery.trim(), limit: 5 });
          setSearchResults(results);
          setShowResults(true);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const data = await api<{ settings: SiteSettings }>('/api/site-info');
        setSiteSettings(data.settings);
      } catch {
        // keep defaults
      }
    };
    fetchSiteSettings();
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* User Dashboard Slide-over Panel */}
      {showUserPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setShowUserPanel(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <UserDashboardPanel onClose={() => setShowUserPanel(false)} />
          </div>
        </>
      )}

      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-auto lg:h-20 py-3">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
                <img
                  src="/favicon2.jpg"
                  alt="Đấu Giá Trực Tuyến"
                  className="h-12 w-auto object-contain"
                />
              </Link>

              <div className="flex-1 max-w-sm" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        setShowResults(false);
                        navigate(`/auctions?search=${encodeURIComponent(searchQuery.trim())}`);
                      }
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-red-200 rounded-full text-sm text-red-600 placeholder:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <div className="h-3.5 w-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        to={`/auctions/${result.id}`}
                        onClick={() => {
                          setShowResults(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-accent transition-colors"
                      >
                        {result.image ? (
                          <img src={result.image} alt={result.title} className="h-10 w-10 object-cover rounded" />
                        ) : (
                          <div className="h-10 w-10 bg-accent rounded flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.title}</p>
                          <p className="text-xs text-primary font-semibold">
                            {new Intl.NumberFormat('vi-VN').format(result.currentPrice)} đ
                          </p>
                        </div>
                      </Link>
                    ))}
                    <Link
                      to={`/auctions?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setShowResults(false);
                        setSearchQuery('');
                      }}
                      className="block p-3 text-center text-sm text-primary hover:bg-accent border-t border-border transition-colors"
                    >
                      Xem tất cả kết quả
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-1">
              <Link to="/">
                <Button
                  variant={isActive('/') && location.pathname === '/' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden md:inline">Trang chủ</span>
                </Button>
              </Link>
              <Link to="/auctions">
                <Button
                  variant={isActive('/auctions') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  <span className="hidden md:inline">Đấu giá</span>
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant={isActive('/about') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Info className="h-4 w-4" />
                  <span className="hidden md:inline">Về chúng tôi</span>
                </Button>
              </Link>
              <NotificationBell />
              <div className="h-6 w-px bg-border mx-2"></div>
              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-accent transition-all"
                  onClick={() => setShowUserPanel(true)}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name ?? 'User'}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Đăng nhập</span>
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-20rem)]">
        <Outlet />
      </main>

      <footer className="bg-card border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <img src="/favicon2.jpg" alt="Đấu Giá Trực Tuyến" className="h-12 w-auto object-contain" />
              </Link>
              <p className="text-sm text-muted-foreground max-w-md">
                Nền tảng đấu giá trực tuyến uy tín hàng đầu Việt Nam. Mang đến trải nghiệm đấu giá minh bạch, an toàn và hiện đại.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Liên kết</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Trang chủ</Link></li>
                <li><Link to="/auctions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Đấu giá</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Liên hệ</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /><span className="text-sm text-muted-foreground">{siteSettings.address || '123 Đường ABC, Q.1, TP.HCM'}</span></li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" /><span className="text-sm text-muted-foreground">{siteSettings.supportPhone || '(028) 1234 5678'}</span></li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" /><span className="text-sm text-muted-foreground">{siteSettings.siteEmail || 'info@daugia.vn'}</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {siteSettings.siteName || 'Đấu Giá Trực Tuyến'}. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
