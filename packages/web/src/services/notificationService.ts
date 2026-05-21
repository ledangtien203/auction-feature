import { api } from '../lib/api';

export interface Notification {
  id: string;
  userId: string;
  type: 'outbid' | 'won' | 'payment' | 'auction_ending' | 'system';
  title: string;
  message: string;
  auctionId: string | null;
  auctionTitle: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async getMyNotifications(): Promise<Notification[]> {
    const res = await api<{ notifications: Notification[] }>('/api/notifications/me');
    return res.notifications;
  },

  async getUnreadCount(): Promise<number> {
    const res = await api<{ count: number }>('/api/notifications/me/unread-count');
    return res.count;
  },

  async markAsRead(id: string): Promise<void> {
    await api(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
  },

  async markAllAsRead(): Promise<void> {
    await api('/api/notifications/read-all', { method: 'PATCH' });
  },
};
