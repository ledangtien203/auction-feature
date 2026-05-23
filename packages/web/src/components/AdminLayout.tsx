import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Gavel,
  Users,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
} from 'lucide-react';
import { Button } from './ui/button';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navigation = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý đấu giá', path: '/admin/auctions', icon: Gavel },
    { name: 'Quản lý người dùng', path: '/admin/users', icon: Users },
    { name: 'Quản lý giao dịch', path: '/admin/transactions', icon: Receipt },
    { name: 'Báo cáo & Thống kê', path: '/admin/reports', icon: BarChart3 },
    { name: 'Cài đặt', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-2">
                <img src="/favicon2.jpg" alt="Logo" className="h-10 w-auto" />
                <div>
                  <div className="text-xl font-bold text-gray-900">Admin Panel</div>
                  <div className="text-xs text-gray-500">Đấu Giá Trực Tuyến</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="outline" size="sm">
                  Về trang chủ
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  sessionStorage.removeItem('token');
                  sessionStorage.removeItem('user');
                  navigate('/login');
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r
          transform transition-transform duration-200 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          top-16 lg:top-0
        `}
        >
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}>
                  <div
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        active
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
