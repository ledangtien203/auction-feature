import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Edit, Trash2, Package, Eye, EyeOff } from 'lucide-react';
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
  DialogTrigger,
} from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Đồng hồ',
      slug: 'dong-ho',
      description: 'Đồng hồ cao cấp, sang trọng',
      productCount: 145,
      isActive: true,
      createdAt: '2026-01-15',
    },
    {
      id: '2',
      name: 'Trang sức',
      slug: 'trang-suc',
      description: 'Trang sức kim cương, vàng, bạc',
      productCount: 98,
      isActive: true,
      createdAt: '2026-01-15',
    },
    {
      id: '3',
      name: 'Nghệ thuật',
      slug: 'nghe-thuat',
      description: 'Tranh, tác phẩm nghệ thuật',
      productCount: 67,
      isActive: true,
      createdAt: '2026-01-20',
    },
    {
      id: '4',
      name: 'Xe cổ',
      slug: 'xe-co',
      description: 'Xe hơi cổ điển quý hiếm',
      productCount: 23,
      isActive: true,
      createdAt: '2026-02-01',
    },
    {
      id: '5',
      name: 'Đồ cổ',
      slug: 'do-co',
      description: 'Đồ cổ, đồ sưu tầm',
      productCount: 34,
      isActive: false,
      createdAt: '2026-02-10',
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleToggleStatus = (id: string) => {
    setCategories(
      categories.map((cat) => (cat.id === id ? { ...cat, isActive: !cat.isActive } : cat))
    );
    toast.success('Đã cập nhật trạng thái danh mục');
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
    toast.success('Đã xóa danh mục');
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    toast.success('Đã lưu danh mục thành công');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý danh mục</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa danh mục sản phẩm</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4" />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </DialogTitle>
              <DialogDescription>Điền thông tin danh mục bên dưới</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục</Label>
                <Input id="name" placeholder="VD: Đồng hồ" defaultValue={editingCategory?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input id="slug" placeholder="VD: dong-ho" defaultValue={editingCategory?.slug} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn về danh mục"
                  defaultValue={editingCategory?.description}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Kích hoạt danh mục</Label>
                  <div className="text-sm text-muted-foreground">Hiển thị trên website</div>
                </div>
                <Switch defaultChecked={editingCategory?.isActive ?? true} />
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
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
              <Package className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                <p className="text-3xl font-bold text-success">
                  {categories.filter((c) => c.isActive).length}
                </p>
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
                <p className="text-3xl font-bold">
                  {categories.reduce((sum, c) => sum + c.productCount, 0)}
                </p>
              </div>
              <Package className="h-10 w-10 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Sản phẩm</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-semibold">{category.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {category.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{category.productCount}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <button onClick={() => handleToggleStatus(category.id)}>
                      {category.isActive ? (
                        <Badge className="gap-1">
                          <Eye className="h-3 w-3" />
                          Hiển thị
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <EyeOff className="h-3 w-3" />
                          Ẩn
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(category.id)}
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
