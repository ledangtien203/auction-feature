import { Link } from 'react-router-dom';
import { Gavel, Trophy, Package, Wallet, ArrowRight, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  href?: string;
  badge?: string;
  badgeColor?: string;
  isUrgent?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  bgColor,
  href,
  badge,
  badgeColor = 'bg-primary',
  isUrgent,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        href && "cursor-pointer"
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-50",
          bgColor
        )}
      />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-xl",
              bgColor
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          {badge && (
            <Badge className={cn("text-xs", badgeColor, isUrgent && "animate-pulse")}>
              {badge}
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground mb-1">{title}</div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {subtitle && (
          <div className={cn("text-xs font-medium", isUrgent ? "text-red-500" : "text-muted-foreground")}>
            {subtitle}
          </div>
        )}
        {href && (
          <div className="absolute bottom-4 right-4">
            <ArrowRight className={cn("h-4 w-4 text-muted-foreground", iconColor)} />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

interface QuickStatsProps {
  stats: {
    activeBids: number;
    wonAuctions: number;
    myAuctions: number;
    pendingPayments: number;
    watchedAuctions: number;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Đang đấu giá"
        value={stats.activeBids}
        subtitle="Phiên đang theo dõi"
        icon={Gavel}
        iconColor="text-blue-600"
        bgColor="bg-blue-500/10"
        href="/user/bids"
      />
      <StatCard
        title="Đã thắng"
        value={stats.wonAuctions}
        subtitle="Tổng phiên thắng"
        icon={Trophy}
        iconColor="text-yellow-600"
        bgColor="bg-yellow-500/10"
        href="/user/won"
      />
      <StatCard
        title="Phiên đã đăng"
        value={stats.myAuctions}
        subtitle="Đang hoạt động"
        icon={Package}
        iconColor="text-purple-600"
        bgColor="bg-purple-500/10"
        href="/user/auctions"
      />
      <StatCard
        title="Chờ thanh toán"
        value={stats.pendingPayments}
        subtitle={stats.pendingPayments > 0 ? "Cần xử lý ngay" : "Không có yêu cầu"}
        icon={Wallet}
        iconColor="text-orange-600"
        bgColor="bg-orange-500/10"
        href="/user/wallet"
        badge={stats.pendingPayments > 0 ? `${stats.pendingPayments} cần thanh toán` : undefined}
        badgeColor={stats.pendingPayments > 0 ? "bg-red-500 text-white" : undefined}
        isUrgent={stats.pendingPayments > 0}
      />
      <StatCard
        title="Đang theo dõi"
        value={stats.watchedAuctions}
        subtitle="Sản phẩm yêu thích"
        icon={TrendingUp}
        iconColor="text-green-600"
        bgColor="bg-green-500/10"
        href="/user/watchlist"
      />
    </div>
  );
}

interface QuickActionProps {
  onNewAuction: () => void;
  onBrowseAuctions: () => void;
}

export function QuickActions({ onNewAuction, onBrowseAuctions }: QuickActionProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onNewAuction} className="gap-2">
        <Package className="h-4 w-4" />
        Tạo phiên mới
      </Button>
      <Button variant="outline" onClick={onBrowseAuctions} className="gap-2">
        <Gavel className="h-4 w-4" />
        Khám phá đấu giá
      </Button>
    </div>
  );
}
