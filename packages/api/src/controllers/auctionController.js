import { getPool } from '../config/database.js';
import { mapAuctionRow } from '../utils/rows.js';
import { finalizeExpiredAuctions } from '../services/auctionFinalize.js';

const pool = getPool();

function buildListWhere(query) {
  const clauses = [];
  const params = [];
  if (query.status) {
    clauses.push('status = ?');
    params.push(query.status);
  }
  if (query.category) {
    clauses.push('category = ?');
    params.push(query.category);
  }
  if (query.search) {
    clauses.push('(title LIKE ? OR description LIKE ? OR category LIKE ? OR seller LIKE ?)');
    const p = `%${query.search}%`;
    params.push(p, p, p, p);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

export const auctionController = {
  async getAll(req, res) {
    try {
      await finalizeExpiredAuctions();
      const { status, category, search, limit } = req.query;
      const { where, params } = buildListWhere({ status, category, search });
      let sql = `SELECT * FROM auctions ${where} ORDER BY id ASC`;
      const lim = Math.min(Number(limit) || 500, 500);
      sql += ` LIMIT ${lim}`;
      const [rows] = await pool.execute(sql, params);
      res.json(rows.map(mapAuctionRow));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Không tải được danh sách đấu giá' });
    }
  },

  async getFeatured(req, res) {
    try {
      const lim = Math.min(Number(req.query.limit) || 4, 20);
      const [rows] = await pool.execute(
        `SELECT * FROM auctions WHERE status = 'active' ORDER BY total_bids DESC LIMIT ${lim}`
      );
      res.json(rows.map(mapAuctionRow));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async getTrending(req, res) {
    try {
      const lim = Math.min(Number(req.query.limit) || 6, 20);
      const [rows] = await pool.execute(
        `SELECT * FROM auctions WHERE status = 'active' ORDER BY end_time ASC LIMIT ${lim}`
      );
      res.json(rows.map(mapAuctionRow));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' });
      const [rows] = await pool.execute(`SELECT * FROM auctions WHERE id = ?`, [id]);
      const row = rows[0];
      if (!row) return res.status(404).json({ message: 'Không tìm thấy đấu giá' });
      res.json(mapAuctionRow(row));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async getBidHistory(req, res) {
    try {
      const auctionId = Number(req.params.id);
      const [rows] = await pool.execute(
        `SELECT b.amount, b.created_at, b.user_id
         FROM bids b
         WHERE b.auction_id = ?
         ORDER BY b.created_at DESC
         LIMIT 30`,
        [auctionId]
      );
      const out = rows.map((r) => ({
        amount: Number(r.amount),
        time: r.created_at,
        userLabel: `Ngườngười dùng #${String(r.user_id).padStart(4, '0')}`,
      }));
      res.json(out);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },
};
