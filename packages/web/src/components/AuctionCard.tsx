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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2">
          <Badge
            variant={auction.status === 'active' ? 'default' : 'secondary'}
            className={
              auction.status === 'active'
                ? 'bg-green-600'
                : auction.status === 'upcoming'
                  ? 'bg-blue-600'
                  : 'bg-gray-600'
            }
          >
            {auction.status === 'active'
              ? 'Đang diễn ra'
              : auction.status === 'upcoming'
                ? 'Sắp diễn ra'
                : 'Đã kết thúc'}
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
              {auction.currentBid > 0
                ? formatCurrency(auction.currentBid)
                : formatCurrency(auction.startingBid)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{auction.totalBids} lượt</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>+{formatCurrency(auction.minIncrement)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <CountdownTimer endTime={auction.endTime} compact />
        <Link to={`/auctions/${auction.id}`}>
          <Button size="sm">{auction.status === 'active' ? 'Đặt giá' : 'Xem chi tiết'}</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
