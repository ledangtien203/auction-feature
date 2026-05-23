import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, Trophy, TrendingUp, Clock, Check, Trash2, Loader2, AlertCircle, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { notificationService } from '../../services/notificationService';

interface Notification {
  id: string;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
  auctionId?: string;
}

export function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    notificationService.getMyNotifications().then(setNotifications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { toast.error('Không thể đánh dấu'); }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả');
    } catch { toast.error('Lỗi'); }
  };

  const filtered = notifications.filter(n => filter === 'unread' ? !n.isRead : true);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  const getIcon = (title: string) => {
    const l = title.toLowerCase();
    if (l.includes('thắng') || l.includes('win')) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (l.includes('vượt') || l.includes('outbid')) return <TrendingUp className="h-5 w-5 text-red-500" />;
    if (l.includes('kết thúc')) return <Clock className="h-5 w-5 text-blue-500" />;
    return <Bell className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {unreadCount > 0 && <Badge variant="outline" className="gap-1 bg-red-50 text-red-600 border-red-200"><BellOff className="h-3 w-3" />{unreadCount} chưa đọc</Badge>}
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2"><CheckCheck className="h-4 w-4" />Đánh dấu đã đọc</Button>}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Chưa đọc ({unreadCount})</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Card key={i}><CardContent className="p-4"><div className="flex gap-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1"><Skeleton className="h-5 w-48 mb-2" /><Skeleton className="h-4 w-3/4" /></div></div></CardContent></Card>)}</div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center"><Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" /><h3 className="text-lg font-semibold mb-2">{filter === 'all' ? 'Chưa có thông báo nào' : 'Tất cả thông báo đã được đọc'}</h3></Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((n) => (
                <Card key={n.id} className={`transition-all hover:shadow-md ${!n.isRead ? 'bg-accent/5' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{getIcon(n.title)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><h4 className="font-semibold">{n.title}</h4>{!n.isRead && <span className="h-2 w-2 rounded-full bg-accent" />}</div>
                            {n.message && <p className="text-sm text-muted-foreground mt-1">{n.message}</p>}
                            <p className="text-xs text-muted-foreground mt-2">{formatTime(n.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!n.isRead && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead(n.id)}><Check className="h-4 w-4" /></Button>}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(n.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        {n.auctionId && <Link to={`/auctions/${n.auctionId}`} className="inline-flex items-center gap-2 text-sm text-accent hover:underline mt-2" onClick={() => !n.isRead && markAsRead(n.id)}>Xem chi tiết đấu giá</Link>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Xóa thông báo?</AlertDialogTitle><AlertDialogDescription>Thông báo này sẽ bị xóa vĩnh viễn.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={() => { setNotifications(prev => prev.filter(n => n.id !== deleteId)); setDeleteId(null); }} className="bg-red-500 hover:bg-red-600">Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
