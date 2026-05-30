import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Trophy, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  notificationService,
  type Notification,
} from '../services/notificationService';
import { readStoredUser } from '../services/authService';
import { onUserNotification, joinUser } from '../lib/socket';

export function NotificationBell() {
  const user = readStoredUser();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const [list, count] = await Promise.all([
        notificationService.getMyNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setItems(list);
      setUnread(count);
    } catch {
      setItems([]);
      setUnread(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Join user-specific room for real-time notifications
    joinUser(user.id);
    refresh();

    const t = setInterval(refresh, 60_000);
    const off = onUserNotification((payload) => {
      if (payload.userId === Number(user?.id) || String(payload.userId) === user?.id) {
        refresh();
      }
    });
    return () => {
      clearInterval(t);
      off();
    };
  }, [refresh, user?.id]);

  if (!user) return null;

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      await refresh();
      setLoading(false);
    }
  };

  const handleMarkRead = async (n: Notification) => {
    if (!n.isRead) {
      await notificationService.markAsRead(n.id);
      await refresh();
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 relative"
        onClick={handleOpen}
        aria-label="Thông báo"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold">Thông báo</span>
              {unread > 0 && (
                <button
                  type="button"
                  className="text-xs text-accent hover:underline"
                  onClick={async () => {
                    await notificationService.markAllAsRead();
                    await refresh();
                  }}
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Đang tải…</p>
              ) : items.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Chưa có thông báo</p>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                      !n.isRead ? 'bg-accent/5' : ''
                    }`}
                    onClick={() => handleMarkRead(n)}
                  >
                    <div className="flex gap-2 items-start">
                      {n.type === 'won' && (
                        <Trophy className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          {!n.isRead && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              Mới
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {n.message}
                        </p>
                        {n.auctionId && (
                          <Link
                            to={`/auctions/${n.auctionId}`}
                            className="text-xs text-accent hover:underline mt-1 inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Xem phiên đấu giá
                          </Link>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
