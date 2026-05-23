import { Link } from 'react-router-dom';
import { TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CountdownTimer } from './CountdownTimer';
import type { Auction } from '../types/auction';

interface AuctionCardProps {
  auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const isActive = auction.statusId === 1;
  const isEnded = auction.statusId === 2;

  const statusText = isActive ? 'Đang diễn ra' : isEnded ? 'Đã kết thúc' : 'Đã hủy';
  const statusClass = isActive ? 'bg-green-600' : isEnded ? 'bg-gray-600' : 'bg-gray-400';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2">
          <Badge className={statusClass}>
            {statusText}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary">{auction.category}</Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{auction.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{auction.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Giá hiện tại</span>
            <span className="font-bold text-blue-600">
              {auction.currentPrice > 0
                ? formatCurrency(auction.currentPrice)
                : formatCurrency(auction.startPrice)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{auction.totalBids} lượt</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>+{formatCurrency(auction.bidIncrement)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <CountdownTimer endTime={new Date(auction.endTime)} compact />
        <Link to={`/auctions/${auction.id}`}>
          <Button size="sm">{isActive ? 'Đặt giá' : 'Xem chi tiết'}</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
