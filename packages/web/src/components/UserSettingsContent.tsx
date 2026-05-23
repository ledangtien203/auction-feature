import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Camera, Shield, Bell } from 'lucide-react';
import { readStoredUser, persistAuth } from '../services/authService';
import { api } from '../lib/api';

export function UserSettingsContent() {
  const user = readStoredUser();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    birthday: '',
  });
  const [notifications, setNotifications] = useState({
    emailBidUpdate: true,
    emailWinning: true,
    emailNewAuction: false,
    smsReminder: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api<{ user: any }>('/api/auth/me');
        if (data.user) {
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            address: data.user.address || '',
            birthday: data.user.birthday || '',
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data = await api<{ user: any }>('/api/auth/update-profile', {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      if (data.user) {
        const userData = { ...user, ...data.user };
        persistAuth(sessionStorage.getItem('token') || '', userData as any);
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Cập nhật thất bại' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='mb-2 text-xl font-semibold'>Thông tin cá nhân</h2>
        <p className='text-gray-600'>Quản lý thông tin tài khoản và cài đặt của bạn</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Ảnh đại diện</h3>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-2">
                <Camera className="w-4 h-4 inline mr-2" />
                Tải ảnh lên
              </button>
              <p className="text-sm text-gray-500">JPG, PNG hoặc GIF (tối đa 2MB)</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Thông tin cá nhân</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" /> Họ và tên
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" /> Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" /> Địa chỉ
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold">Cài đặt thông báo</h3>
        </div>

        <div className="space-y-4">
          {[
            { key: 'emailBidUpdate', title: 'Email khi có người đặt giá cao hơn', desc: 'Nhận thông báo ngay khi bị trả giá' },
            { key: 'emailWinning', title: 'Email khi thắng đấu giá', desc: 'Thông báo khi bạn thắng một phiên đấu giá' },
            { key: 'emailNewAuction', title: 'Email sản phẩm mới', desc: 'Nhận thông báo về các phiên đấu giá mới' },
            { key: 'smsReminder', title: 'SMS nhắc nhở', desc: 'Nhận SMS trước khi phiên đấu giá sắp kết thúc' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <p className="text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => handleNotificationChange(item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold">Bảo mật</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <p className="text-gray-900 font-medium mb-1">Đổi mật khẩu</p>
            <p className="text-sm text-gray-500">Cập nhật mật khẩu của bạn</p>
          </button>

          <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <p className="text-gray-900 font-medium mb-1">Xác thực hai yếu tố</p>
            <p className="text-sm text-gray-500">Thêm một lớp bảo mật cho tài khoản</p>
          </button>

          <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <p className="text-gray-900 font-medium mb-1">Phương thức thanh toán</p>
            <p className="text-sm text-gray-500">Quản lý thẻ và tài khoản ngân hàng</p>
          </button>
        </div>
      </div>
    </div>
  );
}
