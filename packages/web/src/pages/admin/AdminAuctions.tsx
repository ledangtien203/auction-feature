import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Bell, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { auctionService } from '../../services/auctionService';
import type { Auction } from '../../types/auction';
import { toast } from 'sonner';
import { broadcastSyncEvent } from '../../lib/syncStorage';

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Đồng hồ',
    status: 'upcoming' as Auction['status'],
    startingBid: 0,
    minIncrement: 1000000,
    seller: '',
    image: '',
    endTimeLocal: toDatetimeLocalValue(new Date(Date.now() + 86400000 * 7)),
  });

  const load = async () => {
    try {
      const list = await auctionService.adminListAuctions();
      setAuctions(list);
    } catch {
      toast.error('Không tải được danh sách đấu giá');
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const openAdd = () => {
    setEditingAuction(null);
    setForm({
      title: '',
      description: '',
      category: 'Đồng hồ',
      status: 'upcoming',
      startingBid: 0,
      minIncrement: 1000000,
      seller: '',
      image: '',
      endTimeLocal: toDatetimeLocalValue(new Date(Date.now() + 86400000 * 7)),
    });
    setIsDialogOpen(true);
  };

  const openEdit = (auction: Auction) => {
    setEditingAuction(auction);
    setForm({
      title: auction.title,
      description: auction.description,
      category: auction.category,
      status: auction.status,
      startingBid: auction.startingBid,
      minIncrement: auction.minIncrement,
      seller: auction.seller,
      image: auction.image,
      endTimeLocal: toDatetimeLocalValue(new Date(auction.endTime)),
    });
    setIsDialogOpen(true);
  };

  const handleNotifyWinner = async (id: string) => {
    try {
      const res = await auctionService.adminNotifyWinner(id);
      toast.success(res.message);
      broadcastSyncEvent('auctions');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gửi thông báo thất bại');
    }
  };

  const handleProcessExpired = async () => {
    try {
      const res = await auctionService.adminProcessExpiredAuctions();
      toast.success(`Đã xử lý ${res.processed} phiên hết hạn`);
      broadcastSyncEvent('auctions');
      await load();
    } catch {
      toast.error('Không xử lý được phiên hết hạn');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa phiên đấu giá này?')) return;
    try {
      await auctionService.adminDeleteAuction(id);
      setAuctions((prev) => prev.filter((a) => a.id !== id));
      broadcastSyncEvent('auctions');
      toast.success('Đã xóa đấu giá thành công');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim()) {
      toast.error('Tiêu đề và URL ảnh là bắt buộc');
      return;
    }
    try {
      const endIso = new Date(form.endTimeLocal).toISOString();
      if (editingAuction) {
        const updated = await auctionService.adminUpdateAuction(editingAuction.id, {
          title: form.title,
          description: form.description,
          category: form.category,
          status: form.status,
          startingBid: form.startingBid,
          minIncrement: form.minIncrement,
          seller: form.seller,
          image: form.image,
          endTime: endIso,
        });
        setAuctions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        broadcastSyncEvent('auctions');
        toast.success('Đã cập nhật đấu giá');
      } else {
        const created = await auctionService.adminCreateAuction({
          title: form.title,
          description: form.description,
          category: form.category,
          status: form.status,
          startingBid: form.startingBid,
          minIncrement: form.minIncrement,
          seller: form.seller || '—',
          image: form.image,
          endTime: endIso,
        });
        setAuctions((prev) => [...prev, created]);
        broadcastSyncEvent('auctions');
        toast.success('Đã thêm đấu giá mới');
      }
      setIsDialogOpen(false);
      setEditingAuction(null);
    } catch {
      toast.error('Lưu thất bại');
    }
  };

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch =
      auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: auctions.length,
    active: auctions.filter((a) => a.status === 'active').length,
    upcoming: auctions.filter((a) => a.status === 'upcoming').length,
    ended: auctions.filter((a) => a.status === 'ended').length,
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Đang tải…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý đấu giá</h1>
          <p className="text-muted-foreground">Quản lý tất cả phiên đấu giá trên hệ thống</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={handleProcessExpired}>
            <Clock className="h-4 w-4" />
            Kết thúc phiên hết giờ
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button
              onClick={() => {
                openAdd();
                setIsDialogOpen(true);
              }}
              className="gap-2 bg-accent hover:bg-accent/90"
            >
              <Plus className="h-4 w-4" />
              Thêm đấu giá mới
            </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAuction ? 'Chỉnh sửa đấu giá' : 'Thêm đấu giá mới'}</DialogTitle>
              <DialogDescription>Điền thông tin chi tiết về phiên đấu giá</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Nhập tiêu đề sản phẩm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Nhập mô tả chi tiết"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Danh mục</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
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
                      <SelectItem value="Xe thuyền">Xe thuyền</SelectItem>
                      <SelectItem value="Nhạc cụ">Nhạc cụ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, status: v as Auction['status'] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang diễn ra</SelectItem>
                      <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                      <SelectItem value="ended">Đã kết thúc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startingBid">Giá khởi điểm (VND)</Label>
                  <Input
                    id="startingBid"
                    type="number"
                    value={form.startingBid || ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startingBid: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minIncrement">Bước giá (VND)</Label>
                  <Input
                    id="minIncrement"
                    type="number"
                    value={form.minIncrement || ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minIncrement: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Kết thúc</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={form.endTimeLocal}
                  onChange={(e) => setForm((f) => ({ ...f, endTimeLocal: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seller">Người bán</Label>
                <Input
                  id="seller"
                  value={form.seller}
                  onChange={(e) => setForm((f) => ({ ...f, seller: e.target.value }))}
                  placeholder="Nhập tên người bán"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">URL hình ảnh</Label>
                <Input
                  id="image"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-accent">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Tổng đấu giá</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success mb-1">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Đang diễn ra</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary mb-1">{stats.upcoming}</div>
            <div className="text-sm text-muted-foreground">Sắp diễn ra</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-muted-foreground mb-1">{stats.ended}</div>
            <div className="text-sm text-muted-foreground">Đã kết thúc</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, danh mục, người bán..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang diễn ra</SelectItem>
            <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
            <SelectItem value="ended">Đã kết thúc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đấu giá ({filteredAuctions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá hiện tại</TableHead>
                <TableHead>Lượt đặt</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuctions.map((auction) => (
                <TableRow key={auction.id} className="hover:bg-accent/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={auction.image}
                        alt={auction.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{auction.title}</div>
                        <div className="text-sm text-muted-foreground">{auction.seller}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-accent/10 text-accent border-accent/20"
                    >
                      {auction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(auction.currentBid || auction.startingBid)}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{auction.totalBids}</span> lượt
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={auction.status === 'active' ? 'default' : 'secondary'}
                      className={
                        auction.status === 'active'
                          ? 'bg-success text-success-foreground'
                          : auction.status === 'upcoming'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }
                    >
                      {auction.status === 'active'
                        ? 'Đang diễn ra'
                        : auction.status === 'upcoming'
                          ? 'Sắp diễn ra'
                          : 'Đã kết thúc'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/auctions/${auction.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {(auction.status === 'active' || auction.status === 'ended') &&
                        auction.totalBids > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Kết thúc & thông báo người thắng"
                            onClick={() => handleNotifyWinner(auction.id)}
                            className="hover:bg-accent/10 hover:text-accent"
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(auction)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(auction.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
