import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Trophy, TrendingUp, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { readStoredUser } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { onUserNotification, joinUser } from '../lib/socket';
import { toast } from 'sonner';

interface Notification {
  id: string;
  userId: string;
  auctionId: string | null;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const user = readStoredUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    // Join user room to receive notifications
    if (user.id) {
      joinUser(user.id);
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onUserNotification((data) => {
      if (data.type === 'outbid') {
        toast.warning('Bạn đã bị vượt giá!', {
          description: 'Có người đặt giá cao hơn bạn. Hãy đặt lại để giành chiến thắng!',
          duration: 5000,
        });
      } else if (data.type === 'won') {
        toast.success('Chúc mừng bạn đã thắng đấu giá!', {
          description: 'Vui lòng thanh toán để nhận sản phẩm.',
          duration: 5000,
        });
      } else if (data.type === 'auction_ended') {
        toast.info('Phiên đấu giá đã kết thúc', {
          description: 'Xem kết quả trong thông báo.',
          duration: 5000,
        });
      }
      fetchNotifications();
    });
    return unsubscribe;
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark as read', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const getNotificationIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('thắng') || lower.includes('win') || lower.includes('won')) {
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    }
    if (lower.includes('vượt') || lower.includes('outbid') || lower.includes('bị')) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    }
    return <Bell className="h-4 w-4 text-blue-500" />;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Thông báo</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto py-1 px-2">
                Đánh dấu đã đọc
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-accent/10' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) markAsRead(notification.id);
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="absolute top-4 right-4">
                        <span className="h-2 w-2 rounded-full bg-primary block" />
                      </div>
                    )}
                  </div>
                  {notification.auctionId && (
                    <Link
                      to={`/auctions/${notification.auctionId}`}
                      className="block mt-2 text-xs text-primary hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                      }}
                    >
                      Xem chi tiết
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 border-t border-border text-center">
              <Link
                to="/notifications"
                className="text-sm text-primary hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả thông báo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
