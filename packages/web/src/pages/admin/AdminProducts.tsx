import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, Search, Eye } from 'lucide-react';
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
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface Product {
  id: number;
  name: string;
  title: string;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  image: string | null;
  startPrice: number;
  status: string;
  sellerId: number;
  sellerName: string;
  auctionCount: number;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    categoryId: '',
    image: '',
    startPrice: 0,
    status: 'active',
    sellerId: 1,
  });

  const loadProducts = async () => {
    try {
      const data = await api< Product[] >('/api/admin/products');
      setProducts(data);
    } catch {
      toast.error('Không tải được danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api<Category[]>('/api/admin/categories');
      setCategories(data);
    } catch {
      console.error('Không tải được danh mục');
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      title: '',
      description: '',
      categoryId: '',
      image: '',
      startPrice: 0,
      status: 'active',
      sellerId: 1,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      title: product.title,
      description: product.description || '',
      categoryId: product.categoryId ? String(product.categoryId) : '',
      image: product.image || '',
      startPrice: product.startPrice,
      status: product.status,
      sellerId: product.sellerId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
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

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Tên sản phẩm là bắt buộc');
      return;
    }
    try {
      const payload = {
        name: form.name,
        title: form.title || form.name,
        description: form.description || null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        image: form.image || null,
        startPrice: form.startPrice,
        status: form.status,
        sellerId: form.sellerId,
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
      setIsDialogOpen(false);
      setEditingProduct(null);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Lưu thất bại');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sellerName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    hasAuction: products.filter((p) => p.auctionCount > 0).length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Đang tải…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa sản phẩm cho đấu giá</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={openAdd} className="gap-2 bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
              <DialogDescription>Điền thông tin sản phẩm bên dưới</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="VD: iPhone 15 Pro Max"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Tiêu đề hiển thị (để trống = tên sản phẩm)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả chi tiết sản phẩm"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Danh mục</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
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
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startPrice">Giá khởi điểm (VND)</Label>
                  <Input
                    id="startPrice"
                    type="number"
                    value={form.startPrice || ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startPrice: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sellerId">ID Người bán</Label>
                  <Input
                    id="sellerId"
                    type="number"
                    value={form.sellerId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sellerId: Number(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">URL hình ảnh</Label>
                <Input
                  id="image"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
                {form.image && (
                  <img src={form.image} alt="Preview" className="w-24 h-24 object-cover rounded-lg mt-2" />
                )}
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

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-accent">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Tổng sản phẩm</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success mb-1">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Đang hoạt động</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary mb-1">{stats.hasAuction}</div>
            <div className="text-sm text-muted-foreground">Có phiên đấu giá</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá khởi điểm</TableHead>
                <TableHead>Người bán</TableHead>
                <TableHead>Đấu giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-accent/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{product.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {product.title}
                          </div>
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
                      {product.auctionCount > 0 ? (
                        <Badge className="bg-success text-success-foreground">
                          {product.auctionCount} phiên
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Chưa có</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          product.status === 'active'
                            ? 'bg-success text-success-foreground'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {product.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(product)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
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
    </div>
  );
}
