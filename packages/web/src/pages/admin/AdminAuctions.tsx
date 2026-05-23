import { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Bell, Clock, Package, ImageIcon } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { auctionService } from '../../services/auctionService';
import type { Auction } from '../../types/auction';
import { toast } from 'sonner';
import { broadcastSyncEvent } from '../../lib/syncStorage';
import { api } from '../../lib/api';

function statusIdToLabel(id: number): string {
  const map: Record<number, string> = { 1: 'active', 2: 'ended', 3: 'cancelled' };
  return map[id] ?? 'active';
}

function statusLabelToId(label: string): number {
  const map: Record<string, number> = { active: 1, ended: 2, cancelled: 3 };
  return map[label] ?? 1;
}

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Product {
  id: number;
  name: string;
  title: string;
  description: string | null;
  image: string | null;
  categoryId: number | null;
  categoryName: string | null;
  startPrice: number;
  status: string;
  sellerId: number;
  sellerName: string;
  auctionCount: number;
  createdAt: string;
}

interface AuctionTime {
  id: number;
  title: string;
  minutes: number;
}

type TabType = 'all' | 'active' | 'ended' | 'upcoming';

export function AdminAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [auctionTimes, setAuctionTimes] = useState<AuctionTime[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const fetchedRef = useRef(false);

  const [auctionForm, setAuctionForm] = useState({
    productId: '',
    startPrice: 0,
    bidIncrement: 1000,
    durationMinutes: 15,
    endTimeLocal: toDatetimeLocalValue(new Date(Date.now() + 86400000 * 7)),
  });

  const [productForm, setProductForm] = useState({
    name: '',
    title: '',
    description: '',
    categoryId: '',
    image: '',
    startPrice: 0,
    sellerId: 1,
  });

  const load = async () => {
    try {
      const [auctionList, productList, timeList, categoryList] = await Promise.all([
        auctionService.adminListAuctions(),
        api<Product[]>('/api/admin/products'),
        api<AuctionTime[]>('/api/auction-times'),
        api<{ id: number; name: string }[]>('/api/admin/categories'),
      ]);
      setAuctions(auctionList);
      setProducts(productList);
      setAuctionTimes(timeList);
      setCategories(categoryList);
    } catch {
      toast.error('Không tải được dữ liệu');
      setAuctions([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    load();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const openAddAuction = () => {
    setEditingAuction(null);
    const defaultProduct = products[0];
    setAuctionForm({
      productId: defaultProduct ? String(defaultProduct.id) : '',
      startPrice: 0,
      bidIncrement: 1000,
      durationMinutes: 15,
      endTimeLocal: toDatetimeLocalValue(new Date(Date.now() + 86400000 * 7)),
    });
    setIsAuctionDialogOpen(true);
  };

  const openEditAuction = (auction: Auction) => {
    setEditingAuction(auction);
    setAuctionForm({
      productId: String(auction.productId),
      startPrice: auction.startPrice,
      bidIncrement: auction.bidIncrement,
      durationMinutes: auction.durationMinutes,
      endTimeLocal: toDatetimeLocalValue(new Date(auction.endTime)),
    });
    setIsAuctionDialogOpen(true);
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      title: '',
      description: '',
      categoryId: '',
      image: '',
      startPrice: 0,
      sellerId: 1,
    });
    setIsProductDialogOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      title: product.title,
      description: product.description || '',
      categoryId: product.categoryId ? String(product.categoryId) : '',
      image: product.image || '',
      startPrice: product.startPrice,
      sellerId: product.sellerId,
    });
    setIsProductDialogOpen(true);
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

  const handleDeleteAuction = async (id: string) => {
    if (!confirm('Xóa phiên đấu giá này?')) return;
    try {
      await auctionService.adminDeleteAuction(id);
      setAuctions((prev) => prev.filter((a) => a.id !== id));
      broadcastSyncEvent('auctions');
      toast.success('Đã xóa đấu giá');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleSaveAuction = async () => {
    if (!auctionForm.productId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    if (!auctionForm.startPrice || auctionForm.startPrice <= 0) {
      toast.error('Giá khởi điểm phải lớn hơn 0');
      return;
    }
    try {
      if (editingAuction) {
        const updated = await auctionService.adminUpdateAuction(editingAuction.id, {
          statusId: 1,
          startPrice: auctionForm.startPrice,
          bidIncrement: auctionForm.bidIncrement,
          endTime: new Date(auctionForm.endTimeLocal).toISOString(),
        });
        setAuctions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        toast.success('Đã cập nhật đấu giá');
      } else {
        const created = await auctionService.adminCreateAuction({
          productId: Number(auctionForm.productId),
          sellerId: 1,
          startPrice: auctionForm.startPrice,
          bidIncrement: auctionForm.bidIncrement,
          durationMinutes: auctionForm.durationMinutes,
          statusId: 1,
        });
        setAuctions((prev) => [created, ...prev]);
        toast.success('Đã tạo đấu giá mới');
      }
      broadcastSyncEvent('auctions');
      setIsAuctionDialogOpen(false);
      setEditingAuction(null);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Lưu thất bại');
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) {
      toast.error('Tên sản phẩm là bắt buộc');
      return;
    }
    try {
      const payload = {
        name: productForm.name,
        title: productForm.title || productForm.name,
        description: productForm.description || null,
        categoryId: productForm.categoryId ? Number(productForm.categoryId) : null,
        image: productForm.image || null,
        startPrice: productForm.startPrice,
        status: 'active',
        sellerId: productForm.sellerId,
      };

      if (editingProduct) {
        const updated = await api<Product>(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success('Đã cập nhật sản phẩm');
      } else {
        const created = await api<Product>('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setProducts((prev) => [created, ...prev]);
        toast.success('Đã tạo sản phẩm mới');
      }
      setIsProductDialogOpen(false);
      setEditingProduct(null);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Lưu thất bại');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await api(`/api/admin/products/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Đã xóa sản phẩm');
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Xóa thất bại');
    }
  };

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch =
      auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (auction.seller || '').toLowerCase().includes(searchQuery.toLowerCase());
    const statusLabel = statusIdToLabel(auction.statusId);
    let matchesTab = true;
    if (activeTab === 'active') matchesTab = statusLabel === 'active';
    else if (activeTab === 'ended') matchesTab = statusLabel === 'ended';
    else if (activeTab === 'upcoming') matchesTab = statusLabel === 'active' && new Date(auction.startTime) > new Date();
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: auctions.length,
    active: auctions.filter((a) => a.statusId === 1).length,
    ended: auctions.filter((a) => a.statusId === 2).length,
    cancelled: auctions.filter((a) => a.statusId === 3).length,
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Đang tải…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý đấu giá</h1>
          <p className="text-muted-foreground">Quản lý sản phẩm và phiên đấu giá</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={handleProcessExpired}>
            <Clock className="h-4 w-4" />
            Kết thúc phiên hết giờ
          </Button>
          <Button variant="outline" className="gap-2" onClick={openAddProduct}>
            <Package className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
          <Button onClick={openAddAuction} className="gap-2 bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Thêm đấu giá
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Tổng đấu giá</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success mb-1">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Đang diễn ra</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-muted/20 to-muted/10 border-muted/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-muted-foreground mb-1">{stats.ended}</div>
            <div className="text-sm text-muted-foreground">Đã kết thúc</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-destructive mb-1">{stats.cancelled}</div>
            <div className="text-sm text-muted-foreground">Đã hủy</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">Đang diễn ra ({stats.active})</TabsTrigger>
          <TabsTrigger value="ended">Đã kết thúc ({stats.ended})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm theo tên, danh mục, người bán..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Auctions Table */}
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
              {filteredAuctions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không có đấu giá nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredAuctions.map((auction) => (
                  <TableRow key={auction.id} className="hover:bg-accent/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {auction.image ? (
                          <img src={auction.image} alt={auction.title} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{auction.title}</div>
                          <div className="text-sm text-muted-foreground">{auction.seller}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                        {auction.category || 'Không có'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(auction.currentPrice || auction.startPrice)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{auction.totalBids}</span> lượt
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          auction.statusId === 1
                            ? 'bg-success text-success-foreground'
                            : auction.statusId === 2
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-destructive text-destructive-foreground'
                        }
                      >
                        {auction.statusId === 1 ? 'Đang diễn ra' : auction.statusId === 2 ? 'Đã kết thúc' : 'Đã hủy'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/auctions/${auction.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {auction.statusId === 1 && auction.totalBids > 0 && (
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
                          onClick={() => openEditAuction(auction)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAuction(auction.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Sản phẩm ({products.length})</CardTitle>
            <Button size="sm" onClick={openAddProduct} className="gap-2 bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá khởi điểm</TableHead>
                <TableHead>Người bán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Chưa có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-accent/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{product.name}</div>
                          <div className="text-sm text-muted-foreground truncate">{product.title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                        {product.categoryName || 'Không có'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(product.startPrice)}
                    </TableCell>
                    <TableCell>{product.sellerName}</TableCell>
                    <TableCell>
                      <Badge
                        className={product.status === 'active' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}
                      >
                        {product.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditProduct(product)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Auction Dialog */}
      <Dialog open={isAuctionDialogOpen} onOpenChange={setIsAuctionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAuction ? 'Chỉnh sửa đấu giá' : 'Thêm đấu giá mới'}</DialogTitle>
            <DialogDescription>Điền thông tin chi tiết về phiên đấu giá</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Sản phẩm *</Label>
              <Select
                value={auctionForm.productId}
                onValueChange={(v) => setAuctionForm((f) => ({ ...f, productId: v }))}
                disabled={!!editingAuction}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      <div className="flex items-center gap-2">
                        {p.image && <img src={p.image} alt="" className="w-6 h-6 rounded object-cover" />}
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!editingAuction && products.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Cần tạo sản phẩm trước. Nhấn "Thêm sản phẩm" bên trên.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startPrice">Giá khởi điểm (VND) *</Label>
                <Input
                  id="startPrice"
                  type="number"
                  value={auctionForm.startPrice || ''}
                  onChange={(e) => setAuctionForm((f) => ({ ...f, startPrice: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bidIncrement">Bước giá (VND)</Label>
                <Input
                  id="bidIncrement"
                  type="number"
                  value={auctionForm.bidIncrement || ''}
                  onChange={(e) => setAuctionForm((f) => ({ ...f, bidIncrement: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Thời gian đấu giá</Label>
                <Select
                  value={String(auctionForm.durationMinutes)}
                  onValueChange={(v) => setAuctionForm((f) => ({ ...f, durationMinutes: Number(v) }))}
                  disabled={!!editingAuction}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    {auctionTimes.map((t) => (
                      <SelectItem key={t.minutes} value={String(t.minutes)}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Kết thúc lúc</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={auctionForm.endTimeLocal}
                  onChange={(e) => setAuctionForm((f) => ({ ...f, endTimeLocal: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuctionDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveAuction} className="bg-accent hover:bg-accent/90">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
            <DialogDescription>Điền thông tin sản phẩm bên dưới</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="productName">Tên sản phẩm *</Label>
              <Input
                id="productName"
                value={productForm.name}
                onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="VD: iPhone 15 Pro Max"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productTitle">Tiêu đề</Label>
              <Input
                id="productTitle"
                value={productForm.title}
                onChange={(e) => setProductForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Tiêu đề hiển thị (để trống = tên sản phẩm)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productDesc">Mô tả</Label>
              <Textarea
                id="productDesc"
                value={productForm.description}
                onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả chi tiết sản phẩm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Danh mục</Label>
                <Select
                  value={productForm.categoryId}
                  onValueChange={(v) => setProductForm((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="productPrice">Giá khởi điểm (VND)</Label>
                <Input
                  id="productPrice"
                  type="number"
                  value={productForm.startPrice || ''}
                  onChange={(e) => setProductForm((f) => ({ ...f, startPrice: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productImage">URL hình ảnh</Label>
              <Input
                id="productImage"
                value={productForm.image}
                onChange={(e) => setProductForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
              />
              {productForm.image && (
                <img src={productForm.image} alt="Preview" className="w-24 h-24 object-cover rounded-lg mt-2" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveProduct} className="bg-accent hover:bg-accent/90">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
