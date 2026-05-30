/**
 * Application constants
 */

export const APP_NAME = 'Đấu Giá Trực Tuyến';
export const APP_DESCRIPTION = 'Nền tảng đấu giá hàng đầu Việt Nam';

export const ROUTES = {
  HOME: '/',
  AUCTIONS: '/auctions',
  AUCTION_DETAIL: '/auctions/:id',
  MY_BIDS: '/my-bids',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: {
    DASHBOARD: '/admin',
    AUCTIONS: '/admin/auctions',
    USERS: '/admin/users',
    TRANSACTIONS: '/admin/transactions',
    SETTINGS: '/admin/settings',
  },
} as const;

export const AUCTION_CATEGORIES = [
  'Đồng hồ',
  'Máy ảnh',
  'Nội thất',
  'Trang sức',
  'Xe cổ',
  'Nghệ thuật',
  'Thời trang',
  'Sưu tầm',
  'Rượu vang',
  'Xe thuyền',
  'Nhạc cụ',
] as const;

export const AUCTION_STATUS = {
  ACTIVE: 'active',
  UPCOMING: 'upcoming',
  ENDED: 'ended',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const DEFAULT_CURRENCY = 'VND';
export const DEFAULT_LOCALE = 'vi-VN';

export const BID_INCREMENT_OPTIONS = [
  1000000,
  2000000,
  5000000,
  10000000,
  20000000,
  50000000,
  100000000,
];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
} as const;

export const COUNTDOWN_UPDATE_INTERVAL = 1000; // 1 second

export const TOAST_DURATION = 3000; // 3 seconds

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const VALIDATION_RULES = {
  EMAIL_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
  TITLE_MAX_LENGTH: 200,
} as const;
