import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Edit, Trash2, Package, Eye, EyeOff, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface Category {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  created_at: string;
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
  });

  const loadCategories = async () => {
    try {
      const data = await api<Category[]>('/api/admin/categories');
      setCategories(data);
      // Load product count per category
      const productCounts: Record<number, number> = {};
      for (const cat of data) {
        const prods = await api<{ id: number }[]>(`/api/products?categoryId=${cat.id}`);
        productCounts[cat.id] = prods.length;
      }
      setProducts(productCounts);
    } catch {
      toast.error('Không tải được danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '', image: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Tên danh mục là bắt buộc');
      return;
    }
    try {
      if (editingCategory) {
        await api(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            image: form.image || null,
          }),
        });
        toast.success('Đã cập nhật danh mục');
      } else {
        await api('/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            image: form.image || null,
          }),
        });
        toast.success('Đã tạo danh mục mới');
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Lưu thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa danh mục này?')) return;
    try {
      await api(`/api/admin/categories/${id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Đã xóa danh mục');
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Xóa thất bại');
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: categories.length,
    hasProducts: Object.values(products).filter((c) => c > 0).length,
    totalProducts: Object.values(products).reduce((sum, c) => sum + c, 0),
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Đang tải…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý danh mục</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa danh mục sản phẩm</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={openAdd} className="gap-2 bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </DialogTitle>
              <DialogDescription>Điền thông tin danh mục bên dưới</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Đồng hồ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả ngắn về danh mục"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
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
              <Button onClick={handleSave}>{editingCategory ? 'Lưu thay đổi' : 'Thêm mới'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng danh mục</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Có sản phẩm</p>
                <p className="text-3xl font-bold text-success">{stats.hasProducts}</p>
              </div>
              <Eye className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-10 w-10 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục ({filteredCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Sản phẩm</TableHead>
                <TableHead className="text-center">Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Không có danh mục nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-semibold">{cat.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {cat.description || 'Không có mô tả'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{products[cat.id] || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {new Date(cat.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(cat.id)}
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
