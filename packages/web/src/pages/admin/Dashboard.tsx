import { useEffect, useState } from "react";
import {
  Users,
  Gavel,
  DollarSign,
  ArrowUp,
  Clock,
  TrendingUp,
  Activity
} from "lucide-react";
import { adminDashboardService } from "../../services/transactionService";
import type { Auction } from "../../types/auction";
import type { Transaction } from "../../types/transaction";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [stats, setStats] = useState<{
    totalRevenue: number;
    activeAuctions: number;
    totalUsers: number;
    pendingTransactions: number;
    revenueGrowth: number;
    userGrowth: number;
    auctionGrowth: number;
    recentAuctions: Auction[];
    recentTransactions: Transaction[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await adminDashboardService.getDashboard();
        if (!cancelled) setStats(d);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-muted-foreground">Đang tải dashboard…</div>
    );
  }

  if (!stats) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Không tải được dữ liệu. Hãy đăng nhập tài khoản quản trị và kiểm tra API.
      </div>
    );
  }

  const recentAuctions = stats.recentAuctions;
  const recentTransactions = stats.recentTransactions;

  // Mock data for charts
  const revenueData = [
    { month: 'T1', revenue: 1200000000, auctions: 45 },
    { month: 'T2', revenue: 1500000000, auctions: 52 },
    { month: 'T3', revenue: 1800000000, auctions: 61 },
    { month: 'T4', revenue: 2100000000, auctions: 68 },
    { month: 'T5', revenue: 2400000000, auctions: 75 },
    { month: 'T6', revenue: 2800000000, auctions: 82 },
  ];

  const categoryData = [
    { name: 'Đồng hồ', value: 28, color: '#d4af37' },
    { name: 'Trang sức', value: 22, color: '#8b7355' },
    { name: 'Nghệ thuật', value: 18, color: '#a67c52' },
    { name: 'Xe cổ', value: 15, color: '#c9a961' },
    { name: 'Khác', value: 17, color: '#b89968' },
  ];

  const activityData = [
    { hour: '00:00', bids: 12 },
    { hour: '04:00', bids: 8 },
    { hour: '08:00', bids: 35 },
    { hour: '12:00', bids: 62 },
    { hour: '16:00', bids: 48 },
    { hour: '20:00', bids: 71 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hoạt động hệ thống đấu giá</p>
      </div>

      {/* KPIs Grid - Enhanced */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <div className="flex items-center gap-1 text-success bg-success/10 px-2 py-1 rounded-full">
                <ArrowUp className="h-3 w-3" />
                <span className="text-xs font-semibold">+{stats.revenueGrowth}%</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Tổng doanh thu</div>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-xs text-muted-foreground">
              So với tháng trước
            </div>
          </div>
        </div>

        {/* Active Auctions */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Gavel className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-success bg-success/10 px-2 py-1 rounded-full">
                <ArrowUp className="h-3 w-3" />
                <span className="text-xs font-semibold">+{stats.auctionGrowth}%</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Đấu giá đang diễn ra</div>
            <div className="text-3xl font-bold mb-1">
              {stats.activeAuctions}
            </div>
            <div className="text-xs text-muted-foreground">
              Phiên đấu giá hoạt động
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-success bg-success/10 px-2 py-1 rounded-full">
                <ArrowUp className="h-3 w-3" />
                <span className="text-xs font-semibold">+{stats.userGrowth}%</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Tổng người dùng</div>
            <div className="text-3xl font-bold mb-1">
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Người dùng đã đăng ký
            </div>
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning/10 rounded-xl">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div className="px-2 py-1 bg-urgent/10 text-urgent text-xs font-semibold rounded-full">
                Cần xử lý
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Giao dịch chờ xử lý</div>
            <div className="text-3xl font-bold mb-1">
              {stats.pendingTransactions}
            </div>
            <div className="text-xs text-warning font-medium">
              Yêu cầu duyệt ngay
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Xu hướng doanh thu</h2>
              <p className="text-sm text-muted-foreground">6 tháng gần đây</p>
            </div>
            <Activity className="h-5 w-5 text-accent" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Phân bổ danh mục</h2>
              <p className="text-sm text-muted-foreground">Theo phần trăm đấu giá</p>
            </div>
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity & Auctions Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Hoạt động đặt giá</h2>
            <p className="text-sm text-muted-foreground">Theo giờ trong ngày</p>
          </div>
          <Activity className="h-5 w-5 text-accent" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="bids" fill="#d4af37" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Separator />

      {/* Activity Tables */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Auctions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Đấu giá gần đây</h2>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {recentAuctions.map((auction) => (
                <div key={auction.id} className="flex items-center gap-4 p-4 hover:bg-accent/5 transition-colors">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate mb-1">{auction.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(auction.currentBid || auction.startingBid)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge className="bg-success text-success-foreground">
                      {auction.totalBids} lượt
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Giao dịch gần đây</h2>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate mb-1">
                      {transaction.userName}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {transaction.auctionTitle}
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="font-bold mb-1">
                      {formatCurrency(transaction.amount)}
                    </div>
                    <Badge
                      className={
                        transaction.status === 'completed'
                          ? 'bg-success text-success-foreground'
                          : transaction.status === 'pending'
                          ? 'bg-warning text-warning-foreground'
                          : 'bg-destructive text-destructive-foreground'
                      }
                    >
                      {transaction.status === 'completed'
                        ? 'Hoàn tất'
                        : transaction.status === 'pending'
                        ? 'Chờ xử lý'
                        : 'Đã hủy'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}