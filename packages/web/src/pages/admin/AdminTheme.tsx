import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import { Palette, Sun, Moon, Monitor, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export function AdminTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [primaryColor, setPrimaryColor] = useState('#d4af37');
  const [accentColor, setAccentColor] = useState('#0a0a0a');
  const [borderRadius, setBorderRadius] = useState('0.5');
  const [fontSize, setFontSize] = useState('16');

  const handleSave = () => {
    toast.success('Đã lưu cài đặt giao diện thành công');
  };

  const handleReset = () => {
    setTheme('light');
    setPrimaryColor('#d4af37');
    setAccentColor('#0a0a0a');
    setBorderRadius('0.5');
    setFontSize('16');
    toast.info('Đã khôi phục cài đặt mặc định');
  };

  const presetColors = [
    { name: 'Vàng Gold', primary: '#d4af37', accent: '#0a0a0a' },
    { name: 'Xanh Dương', primary: '#3b82f6', accent: '#1e40af' },
    { name: 'Xanh Lá', primary: '#10b981', accent: '#059669' },
    { name: 'Đỏ', primary: '#ef4444', accent: '#dc2626' },
    { name: 'Tím', primary: '#8b5cf6', accent: '#7c3aed' },
    { name: 'Cam', primary: '#f97316', accent: '#ea580c' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tùy chỉnh giao diện</h1>
        <p className="text-muted-foreground">Cá nhân hóa giao diện theo phong cách của bạn</p>
      </div>

      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-4 w-4" />
            Chủ đề
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-2">
            <Eye className="h-4 w-4" />
            Màu sắc
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-2">
            <Monitor className="h-4 w-4" />
            Typography
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chế độ hiển thị</CardTitle>
              <CardDescription>Chọn chế độ sáng/tối cho giao diện</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    theme === 'light'
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <Sun
                    className={`h-8 w-8 ${theme === 'light' ? 'text-accent' : 'text-muted-foreground'}`}
                  />
                  <div className="text-center">
                    <div className="font-semibold mb-1">Sáng</div>
                    <div className="text-xs text-muted-foreground">Giao diện sáng</div>
                  </div>
                  {theme === 'light' && <div className="h-2 w-2 rounded-full bg-accent" />}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <Moon
                    className={`h-8 w-8 ${theme === 'dark' ? 'text-accent' : 'text-muted-foreground'}`}
                  />
                  <div className="text-center">
                    <div className="font-semibold mb-1">Tối</div>
                    <div className="text-xs text-muted-foreground">Giao diện tối</div>
                  </div>
                  {theme === 'dark' && <div className="h-2 w-2 rounded-full bg-accent" />}
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    theme === 'system'
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <Monitor
                    className={`h-8 w-8 ${theme === 'system' ? 'text-accent' : 'text-muted-foreground'}`}
                  />
                  <div className="text-center">
                    <div className="font-semibold mb-1">Hệ thống</div>
                    <div className="text-xs text-muted-foreground">Theo thiết bị</div>
                  </div>
                  {theme === 'system' && <div className="h-2 w-2 rounded-full bg-accent" />}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tùy chọn giao diện</CardTitle>
              <CardDescription>Bật/tắt các tính năng hiển thị</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hiển thị ảnh nền</Label>
                  <div className="text-sm text-muted-foreground">Hiển thị hình nền trang chủ</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animation mượt mà</Label>
                  <div className="text-sm text-muted-foreground">Bật hiệu ứng chuyển động</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chế độ tiết kiệm dữ liệu</Label>
                  <div className="text-sm text-muted-foreground">Giảm chất lượng hình ảnh</div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bảng màu mặc định</CardTitle>
              <CardDescription>Chọn một bộ màu có sẵn hoặc tùy chỉnh riêng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {presetColors.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setPrimaryColor(preset.primary);
                      setAccentColor(preset.accent);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      primaryColor === preset.primary && accentColor === preset.accent
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <div className="flex gap-1">
                      <div
                        className="h-10 w-10 rounded-lg"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="h-10 w-10 rounded-lg"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">{preset.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tùy chỉnh màu sắc</CardTitle>
              <CardDescription>Điều chỉnh màu chính và phụ của giao diện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Màu chính (Primary)</Label>
                    <div className="text-sm text-muted-foreground">Màu nhấn mạnh và nút bấm</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-lg border-2 border-border"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Màu phụ (Accent)</Label>
                    <div className="text-sm text-muted-foreground">Màu nền và chữ</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-lg border-2 border-border"
                      style={{ backgroundColor: accentColor }}
                    />
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Xem trước</CardTitle>
              <CardDescription>Kiểm tra màu sắc trên các thành phần</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button style={{ backgroundColor: primaryColor }} className="w-full text-white">
                    Primary Button
                  </Button>
                  <Button variant="outline" className="w-full">
                    Outline Button
                  </Button>
                </div>
                <div
                  className="p-6 rounded-xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="text-xl font-bold mb-2">Card với màu chính</div>
                  <div className="text-sm opacity-90">
                    Đây là ví dụ về card sử dụng màu chính của bạn
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kích thước chữ</CardTitle>
              <CardDescription>Điều chỉnh kích thước chữ mặc định</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Kích thước: {fontSize}px</Label>
                  <span className="text-sm text-muted-foreground">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="20"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Nhỏ (12px)</span>
                  <span>Trung bình (16px)</span>
                  <span>Lớn (20px)</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Xem trước kích thước chữ</Label>
                <div
                  className="space-y-3 p-4 bg-muted rounded-lg"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <div className="text-2xl font-bold">Tiêu đề lớn</div>
                  <div className="text-xl font-semibold">Tiêu đề vừa</div>
                  <div className="text-base">Văn bản thông thường với kích thước {fontSize}px</div>
                  <div className="text-sm text-muted-foreground">Văn bản phụ nhỏ hơn</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bo tròn góc</CardTitle>
              <CardDescription>Điều chỉnh độ bo tròn của các thành phần</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Độ bo tròn: {borderRadius}rem</Label>
                  <span className="text-sm text-muted-foreground">{borderRadius}rem</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Vuông (0)</span>
                  <span>Vừa (0.5)</span>
                  <span>Tròn (2)</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Xem trước độ bo tròn</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-accent" style={{ borderRadius: `${borderRadius}rem` }} />
                  <div
                    className="h-24 border-2 border-border"
                    style={{ borderRadius: `${borderRadius}rem` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Khôi phục mặc định
        </Button>
        <div className="flex gap-3">
          <Button variant="outline">Xem trước</Button>
          <Button onClick={handleSave} style={{ backgroundColor: primaryColor }}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
