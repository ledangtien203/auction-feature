import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Image, Lock, Camera, Save, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { readStoredUser, clearAuth, persistAuth } from '../services/authService';
import { authService } from '../services/authService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';

export function Settings() {
  const navigate = useNavigate();
  const user = readStoredUser();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    avatar: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setForm({
      name: user.name || '',
      phone: (user as Record<string, unknown>).phone as string || '',
      avatar: (user as Record<string, unknown>).avatar as string || '',
    });
    setPreviewUrl((user as Record<string, unknown>).avatar as string || '');
  }, [user, navigate]);

  const handleAvatarChange = (url: string) => {
    setForm(f => ({ ...f, avatar: url }));
    setPreviewUrl(url);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Tên không được để trống');
      return;
    }

    if (password && password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setSaving(true);
    try {
      const data: { name?: string; phone?: string; avatar?: string; password?: string } = {};
      if (form.name !== user?.name) data.name = form.name;
      if (form.phone !== ((user as Record<string, unknown>)?.phone as string || '')) data.phone = form.phone;
      if (form.avatar !== ((user as Record<string, unknown>)?.avatar as string || '')) data.avatar = form.avatar;
      if (password) data.password = password;

      if (Object.keys(data).length === 0) {
        toast.info('Không có thay đổi nào');
        setSaving(false);
        return;
      }

      const updatedUser = await authService.updateProfile(data);

      const currentUser = readStoredUser();
      if (currentUser) {
        persistAuth(sessionStorage.getItem('token') || '', updatedUser);
        window.dispatchEvent(new CustomEvent('auth-updated', { detail: updatedUser }));
      }

      toast.success('Cập nhật thành công!');
      setPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Cài đặt</h1>
        <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="space-y-6">
        {/* Avatar section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Ảnh đại diện
            </CardTitle>
            <CardDescription>Thay đổi ảnh đại diện của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-border"
                    onError={() => setPreviewUrl('')}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center border-2 border-border">
                    <User className="h-10 w-10 text-accent-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatar-url">URL ảnh đại diện</Label>
                <Input
                  id="avatar-url"
                  placeholder="https://example.com/avatar.jpg"
                  value={form.avatar}
                  onChange={(e) => handleAvatarChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Nhập URL hình ảnh của bạn (jpg, png, gif)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>
            <CardDescription>Cập nhật tên và số điện thoại</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-10"
                  placeholder="Nhập tên của bạn"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  className="pl-10"
                  type="email"
                  value={user.email}
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Email không thể thay đổi
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-10"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password change */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
            <CardDescription>Để trống nếu không muốn thay đổi mật khẩu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  className="pl-10"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  className="pl-10"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  );
}
