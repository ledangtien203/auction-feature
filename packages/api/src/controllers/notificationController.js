import { getPool } from '../config/database.js';

const pool = getPool();

function mapNotificationRow(row) {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    type: row.type,
    title: row.title,
    message: row.message,
    auctionId: row.auction_id != null ? String(row.auction_id) : null,
    auctionTitle: row.auction_title ?? null,
    isRead: Boolean(row.is_read),
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export const notificationController = {
  async getMyNotifications(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT n.*, a.title AS auction_title
         FROM notifications n
         LEFT JOIN auctions a ON a.id = n.auction_id
         WHERE n.user_id = ?
         ORDER BY n.created_at DESC
         LIMIT 50`,
        [req.user.id]
      );
      res.json({ notifications: rows.map(mapNotificationRow) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Không tải được thông báo' });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0`,
        [req.user.id]
      );
      res.json({ count: Number(row.c) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async markAllAsRead(req, res) {
    try {
      await pool.execute(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [
        req.user.id,
      ]);
      res.json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async markAsRead(req, res) {
    try {
      const id = Number(req.params.id);
      await pool.execute(
        `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [id, req.user.id]
      );
      res.json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },
};
