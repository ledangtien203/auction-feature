import { useState } from 'react';
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

export function AdminReports() {
  const [timeRange, setTimeRange] = useState('30days');

  const revenueData = [
    { date: '01/05', revenue: 45000000, profit: 4500000 },
    { date: '08/05', revenue: 52000000, profit: 5200000 },
    { date: '15/05', revenue: 48000000, profit: 4800000 },
    { date: '22/05', revenue: 61000000, profit: 6100000 },
    { date: '29/05', revenue: 58000000, profit: 5800000 },
  ];

  const categoryPerformance = [
    { category: 'Đồng hồ', sales: 145, revenue: 850000000 },
    { category: 'Trang sức', sales: 98, revenue: 620000000 },
    { category: 'Nghệ thuật', sales: 67, revenue: 480000000 },
    { category: 'Xe cổ', sales: 23, revenue: 920000000 },
    { category: 'Khác', sales: 89, revenue: 340000000 },
  ];

  const userGrowth = [
    { month: 'T1', users: 1200 },
    { month: 'T2', users: 1450 },
    { month: 'T3', users: 1680 },
    { month: 'T4', users: 1890 },
    { month: 'T5', users: 2150 },
  ];

  const topBidders = [
    { name: 'Nguyễn Văn A', totalBids: 45, totalSpent: 125000000 },
    { name: 'Trần Thị B', totalBids: 38, totalSpent: 98000000 },
    { name: 'Lê Văn C', totalBids: 32, totalSpent: 87000000 },
    { name: 'Phạm Thị D', totalBids: 28, totalSpent: 76000000 },
    { name: 'Hoàng Văn E', totalBids: 25, totalSpent: 65000000 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
              <SelectItem value="1year">1 năm</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
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
              <span className="text-2xl font-bold">422</span>
            </div>
            <p className="text-sm text-muted-foreground">Tổng đấu giá</p>
            <p className="text-xs text-success mt-1">+12% so với kỳ trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">264M</span>
            </div>
            <p className="text-sm text-muted-foreground">Doanh thu (VND)</p>
            <p className="text-xs text-success mt-1">+18% so với kỳ trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold">2.1K</span>
            </div>
            <p className="text-sm text-muted-foreground">Người dùng mới</p>
            <p className="text-xs text-success mt-1">+24% so với kỳ trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold">89%</span>
            </div>
            <p className="text-sm text-muted-foreground">Tỷ lệ thành công</p>
            <p className="text-xs text-success mt-1">+5% so với kỳ trước</p>
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
              <CardTitle>Biểu đồ doanh thu & lợi nhuận</CardTitle>
              <CardDescription>Theo dõi xu hướng doanh thu theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
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
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Lợi nhuận"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất theo danh mục</CardTitle>
              <CardDescription>So sánh doanh số các danh mục sản phẩm</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#d4af37" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chi tiết danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPerformance.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{cat.category}</div>
                      <div className="text-sm text-muted-foreground">{cat.sales} đấu giá</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent">{formatCurrency(cat.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        Trung bình: {formatCurrency(cat.revenue / cat.sales)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tăng trưởng người dùng</CardTitle>
              <CardDescription>Số lượng người dùng mới theo tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#3b82f6" name="Người dùng mới" />
                </BarChart>
              </ResponsiveContainer>
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
                {topBidders.map((bidder, index) => (
                  <div
                    key={bidder.name}
                    className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{bidder.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {bidder.totalBids} lượt đặt giá
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent">
                        {formatCurrency(bidder.totalSpent)}
                      </div>
                      <div className="text-sm text-muted-foreground">Tổng chi tiêu</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
