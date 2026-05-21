import { getPool } from '../config/database.js';
import { mapAuctionRow, mapTransactionRow, mapUserRow } from '../utils/rows.js';
import { finalizeAuction, finalizeExpiredAuctions } from '../services/auctionFinalize.js';

const pool = getPool();

export const adminController = {
  async getDashboard(req, res) {
    try {
      const [[rev]] = await pool.execute(
        `SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE status = 'completed'`
      );
      const [[activeA]] = await pool.execute(
        `SELECT COUNT(*) AS c FROM auctions WHERE status = 'active'`
      );
      const [[usersC]] = await pool.execute(`SELECT COUNT(*) AS c FROM users`);
      const [[pendingT]] = await pool.execute(
        `SELECT COUNT(*) AS c FROM transactions WHERE status = 'pending'`
      );
      const [recentA] = await pool.execute(
        `SELECT * FROM auctions WHERE status = 'active' ORDER BY id DESC LIMIT 5`
      );
      const [recentT] = await pool.execute(
        `SELECT t.*, u.name AS user_name, a.title AS auction_title
         FROM transactions t
         JOIN users u ON u.id = t.user_id
         JOIN auctions a ON a.id = t.auction_id
         ORDER BY t.created_at DESC LIMIT 5`
      );
      const txMapped = recentT.map((row) =>
        mapTransactionRow({
          id: row.id,
          auction_id: row.auction_id,
          auction_title: row.auction_title,
          user_id: row.user_id,
          user_name: row.user_name,
          amount: row.amount,
          created_at: row.created_at,
          status: row.status,
        })
      );
      res.json({
        totalRevenue: Number(rev.total),
        activeAuctions: Number(activeA.c),
        totalUsers: Number(usersC.c),
        pendingTransactions: Number(pendingT.c),
        revenueGrowth: 15.3,
        userGrowth: 8.2,
        auctionGrowth: 12.5,
        recentAuctions: recentA.map(mapAuctionRow),
        recentTransactions: txMapped,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async getRevenueChart(req, res) {
    try {
      const [rows] = await pool.execute(`
        SELECT
          DATE_FORMAT(created_at, '%Y-%m') AS month,
          SUM(amount) AS revenue,
          COUNT(DISTINCT auction_id) AS auctions
        FROM transactions
        WHERE status = 'completed'
          AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
      `);
      res.json(
        rows.map((row) => ({
          month: row.month,
          revenue: Number(row.revenue),
          auctions: Number(row.auctions),
        }))
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async getCategoriesChart(req, res) {
    try {
      const [rows] = await pool.execute(`
        SELECT category, COUNT(*) AS count
        FROM auctions
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      `);
      const total = rows.reduce((sum, row) => sum + Number(row.count), 0);
      const colors = [
        '#d4af37', '#8b7355', '#a67c52', '#c9a961', '#b89968',
        '#9b7e46', '#8a6d3f', '#7a5c38', '#6b4b31', '#5c3a2a',
      ];
      res.json(
        rows.map((row, index) => ({
          name: row.category,
          value: Math.round((Number(row.count) / total) * 100),
          color: colors[index % colors.length],
        }))
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async getActivityChart(req, res) {
    try {
      const [rows] = await pool.execute(`
        SELECT
          HOUR(created_at) AS hour,
          COUNT(*) AS bids
        FROM bids
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY HOUR(created_at)
        ORDER BY hour ASC
      `);
      const activityData = [];
      for (let h = 0; h < 24; h++) {
        const found = rows.find((r) => r.hour === h);
        activityData.push({
          hour: `${String(h).padStart(2, '0')}:00`,
          bids: found ? Number(found.bids) : 0,
        });
      }
      res.json(activityData);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async getUsers(req, res) {
    try {
      const q = req.query.search ? `%${String(req.query.search)}%` : null;
      let sql = `SELECT u.id, u.name, u.email, u.role, u.status, u.join_date,
        (SELECT COUNT(*) FROM bids b WHERE b.user_id = u.id) AS total_bids,
        (SELECT COALESCE(SUM(amount),0) FROM bids b WHERE b.user_id = u.id) AS total_spent
        FROM users u`;
      const params = [];
      if (q) {
        sql += ` WHERE u.name LIKE ? OR u.email LIKE ?`;
        params.push(q, q);
      }
      sql += ` ORDER BY u.id ASC`;
      const [rows] = await pool.execute(sql, params);
      res.json(rows.map((r) => mapUserRow(r)));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async updateUserStatus(req, res) {
    try {
      const id = Number(req.params.id);
      const [rows] = await pool.execute(`SELECT status FROM users WHERE id = ?`, [id]);
      if (!rows[0]) return res.status(404).json({ message: 'Không tìm thấy' });
      const next = rows[0].status === 'active' ? 'suspended' : 'active';
      await pool.execute(`UPDATE users SET status = ? WHERE id = ?`, [next, id]);
      const [u] = await pool.execute(
        `SELECT u.id, u.name, u.email, u.role, u.status, u.join_date,
          (SELECT COUNT(*) FROM bids b WHERE b.user_id = u.id) AS total_bids,
          (SELECT COALESCE(SUM(amount),0) FROM bids b WHERE b.user_id = u.id) AS total_spent
         FROM users u WHERE u.id = ?`,
        [id]
      );
      res.json(mapUserRow(u[0]));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async getAuctions(req, res) {
    try {
      const [rows] = await pool.execute(`SELECT * FROM auctions ORDER BY id ASC`);
      res.json(rows.map(mapAuctionRow));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async createAuction(req, res) {
    try {
      const b = req.body || {};
      const endTime = b.endTime ? new Date(b.endTime) : new Date(Date.now() + 24 * 3600 * 1000);
      const [r] = await pool.execute(
        `INSERT INTO auctions (title, description, image, category, starting_bid, min_increment, current_bid, total_bids, end_time, status, seller)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
        [
          b.title,
          b.description,
          b.image,
          b.category,
          Number(b.startingBid),
          Number(b.minIncrement),
          Number(b.startingBid),
          endTime,
          b.status || 'upcoming',
          b.seller || '—',
        ]
      );
      const [rows] = await pool.execute(`SELECT * FROM auctions WHERE id = ?`, [r.insertId]);
      res.status(201).json(mapAuctionRow(rows[0]));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Không tạo được đấu giá' });
    }
  },

  async updateAuction(req, res) {
    try {
      const id = Number(req.params.id);
      const b = req.body || {};
      const [cur] = await pool.execute(`SELECT * FROM auctions WHERE id = ?`, [id]);
      if (!cur[0]) return res.status(404).json({ message: 'Không tìm thấy' });
      const c = cur[0];
      await pool.execute(
        `UPDATE auctions SET title=?, description=?, image=?, category=?, starting_bid=?, min_increment=?, current_bid=?, end_time=?, status=?, seller=? WHERE id=?`,
        [
          b.title ?? c.title,
          b.description ?? c.description,
          b.image ?? c.image,
          b.category ?? c.category,
          Number(b.startingBid ?? c.starting_bid),
          Number(b.minIncrement ?? c.min_increment),
          Number(b.currentBid ?? c.current_bid),
          b.endTime ? new Date(b.endTime) : c.end_time,
          b.status ?? c.status,
          b.seller ?? c.seller,
          id,
        ]
      );
      const [rows] = await pool.execute(`SELECT * FROM auctions WHERE id = ?`, [id]);
      res.json(mapAuctionRow(rows[0]));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Cập nhật thất bại' });
    }
  },

  async deleteAuction(req, res) {
    try {
      const id = Number(req.params.id);
      await pool.execute(`DELETE FROM auctions WHERE id = ?`, [id]);
      res.status(204).send();
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Xóa thất bại' });
    }
  },

  async processExpiredAuctions(req, res) {
    try {
      const results = await finalizeExpiredAuctions();
      res.json({ processed: results.length, results });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Xử lý phiên hết hạn thất bại' });
    }
  },

  async notifyWinner(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: 'ID không hợp lệ' });
      }
      const forceNotify = Boolean(req.body?.force);
      const result = await finalizeAuction(id, { notify: true, forceNotify });
      if (!result.ok) {
        return res.status(404).json({ message: result.message });
      }
      res.json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Gửi thông báo thất bại' });
    }
  },

  async getTransactions(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT t.*, u.name AS user_name, a.title AS auction_title
         FROM transactions t
         JOIN users u ON u.id = t.user_id
         JOIN auctions a ON a.id = t.auction_id
         ORDER BY t.created_at DESC`
      );
      res.json(
        rows.map((row) =>
          mapTransactionRow({
            id: row.id,
            auction_id: row.auction_id,
            auction_title: row.auction_title,
            user_id: row.user_id,
            user_name: row.user_name,
            amount: row.amount,
            created_at: row.created_at,
            status: row.status,
          })
        )
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async updateTransactionStatus(req, res) {
    try {
      const id = Number(req.params.id);
      const status = req.body?.status;
      if (!['completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }
      await pool.execute(`UPDATE transactions SET status = ? WHERE id = ?`, [status, id]);
      const [rows] = await pool.execute(
        `SELECT t.*, u.name AS user_name, a.title AS auction_title
         FROM transactions t
         JOIN users u ON u.id = t.user_id
         JOIN auctions a ON a.id = t.auction_id
         WHERE t.id = ?`,
        [id]
      );
      const row = rows[0];
      res.json(
        mapTransactionRow({
          id: row.id,
          auction_id: row.auction_id,
          auction_title: row.auction_title,
          user_id: row.user_id,
          user_name: row.user_name,
          amount: row.amount,
          created_at: row.created_at,
          status: row.status,
        })
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },
};
