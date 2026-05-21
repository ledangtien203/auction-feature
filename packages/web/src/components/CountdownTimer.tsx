import { useMemo } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { formatCompactTime } from '../utils/formatters';

interface CountdownTimerProps {
  endTime: Date | string;
  compact?: boolean;
}

export function CountdownTimer({ endTime, compact = false }: CountdownTimerProps) {
  const end = useMemo(() => {
    const t = typeof endTime === 'string' ? endTime : endTime.getTime();
    return new Date(t);
  }, [typeof endTime === 'string' ? endTime : endTime.getTime()]);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(end);

  if (isExpired) {
    return (
      <div className="text-muted-foreground">
        {compact ? 'Đã kết thúc' : 'Phiên đấu giá đã kết thúc'}
      </div>
    );
  }

  if (compact) {
    return (
      <span className="font-medium">
        {formatCompactTime(end)}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      {days > 0 && (
        <div className="flex flex-col items-center bg-background border border-border rounded-lg px-3 py-2 min-w-[60px]">
          <div className="text-2xl font-bold">{days}</div>
          <div className="text-xs text-muted-foreground">Ngày</div>
        </div>
      )}
      <div className="flex flex-col items-center bg-background border border-border rounded-lg px-3 py-2 min-w-[60px]">
        <div className="text-2xl font-bold">{hours}</div>
        <div className="text-xs text-muted-foreground">Giờ</div>
      </div>
      <div className="flex flex-col items-center bg-background border border-border rounded-lg px-3 py-2 min-w-[60px]">
        <div className="text-2xl font-bold">{minutes}</div>
        <div className="text-xs text-muted-foreground">Phút</div>
      </div>
      {days === 0 && (
        <div className="flex flex-col items-center bg-background border border-border rounded-lg px-3 py-2 min-w-[60px]">
          <div className="text-2xl font-bold">{seconds}</div>
          <div className="text-xs text-muted-foreground">Giây</div>
        </div>
      )}
    </div>
  );
}