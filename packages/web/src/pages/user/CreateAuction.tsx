import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Loader2, Upload, X, Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { api, uploadFile } from '../../lib/api';
import { getImageUrl, getRelativeImageUrl } from '../../lib/imageUtils';
import { toast } from 'sonner';
import { broadcastSyncEvent } from '../../lib/syncStorage';

interface Category {
  id: number;
  name: string;
}

const AUCTION_DURATIONS = [
  { value: '5', label: '5 phút' },
  { value: '10', label: '10 phút' },
  { value: '15', label: '15 phút' },
  { value: '20', label: '20 phút' },
  { value: '30', label: '30 phút' },
  { value: '60', label: '1 giờ' },
  { value: '120', label: '2 giờ' },
  { value: '1440', label: '1 ngày' },
];

export function CreateAuction() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    image: '',
    startPrice: '',
    bidIncrement: '1000',
    durationMinutes: '15',
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api<Category[]>('/api/categories');
        setCategories(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 5MB.');
      return;
    }

    // Create local preview immediately (base64)
    const localPreview = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    });
    setPreviewUrl(localPreview);

    // Upload to server
    setUploadingImage(true);
    try {
      const response = await uploadFile<{ url: string }>('/api/upload', file);
      // Lưu URL tương đối vào form
      setForm(f => ({ ...f, image: response.url }));
      // Preview dùng URL đầy đủ
      setPreviewUrl(getImageUrl(response.url));
      toast.success('Tải ảnh lên thành công!');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e.message || 'Tải ảnh thất bại');
    } finally {
      setUploadingImage(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setForm(f => ({ ...f, image: '' }));
    setPreviewUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề sản phẩm');
      return;
    }
    if (!form.startPrice || Number(form.startPrice) <= 0) {
      toast.error('Giá khởi điểm phải lớn hơn 0');
      return;
    }

    setLoading(true);
    try {
      // Convert to relative URL for MySQL storage
      const imageForDb = form.image ? getRelativeImageUrl(form.image) : null;
      
      const response = await api('/api/user-dashboard/auctions', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          image: imageForDb,
          startPrice: Number(form.startPrice),
          bidIncrement: Number(form.bidIncrement) || 1000,
          durationMinutes: Number(form.durationMinutes),
        }),
      });

      broadcastSyncEvent('auctions');
      toast.success(response.message || 'Tạo đấu giá thành công! Vui lòng chờ admin phê duyệt.');
      navigate('/user/auctions');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e.message || 'Tạo đấu giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/user/auctions')}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tạo phiên đấu giá mới</CardTitle>
          <p className="text-muted-foreground">
            Điền thông tin sản phẩm bên dưới. Phiên đấu giá sẽ được admin kiểm duyệt trước khi lên sàn.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề sản phẩm *</Label>
              <Input
                id="title"
                placeholder="VD: iPhone 15 Pro Max 256GB"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả sản phẩm</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về sản phẩm của bạn..."
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  onValueChange={(v) => {
                    setSelectedCategory(v);
                    setForm(f => ({ ...f, categoryId: v }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat.id != null).map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Hình ảnh sản phẩm</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex-1"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Chọn ảnh
                      </>
                    )}
                  </Button>
                  {form.image && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Chấp nhận: JPEG, PNG, GIF, WebP (tối đa 5MB)</p>
              </div>
            </div>

            {/* Image Preview */}
            <div className="border-2 border-dashed border-amber-200 rounded-lg p-4 bg-amber-50/50 min-h-[150px]">
              {previewUrl ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Ảnh sản phẩm</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {uploadingImage ? 'Đang tải lên...' : 'Đã chọn ảnh'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">Chưa chọn ảnh</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startPrice">Giá khởi điểm (VND) *</Label>
                <Input
                  id="startPrice"
                  type="number"
                  min="1000"
                  step="1000"
                  placeholder="100000"
                  value={form.startPrice}
                  onChange={(e) => setForm({ ...form, startPrice: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bidIncrement">Bước giá (VND)</Label>
                <Input
                  id="bidIncrement"
                  type="number"
                  min="1000"
                  step="1000"
                  placeholder="1000"
                  value={form.bidIncrement}
                  onChange={(e) => setForm({ ...form, bidIncrement: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Thời gian đấu giá</Label>
                <Select
                  value={form.durationMinutes}
                  onValueChange={(v) => setForm({ ...form, durationMinutes: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUCTION_DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <strong>Lưu ý:</strong> Sau khi tạo, phiên đấu giá sẽ ở trạng thái <strong>"Chờ kiểm duyệt"</strong>. Admin sẽ phê duyệt để đưa sản phẩm lên sàn đấu giá.
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/user/auctions')}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading || uploadingImage}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Tạo phiên đấu giá
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
