import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Gavel,
  Home,
  Package,
  Info,
  LogIn,
  Mail,
  MapPin,
  Phone,
  LogOut,
  Trophy,
  LayoutDashboard,
  UserCircle,
  Settings,
  Hammer,
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { NotificationBell } from './NotificationBell';
import { readStoredUser, clearAuth } from '../services/authService';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = readStoredUser();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 h-auto lg:h-20">
            <div className="flex items-center gap-3 flex-1 min-w-[220px]">
              <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
                <div className="p-2 bg-accent rounded-lg group-hover:scale-110 transition-transform">
                  <Gavel className="h-7 w-7 text-accent-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground tracking-tight">ĐẤU GIÁ</span>
                  <span className="text-xs text-muted-foreground tracking-wider">TRỰC TUYẾN</span>
                </div>
              </Link>
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
              <div className="h-6 w-px bg-border mx-2"></div>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/user/dashboard" className="cursor-pointer gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-bids" className="cursor-pointer gap-2">
                        <Gavel className="h-4 w-4" />
                        Đang đấu giá
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/won-auctions" className="cursor-pointer gap-2">
                        <Trophy className="h-4 w-4" />
                        Đã thắng
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-auctions" className="cursor-pointer gap-2">
                        <Hammer className="h-4 w-4" />
                        Phiên đấu giá của tôi
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer gap-2">
                        <Settings className="h-4 w-4" />
                        Cài đặt
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer gap-2">
                            <UserCircle className="h-4 w-4" />
                            Quản trị hệ thống
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer gap-2"
                      onClick={() => {
                        clearAuth();
                        navigate('/');
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <div className="p-2 bg-accent rounded-lg">
                  <Gavel className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">ĐẤU GIÁ TRỰC TUYẾN</span>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground max-w-md">
                Nền tảng đấu giá trực tuyến uy tín hàng đầu Việt Nam. Mang đến trải nghiệm đấu giá
                minh bạch, an toàn và hiện đại.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Liên kết</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auctions"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Đấu giá
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Liên hệ</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">123 Đường ABC, Q.1, TP.HCM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">(028) 1234 5678</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">info@daugia.vn</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © 2026 Đấu Giá Trực Tuyến. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
