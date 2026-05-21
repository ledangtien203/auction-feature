import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Trophy, DollarSign, Package, User, Plus, LogOut, Settings } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { readStoredUser, clearAuth } from '../../services/authService';
import { auctionService } from '../../services/auctionService';
import { broadcastSyncEvent } from '../../lib/syncStorage';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function UserDashboard() {
  const navigate = useNavigate();
  const user = readStoredUser();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Đồng hồ',
    startingBid: 0,
    minIncrement: 1000000,
    seller: '',
    image: '',
    endTimeLocal: toDatetimeLocalValue(new Date(Date.now() + 86400000 * 7)),
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    activeBids: 0,
    wonAuctions: 0,
    myAuctions: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const allAuctions = await auctionService.getAuctions();
        const myBids = await auctionService.getMyBids();
        const wonAuctions = await auctionService.getWonAuctions();

        const activeBids = myBids.length;
        const myAuctionList = allAuctions.filter(a => a.seller === user.name || a.seller === user.email);
        const completedAuctions = myAuctionList.filter(a => a.status === 'completed' || a.status === 'ended');

        const revenue = completedAuctions.reduce((sum, a) => {
          const bid = a.bids?.[a.bids.length - 1];
          return sum + (bid ? Number(bid.amount) : Number(a.currentBid || 0));
        }, 0);

        setStats({
          activeBids,
          wonAuctions: wonAuctions.length,
          myAuctions: myAuctionList.length,
          revenue,
        });
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    };

    fetchStats();
  }, [user, navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const openCreate = () => {
    setForm({
      title: '',
      description: '',
      category: 'Đồng hồ',
      startingBid: 0,
      minIncrement: 1000000,
      seller: user?.name || '',
      image: '',
      endTimeLocal: toDatetimeLocalValue(new Date(Date.now() + 86400000 * 7)),
    });
    setIsCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.image.trim()) {
      toast.error('Tiêu đề và URL ảnh là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      const endIso = new Date(form.endTimeLocal).toISOString();
      await auctionService.adminCreateAuction({
        title: form.title,
        description: form.description,
        category: form.category,
        startingBid: form.startingBid,
        minIncrement: form.minIncrement,
        seller: form.seller || user?.name || '—',
        image: form.image,
        endTime: endIso,
        status: 'upcoming',
      });
      toast.success('Đã tạo phiên đấu giá thành công!');
      broadcastSyncEvent('auctions');
      setIsCreateOpen(false);
      navigate('/auctions');
    } catch {
      toast.error('Tạo phiên đấu giá thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Tài khoản của tôi</h1>
        <p className="text-muted-foreground">Quản lý thông tin và hoạt động đấu giá</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <User className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Vai trò</p>
              <p className="text-sm font-medium capitalize">{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
            </div>
            <div className="h-px bg-border" />
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </CardContent>
        </Card>

        {/* Stats cards */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Thống kê
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:border-accent transition-all" onClick={() => navigate('/my-bids')}>
                <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Gavel className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">{stats.activeBids}</p>
                  <p className="text-sm text-muted-foreground">Đang đấu giá</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-accent transition-all" onClick={() => navigate('/won-auctions')}>
                <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold">{stats.wonAuctions}</p>
                  <p className="text-sm text-muted-foreground">Đã thắng</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-accent transition-all" onClick={() => navigate('/my-auctions')}>
                <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold">{stats.myAuctions}</p>
                  <p className="text-sm text-muted-foreground">Phiên đã đăng</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">{stats.revenue.toLocaleString('vi-VN')}</p>
                  <p className="text-sm text-muted-foreground">Doanh thu (VND)</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Create auction CTA */}
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent rounded-lg shrink-0">
                  <Plus className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Tạo phiên đấu giá mới</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bạn muốn bán sản phẩm? Tạo ngay một phiên đấu giá mới để bắt đầu.
                  </p>
                  <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo phiên đấu giá
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create auction dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Tạo phiên đấu giá mới</CardTitle>
              <CardDescription>Điền thông tin chi tiết về sản phẩm bạn muốn bán</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ct-title">Tiêu đề sản phẩm</Label>
                <Input
                  id="ct-title"
                  placeholder="VD: Đồng hồ Rolex Submariner"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ct-desc">Mô tả</Label>
                <Textarea
                  id="ct-desc"
                  placeholder="Mô tả chi tiết sản phẩm..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Đồng hồ">Đồng hồ</SelectItem>
                      <SelectItem value="Máy ảnh">Máy ảnh</SelectItem>
                      <SelectItem value="Nội thất">Nội thất</SelectItem>
                      <SelectItem value="Trang sức">Trang sức</SelectItem>
                      <SelectItem value="Xe cổ">Xe cổ</SelectItem>
                      <SelectItem value="Nghệ thuật">Nghệ thuật</SelectItem>
                      <SelectItem value="Thời trang">Thời trang</SelectItem>
                      <SelectItem value="Sưu tầm">Sưu tầm</SelectItem>
                      <SelectItem value="Rượu vang">Rượu vang</SelectItem>
                      <SelectItem value="Nhạc cụ">Nhạc cụ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct-seller">Người bán</Label>
                  <Input
                    id="ct-seller"
                    placeholder="Tên người bán"
                    value={form.seller}
                    onChange={(e) => setForm((f) => ({ ...f, seller: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ct-bid">Giá khởi điểm (VND)</Label>
                  <Input
                    id="ct-bid"
                    type="number"
                    placeholder="0"
                    value={form.startingBid || ''}
                    onChange={(e) => setForm((f) => ({ ...f, startingBid: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct-inc">Bước giá tối thiểu (VND)</Label>
                  <Input
                    id="ct-inc"
                    type="number"
                    placeholder="1000000"
                    value={form.minIncrement || ''}
                    onChange={(e) => setForm((f) => ({ ...f, minIncrement: Number(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ct-end">Thời gian kết thúc</Label>
                <Input
                  id="ct-end"
                  type="datetime-local"
                  value={form.endTimeLocal}
                  onChange={(e) => setForm((f) => ({ ...f, endTimeLocal: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ct-img">URL hình ảnh</Label>
                <Input
                  id="ct-img"
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                />
                {form.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-40 w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreate} disabled={saving} className="gap-2">
                <Plus className="h-4 w-4" />
                {saving ? 'Đang tạo...' : 'Tạo phiên đấu giá'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
