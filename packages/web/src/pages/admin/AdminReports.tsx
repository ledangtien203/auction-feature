import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, Download, FileText, TrendingUp, Users, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface RevenueData {
  month: string;
  revenue: number;
  auctions: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TopBidder {
  userId: number;
  username: string;
  name: string | null;
  totalBids: number;
  totalSpent: number;
}

interface ReportStats {
  totalAuctions: number;
  totalRevenue: number;
  totalUsers: number;
  successRate: number;
  revenueGrowth: number;
  userGrowth: number;
}

const COLORS = ['#d4af37', '#8b7355', '#a67c52', '#c9a961', '#b89968', '#9b7e46', '#8a6d3f', '#7a5c38'];

export function AdminReports() {
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topBidders, setTopBidders] = useState<TopBidder[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revenue, categories, dashboard, reportStats] = await Promise.all([
        api<RevenueData[]>('/api/admin/dashboard/charts/revenue'),
        api<CategoryData[]>('/api/admin/dashboard/charts/categories'),
        api<{
          totalRevenue: number;
          activeAuctions: number;
          totalUsers: number;
          pendingTransactions: number;
          revenueGrowth: number;
          userGrowth: number;
        }>('/api/admin/dashboard'),
        api<{
          totalAuctions: number;
          successRate: number;
        }>('/api/admin/reports/stats'),
      ]);

      setRevenueData(revenue);
      setCategoryData(categories);
      setStats({
        totalAuctions: reportStats.totalAuctions || dashboard.activeAuctions || 0,
        totalRevenue: dashboard.totalRevenue || 0,
        totalUsers: dashboard.totalUsers || 0,
        successRate: reportStats.successRate || 0,
        revenueGrowth: dashboard.revenueGrowth || 0,
        userGrowth: dashboard.userGrowth || 0,
      });

      // Load top bidders
      const users = await api<{
        id: string;
        username: string;
        name: string | null;
        totalBids: number;
        totalSpent: number;
      }[]>('/api/admin/users');
      const sorted = [...users]
        .sort((a, b) => (b.totalBids || 0) - (a.totalBids || 0))
        .slice(0, 5)
        .map((u) => ({
          userId: Number(u.id),
          username: u.username,
          name: u.name,
          totalBids: u.totalBids || 0,
          totalSpent: u.totalSpent || 0,
        }));
      setTopBidders(sorted);
    } catch {
      toast.error('Không tải được dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(0)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      timeRange,
      stats,
      revenueData,
      categoryData,
      topBidders,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất báo cáo');
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Đang tải…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Báo cáo & Thống kê</h1>
          <p className="text-muted-foreground">Phân tích chi tiết hiệu suất kinh doanh</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 ngày</SelectItem>
              <SelectItem value="30days">30 ngày</SelectItem>
              <SelectItem value="90days">90 ngày</SelectItem>
              <SelectItem value="6months">6 tháng</SelectItem>
              <SelectItem value="1year">1 năm</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">{stats?.totalAuctions || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Tổng đấu giá</p>
            <p className="text-xs text-muted-foreground mt-1">Từ MySQL</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">{formatShortCurrency(stats?.totalRevenue || 0)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Doanh thu (VND)</p>
            {stats?.revenueGrowth != null && stats.revenueGrowth !== 0 && (
              <p className="text-xs text-success mt-1">+{stats.revenueGrowth}% so với kỳ trước</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold">{stats?.totalUsers || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Người dùng</p>
            {stats?.userGrowth != null && stats.userGrowth !== 0 && (
              <p className="text-xs text-success mt-1">+{stats.userGrowth}% so với kỳ trước</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold">{stats?.successRate || 0}%</span>
            </div>
            <p className="text-sm text-muted-foreground">Tỷ lệ thành công</p>
            <p className="text-xs text-muted-foreground mt-1">Từ MySQL</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="topBidders">Top đấu giá</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu</CardTitle>
              <CardDescription>Theo dõi xu hướng doanh thu theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => formatShortCurrency(v)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#d4af37"
                      strokeWidth={3}
                      name="Doanh thu"
                    />
                    <Line
                      type="monotone"
                      dataKey="auctions"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Số đấu giá"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Chưa có dữ liệu doanh thu
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chi tiết doanh thu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((item) => (
                  <div
                    key={item.month}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{item.month}</div>
                      <div className="text-sm text-muted-foreground">{item.auctions} đấu giá</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent">{formatCurrency(item.revenue)}</div>
                    </div>
                  </div>
                ))}
                {revenueData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân bổ theo danh mục</CardTitle>
              <CardDescription>Tỷ lệ đấu giá theo danh mục sản phẩm</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    {categoryData.map((cat, index) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: cat.color || COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <span className="text-muted-foreground">{cat.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chưa có dữ liệu danh mục
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tăng trưởng người dùng</CardTitle>
              <CardDescription>Số lượng người dùng đăng ký mới</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Biểu đồ tăng trưởng người dùng theo thời gian sẽ hiển thị ở đây
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topBidders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top người đấu giá</CardTitle>
              <CardDescription>Người dùng có hoạt động nhiều nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topBidders.length > 0 ? (
                  topBidders.map((bidder, index) => (
                    <div
                      key={bidder.userId}
                      className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{bidder.name || bidder.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {bidder.totalBids} lượt đặt giá
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-accent">{formatCurrency(bidder.totalSpent)}</div>
                        <div className="text-sm text-muted-foreground">Tổng chi tiêu</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
