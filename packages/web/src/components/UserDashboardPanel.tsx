import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Gavel,
  Trophy,
  Package,
  Wallet,
  Heart,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  ArrowRight,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { readStoredUser, clearAuth } from '../services/authService';
import { cn } from './ui/utils';

interface QuickStats {
  activeBids: number;
  wonAuctions: number;
  myAuctions: number;
  pendingPayments: number;
  watchedAuctions: number;
}

export function UserDashboardPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const user = readStoredUser();

  const handleLogout = () => {
    clearAuth();
    onClose();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', href: '/user/dashboard' },
    { icon: Gavel, label: 'Đấu giá của tôi', href: '/user/auctions' },
    { icon: Clock, label: 'Lịch sử đặt giá', href: '/user/bids' },
    { icon: Trophy, label: 'Sản phẩm đã thắng', href: '/user/won' },
    { icon: Heart, label: 'Danh sách theo dõi', href: '/user/watchlist' },
    { icon: Wallet, label: 'Ví & Thanh toán', href: '/user/wallet' },
    { icon: Bell, label: 'Thông báo', href: '/user/notifications' },
    { icon: User, label: 'Thông tin cá nhân', href: '/user/settings' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-blue-100">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name || ''} className="w-full h-full object-cover rounded-full" />
            ) : (
              <AvatarFallback className="bg-blue-600 text-white text-lg font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-bold text-lg">{user?.name || 'Người dùng'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => { onClose(); navigate(item.href); }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <item.icon className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{item.label}</span>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </button>
          ))}

          {user?.role === 'admin' && (
            <button
              onClick={() => { onClose(); navigate('/admin'); }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
            >
              <Settings className="h-5 w-5" />
              <span>Quản trị</span>
              <Badge className="ml-auto bg-red-500 text-xs">Admin</Badge>
            </button>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
