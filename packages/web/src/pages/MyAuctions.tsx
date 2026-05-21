import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Gavel, Clock, CheckCircle2, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { auctionService } from '../services/auctionService';
import { readStoredUser } from '../services/authService';
import type { Auction } from '../types/auction';
import { toast } from 'sonner';
import { broadcastSyncEvent } from '../lib/syncStorage';

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'upcoming':
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Sắp bắt đầu</Badge>;
    case 'active':
      return <Badge variant="default"><Gavel className="h-3 w-3 mr-1" />Đang đấu giá</Badge>;
    case 'ended':
      return <Badge variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Đã kết thúc</Badge>;
    case 'completed':
      return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Hoàn thành</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function MyAuctions() {
  const navigate = useNavigate();
  const user = readStoredUser();

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    load();
  }, [user, navigate]);

  const load = async () => {
    try {
      const list = await auctionService.getAuctions();
      const mine = list.filter(a => a.seller === user?.name || a.seller === user?.email);
      setAuctions(mine);
    } catch {
      toast.error('Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingAuction(null);
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
    setIsDialogOpen(true);
  };

  const openEdit = (auction: Auction) => {
    setEditingAuction(auction);
    setForm({
      title: auction.title,
      description: auction.description || '',
      category: auction.category || 'Đồng hồ',
      startingBid: Number(auction.startingBid) || 0,
      minIncrement: Number(auction.minIncrement) || 1000000,
      seller: auction.seller || user?.name || '',
      image: auction.image || '',
      endTimeLocal: auction.endTime
        ? toDatetimeLocalValue(new Date(auction.endTime))
        : toDatetimeLocalValue(new Date(Date.now() + 86400000 * 7)),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim()) {
      toast.error('Tiêu đề và URL ảnh là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      const endIso = new Date(form.endTimeLocal).toISOString();
      if (editingAuction) {
        await auctionService.updateAuction(editingAuction.id, {
          title: form.title,
          description: form.description,
          category: form.category,
          startingBid: form.startingBid,
          minIncrement: form.minIncrement,
          seller: form.seller || user?.name || '—',
          image: form.image,
          endTime: endIso,
        });
        toast.success('Cập nhật thành công!');
      } else {
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
        toast.success('Tạo phiên đấu giá thành công!');
      }
      broadcastSyncEvent('auctions');
      setIsDialogOpen(false);
      load();
    } catch {
      toast.error(editingAuction ? 'Cập nhật thất bại' : 'Tạo phiên thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await auctionService.deleteAuction(id);
      toast.success('Xóa thành công!');
      broadcastSyncEvent('auctions');
      setDeleteConfirm(null);
      load();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const filteredAuctions = auctions.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Phiên đấu giá của tôi</h1>
          <p className="text-muted-foreground">Quản lý các phiên đấu giá bạn đã tạo</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo phiên mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Danh sách phiên ({filteredAuctions.length})
            </CardTitle>
            <Input
              placeholder="Tìm kiếm..."
              className="w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
          ) : filteredAuctions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Bạn chưa tạo phiên đấu giá nào</p>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo phiên đấu giá đầu tiên
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Sản phẩm</th>
                    <th className="text-left py-3 px-2 font-medium">Danh mục</th>
                    <th className="text-right py-3 px-2 font-medium">Giá khởi điểm</th>
                    <th className="text-right py-3 px-2 font-medium">Giá hiện tại</th>
                    <th className="text-center py-3 px-2 font-medium">Số lượt đấu</th>
                    <th className="text-center py-3 px-2 font-medium">Trạng thái</th>
                    <th className="text-right py-3 px-2 font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuctions.map((auction) => (
                    <tr key={auction.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={auction.image}
                            alt={auction.title}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/48x48?text=No+Image';
                            }}
                          />
                          <div>
                            <p className="font-medium line-clamp-1">{auction.title}</p>
                            <p className="text-xs text-muted-foreground">Hết hạn: {auction.endTime
                              ? new Date(auction.endTime).toLocaleDateString('vi-VN')
                              : '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm">{auction.category || '—'}</td>
                      <td className="py-3 px-2 text-right text-sm">{formatCurrency(Number(auction.startingBid))}</td>
                      <td className="py-3 px-2 text-right text-sm font-medium">
                        {formatCurrency(Number(auction.currentBid) || Number(auction.startingBid))}
                      </td>
                      <td className="py-3 px-2 text-center text-sm">{auction.bids?.length || 0}</td>
                      <td className="py-3 px-2 text-center">{getStatusBadge(auction.status || 'upcoming')}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/auctions/${auction.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(auction)}
                            disabled={auction.status === 'completed'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(auction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAuction ? 'Chỉnh sửa phiên đấu giá' : 'Tạo phiên đấu giá mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tiêu đề sản phẩm</Label>
              <Input
                placeholder="VD: Đồng hồ Rolex Submariner"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                placeholder="Mô tả chi tiết sản phẩm..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
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
                <Label>Người bán</Label>
                <Input
                  placeholder="Tên người bán"
                  value={form.seller}
                  onChange={(e) => setForm(f => ({ ...f, seller: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giá khởi điểm (VND)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.startingBid || ''}
                  onChange={(e) => setForm(f => ({ ...f, startingBid: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Bước giá tối thiểu (VND)</Label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={form.minIncrement || ''}
                  onChange={(e) => setForm(f => ({ ...f, minIncrement: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thời gian kết thúc</Label>
              <Input
                type="datetime-local"
                value={form.endTimeLocal}
                onChange={(e) => setForm(f => ({ ...f, endTimeLocal: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>URL hình ảnh</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : editingAuction ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Bạn có chắc chắn muốn xóa phiên đấu giá này? Hành động này không thể hoàn tác.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
