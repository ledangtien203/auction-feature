import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Gavel, Plus, User, LogOut, Menu, X, Bell, Settings, Heart, Wallet, Trophy } from 'lucide-react';
import { useState } from 'react';
import { readStoredUser, clearAuth } from '../services/authService';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';

export function UserDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = readStoredUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Tổng quan', href: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Đấu giá của tôi', href: '/user/auctions', icon: Gavel },
    { name: 'Lịch sử đặt giá', href: '/user/bids', icon: Gavel },
    { name: 'Sản phẩm đã thắng', href: '/user/won', icon: Trophy },
    { name: 'Danh sách theo dõi', href: '/user/watchlist', icon: Heart },
    { name: 'Ví & Thanh toán', href: '/user/wallet', icon: Wallet },
    { name: 'Thông tin cá nhân', href: '/user/settings', icon: User },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon2.jpg" alt="Đấu Giá" className="h-10 w-auto" />
              <h1 className="text-lg font-semibold text-blue-600">ĐẤU GIÁ ONLINE</h1>
            </Link>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              <Link
                to="/"
                className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Trang chủ</span>
              </Link>

              <button 
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <Avatar className="h-12 w-12">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name || ''} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-blue-600 text-white text-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{user?.name || 'Người dùng'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Quản trị</span>
                  </Link>
                )}

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-6"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
