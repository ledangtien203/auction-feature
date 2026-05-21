/**
 * Format a number to Vietnamese currency (VND)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a date to Vietnamese format (DD/MM/YYYY)
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN').format(date);
};

/**
 * Format a date with time to Vietnamese format (DD/MM/YYYY HH:mm)
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format time remaining (countdown)
 */
export const formatTimeRemaining = (endTime: Date): string => {
  const now = new Date().getTime();
  const end = endTime.getTime();
  const distance = end - now;

  if (distance < 0) {
    return "Đã kết thúc";
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days} ngày ${hours} giờ`;
  } else if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  } else if (minutes > 0) {
    return `${minutes} phút ${seconds} giây`;
  } else {
    return `${seconds} giây`;
  }
};

/**
 * Format compact time remaining (for badges)
 */
export const formatCompactTime = (endTime: Date): string => {
  const now = new Date().getTime();
  const end = endTime.getTime();
  const distance = end - now;

  if (distance < 0) {
    return "Hết hạn";
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
