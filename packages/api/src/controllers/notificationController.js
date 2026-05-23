import { getPool } from '../config/database.js';
import { mapNotificationRow } from '../utils/rows.js';

const pool = getPool();

export const notificationController = {
  async getMyNotifications(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT n.*, p.title AS auction_title
         FROM notification n
         LEFT JOIN auction a ON a.id = n.auction_id
         LEFT JOIN product p ON p.id = a.product_id
         WHERE n.user_id = ?
         ORDER BY n.created_at DESC
         LIMIT 50`,
        [req.user.id]
      );
      res.json(rows.map(mapNotificationRow));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Không tải được thông báo' });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const [[row]] = await pool.execute(
        `SELECT COUNT(*) AS c FROM notification WHERE user_id = ? AND is_read = 0`,
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
      await pool.execute(`UPDATE notification SET is_read = 1 WHERE user_id = ?`, [
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
        `UPDATE notification SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [id, req.user.id]
      );
      res.json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },
};
