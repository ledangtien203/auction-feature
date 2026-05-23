import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface AdminSettingsState {
  siteName: string;
  siteEmail: string;
  supportPhone: string;
  address: string;
  minBidIncrement: number;
  auctionDuration: number;
  commissionRate: number;
  autoExtendAuctions: boolean;
  requireVerification: boolean;
  notifyEmail: boolean;
  notifyOverbid: boolean;
  notifyEndingSoon: boolean;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const defaultSettings: AdminSettingsState = {
  siteName: 'Đấu Giá Trực Tuyến',
  siteEmail: 'contact@daugia.com',
  supportPhone: '1900 1234',
  address: '',
  minBidIncrement: 100000,
  auctionDuration: 72,
  commissionRate: 10,
  autoExtendAuctions: true,
  requireVerification: true,
  notifyEmail: true,
  notifyOverbid: true,
  notifyEndingSoon: true,
  bankName: '',
  accountNumber: '',
  accountName: '',
};

export function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api<AdminSettingsState>('/api/admin/settings');
      setSettings(data);
    } catch {
      toast.error('Không tải được cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      toast.success('Đã lưu cài đặt thành công');
    } catch {
      toast.error('Lưu cài đặt thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    toast.success('Đã đặt lại cài đặt mặc định');
  };

  const updateSetting = <K extends keyof AdminSettingsState>(
    key: K,
    value: AdminSettingsState[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Đang tải…</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground">Quản lý cấu hình hệ thống đấu giá</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt chung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Tên website</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => updateSetting('siteName', e.target.value)}
              placeholder="Nhập tên website"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteEmail">Email liên hệ</Label>
            <Input
              id="siteEmail"
              type="email"
              value={settings.siteEmail}
              onChange={(e) => updateSetting('siteEmail', e.target.value)}
              placeholder="Nhập email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportPhone">Số điện thoại hỗ trợ</Label>
            <Input
              id="supportPhone"
              value={settings.supportPhone}
              onChange={(e) => updateSetting('supportPhone', e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => updateSetting('address', e.target.value)}
              placeholder="Nhập địa chỉ công ty"
            />
          </div>
        </CardContent>
      </Card>

      {/* Auction Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt đấu giá</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="minBidIncrement">Bước giá tối thiểu mặc định (VND)</Label>
            <Input
              id="minBidIncrement"
              type="number"
              value={settings.minBidIncrement}
              onChange={(e) => updateSetting('minBidIncrement', Number(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auctionDuration">Thời gian đấu giá mặc định (giờ)</Label>
            <Input
              id="auctionDuration"
              type="number"
              value={settings.auctionDuration}
              onChange={(e) => updateSetting('auctionDuration', Number(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commissionRate">Tỷ lệ hoa hồng (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              step="0.1"
              value={settings.commissionRate}
              onChange={(e) => updateSetting('commissionRate', Number(e.target.value))}
              placeholder="0"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tự động gia hạn đấu giá</Label>
              <div className="text-sm text-muted-foreground">
                Gia hạn thời gian nếu có giá đặt trong phút cuối
              </div>
            </div>
            <Switch
              checked={settings.autoExtendAuctions}
              onCheckedChange={(checked) => updateSetting('autoExtendAuctions', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Yêu cầu xác minh người dùng</Label>
              <div className="text-sm text-muted-foreground">
                Người dùng phải xác minh danh tính trước khi đặt giá
              </div>
            </div>
            <Switch
              checked={settings.requireVerification}
              onCheckedChange={(checked) => updateSetting('requireVerification', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt thông báo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thông báo email</Label>
              <div className="text-sm text-muted-foreground">Gửi email thông báo cho người dùng</div>
            </div>
            <Switch
              checked={settings.notifyEmail}
              onCheckedChange={(checked) => updateSetting('notifyEmail', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thông báo khi bị vượt giá</Label>
              <div className="text-sm text-muted-foreground">Thông báo khi có người đặt giá cao hơn</div>
            </div>
            <Switch
              checked={settings.notifyOverbid}
              onCheckedChange={(checked) => updateSetting('notifyOverbid', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thông báo sắp kết thúc</Label>
              <div className="text-sm text-muted-foreground">Nhắc nhở trước khi đấu giá kết thúc 1 giờ</div>
            </div>
            <Switch
              checked={settings.notifyEndingSoon}
              onCheckedChange={(checked) => updateSetting('notifyEndingSoon', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bankName">Tên ngân hàng</Label>
            <Input
              id="bankName"
              value={settings.bankName}
              onChange={(e) => updateSetting('bankName', e.target.value)}
              placeholder="Nhập tên ngân hàng"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Số tài khoản</Label>
            <Input
              id="accountNumber"
              value={settings.accountNumber}
              onChange={(e) => updateSetting('accountNumber', e.target.value)}
              placeholder="Nhập số tài khoản"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountName">Tên tài khoản</Label>
            <Input
              id="accountName"
              value={settings.accountName}
              onChange={(e) => updateSetting('accountName', e.target.value)}
              placeholder="Nhập tên tài khoản"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset}>
          Đặt lại
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Button>
      </div>
    </div>
  );
}
