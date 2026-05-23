import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Save, Bell, Shield, LogOut, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { readStoredUser, clearAuth, persistAuth } from '../../services/authService';
import { authService } from '../../services/authService';

export function UserSettings() {
  const navigate = useNavigate();
  const user = readStoredUser();

  const [form, setForm] = useState({ name: '', phone: '', avatar: '', address: '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [notifications, setNotifications] = useState({ outbid: true, won: true, ending: true, news: false });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setForm({ name: user.name || '', phone: (user as any).phone || '', avatar: (user as any).avatar || '', address: (user as any).address || '' });
    setPreviewUrl((user as any).avatar || '');
  }, [user, navigate]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Tên không được để trống'); return; }
    if (password && password.length < 6) { toast.error('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (password && password !== confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    setSaving(true);
    try {
      const data: any = {};
      if (form.name !== user?.name) data.name = form.name;
      if (form.phone !== (user as any)?.phone) data.phone = form.phone;
      if (form.avatar !== (user as any)?.avatar) data.avatar = form.avatar;
      if (password) data.password = password;
      if (Object.keys(data).length === 0) { toast.info('Không có thay đổi nào'); setSaving(false); return; }
      const updatedUser = await authService.updateProfile(data);
      const currentUser = readStoredUser();
      if (currentUser) { persistAuth(sessionStorage.getItem('token') || '', updatedUser); window.dispatchEvent(new CustomEvent('auth-updated', { detail: updatedUser })); }
      toast.success('Cập nhật thành công!');
      setPassword(''); setConfirmPassword('');
    } catch { toast.error('Cập nhật thất bại'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Overview */}
      <Card className="bg-gradient-to-r from-accent/5 to-transparent border-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={previewUrl || undefined} alt={form.name} />
              <AvatarFallback className="text-xl bg-accent/10 text-accent">{form.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Thông tin cá nhân</CardTitle><CardDescription>Cập nhật thông tin tài khoản</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ảnh đại diện</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16"><AvatarImage src={previewUrl || undefined} /><AvatarFallback className="text-lg bg-accent/10 text-accent">{form.name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
              <Input placeholder="URL ảnh đại diện" value={form.avatar} onChange={e => { setForm(f => ({ ...f, avatar: e.target.value })); setPreviewUrl(e.target.value); }} />
            </div>
          </div>
          <Separator />
          <div className="space-y-2"><Label htmlFor="name">Tên</Label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="name" className="pl-10" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div></div>
          <div className="space-y-2"><Label>Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-10" value={user?.email || ''} disabled /></div><p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle className="h-3 w-3" />Email không thể thay đổi</p></div>
          <div className="space-y-2"><Label htmlFor="phone">Số điện thoại</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="phone" className="pl-10" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div></div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Đổi mật khẩu</CardTitle><CardDescription>Để trống nếu không muốn thay đổi</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="password">Mật khẩu mới</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="password" className="pl-10 pr-10" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} /><button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          <div className="space-y-2"><Label>Xác nhận mật khẩu</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-10" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div></div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Cài đặt thông báo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[{ key: 'outbid', label: 'Thông báo vượt giá', desc: 'Nhận khi có người vượt giá của bạn' }, { key: 'won', label: 'Thông báo thắng đấu giá', desc: 'Nhận khi bạn thắng đấu giá' }, { key: 'ending', label: 'Thông báo sắp kết thúc', desc: 'Nhận trước khi phiên kết thúc' }, { key: 'news', label: 'Tin tức và khuyến mãi', desc: 'Thông tin sản phẩm mới và ưu đãi' }].map((item, i) => (
            <div key={item.key} className="flex items-center justify-between">
              <div><Label>{item.label}</Label><p className="text-sm text-muted-foreground">{item.desc}</p></div>
              <Switch checked={notifications[item.key as keyof typeof notifications]} onCheckedChange={checked => setNotifications(n => ({ ...n, [item.key]: checked }))} />
              {i < 3 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><LogOut className="h-5 w-5" />Đăng xuất</CardTitle></CardHeader>
        <CardContent><Button variant="outline" className="text-destructive border-red-200 hover:bg-red-50" onClick={() => { clearAuth(); navigate('/'); }}><LogOut className="h-4 w-4 mr-2" />Đăng xuất</Button></CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => navigate('/user/dashboard')}>Hủy</Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
      </div>
    </div>
  );
}
