import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Gavel,
  Trophy,
  Package,
  Wallet,
  Heart,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { readStoredUser, clearAuth } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import { cn } from '../ui/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

interface UserDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function UserDashboardLayout({ children, title, subtitle }: UserDashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = readStoredUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadNotifications(count);
      } catch (e) {
        console.error('Failed to fetch notifications', e);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const navItems: NavItem[] = [
    { label: 'Tổng quan', icon: LayoutDashboard, href: '/user/dashboard' },
    { label: 'Đấu giá của tôi', icon: Gavel, href: '/user/auctions' },
    { label: 'Lịch sử đặt giá', icon: Package, href: '/user/bids' },
    { label: 'Sản phẩm đã thắng', icon: Trophy, href: '/user/won' },
    { label: 'Ví & Thanh toán', icon: Wallet, href: '/user/wallet' },
    { label: 'Danh sách theo dõi', icon: Heart, href: '/user/watchlist' },
    { label: 'Thông báo', icon: Bell, href: '/user/notifications', badge: unreadNotifications },
    { label: 'Cài đặt', icon: Settings, href: '/user/settings' },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed ? "justify-center" : "justify-start"
      )}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
          <Gavel className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg">Đấu Giá</span>
            <span className="text-xs text-muted-foreground">Trang cá nhân</span>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className={cn(
        "px-4 py-4 border-b border-sidebar-border",
        collapsed ? "flex justify-center" : ""
      )}>
        {collapsed ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-accent/10 text-accent">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-accent/10 text-accent text-lg">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-accent")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-red-500 text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </>
              )}
              {collapsed && item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Đăng xuất</span>}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full"
        )}
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-sidebar-accent lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/auctions')}
                className="gap-2"
              >
                <Gavel className="h-4 w-4" />
                <span className="hidden sm:inline">Đấu giá mới</span>
              </Button>
              <Link to="/" className="hidden md:flex">
                <Button variant="ghost" size="icon">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
