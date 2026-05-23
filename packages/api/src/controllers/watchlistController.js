import { getPool } from '../config/database.js';
import { mapAuctionRow } from '../utils/rows.js';

const pool = getPool();

export const watchlistController = {
  async getWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const [rows] = await pool.execute(
        `SELECT a.*, w.created_at AS watched_at,
                p.name AS product_name, p.title AS product_title,
                p.description AS product_description, p.image AS product_image,
                p.category_id, c.name AS category_name,
                seller.name AS seller_name,
                (SELECT COUNT(*) FROM auction_history h WHERE h.auction_id = a.id) AS total_bids
         FROM watchlist w
         JOIN auction a ON a.id = w.auction_id
         JOIN product p ON p.id = a.product_id
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN user seller ON seller.id = a.seller_id
         WHERE w.user_id = ?
         ORDER BY w.created_at DESC`,
        [userId]
      );
      res.json({
        watchlist: rows.map(mapAuctionRow),
        total: rows.length,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Không tải được danh sách theo dõi' });
    }
  },

  async addToWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const auctionId = Number(req.params.auctionId);

      if (Number.isNaN(auctionId)) {
        return res.status(400).json({ message: 'ID đấu giá không hợp lệ' });
      }

      const [auctions] = await pool.execute(`SELECT id FROM auction WHERE id = ?`, [auctionId]);
      if (!auctions[0]) {
        return res.status(404).json({ message: 'Không tìm thấy đấu giá' });
      }

      const [existing] = await pool.execute(
        `SELECT * FROM watchlist WHERE user_id = ? AND auction_id = ?`,
        [userId, auctionId]
      );

      if (existing[0]) {
        return res.status(409).json({ message: 'Đã theo dõi đấu giá này' });
      }

      await pool.execute(
        `INSERT INTO watchlist (user_id, auction_id) VALUES (?, ?)`,
        [userId, auctionId]
      );

      res.status(201).json({ message: 'Đã thêm vào danh sách theo dõi', auctionId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Không thể thêm vào danh sách theo dõi' });
    }
  },

  async removeFromWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const auctionId = Number(req.params.auctionId);

      if (Number.isNaN(auctionId)) {
        return res.status(400).json({ message: 'ID đấu giá không hợp lệ' });
      }

      const [result] = await pool.execute(
        `DELETE FROM watchlist WHERE user_id = ? AND auction_id = ?`,
        [userId, auctionId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy trong danh sách theo dõi' });
      }

      res.json({ message: 'Đã xóa khỏi danh sách theo dõi', auctionId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Không thể xóa khỏi danh sách theo dõi' });
    }
  },

  async checkWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const auctionId = Number(req.params.auctionId);

      if (Number.isNaN(auctionId)) {
        return res.status(400).json({ message: 'ID đấu giá không hợp lệ' });
      }

      const [rows] = await pool.execute(
        `SELECT * FROM watchlist WHERE user_id = ? AND auction_id = ?`,
        [userId, auctionId]
      );

      res.json({ isWatching: !!rows[0] });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi kiểm tra trạng thái theo dõi' });
    }
  },
};
