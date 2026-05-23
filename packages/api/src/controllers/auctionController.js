import { getPool } from '../config/database.js';
import { mapAuctionRow } from '../utils/rows.js';
import { finalizeExpiredAuctions } from '../services/auctionFinalize.js';

const pool = getPool();

const AUCTION_COLS = `
  a.id,
  a.product_id,
  a.seller_id,
  a.winner_id,
  a.start_price,
  a.current_price,
  a.bid_increment,
  a.start_time,
  a.end_time,
  a.duration_minutes,
  a.status_id,
  a.created_at,
  a.updated_at,
  p.name AS product_name,
  p.title AS product_title,
  p.description AS product_description,
  p.image AS product_image,
  p.category_id,
  c.name AS category_name,
  s.name AS status_name,
  seller.name AS seller_name,
  (
    SELECT COUNT(*) FROM auction_history h WHERE h.auction_id = a.id
  ) AS total_bids
`;

function buildListWhere(query) {
  const clauses = ['p.image IS NOT NULL', "p.image != ''", "p.image != 'null'"];
  const params = [];
  if (query.statusId) {
    clauses.push('a.status_id = ?');
    params.push(Number(query.statusId));
  }
  if (query.status) {
    const statusMap = { active: 1, ended: 2, cancelled: 3 };
    const sid = statusMap[query.status];
    if (sid) {
      clauses.push('a.status_id = ?');
      params.push(sid);
    }
  }
  if (query.categoryId) {
    clauses.push('p.category_id = ?');
    params.push(Number(query.categoryId));
  }
  if (query.search) {
    clauses.push('(p.name LIKE ? OR p.title LIKE ? OR p.description LIKE ? OR c.name LIKE ?)');
    const p = `%${query.search}%`;
    params.push(p, p, p, p);
  }
  if (query.sellerId) {
    clauses.push('a.seller_id = ?');
    params.push(Number(query.sellerId));
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

export const auctionController = {
  async getAll(req, res) {
    try {
      await finalizeExpiredAuctions();
      const { status, category, search, limit, statusId, categoryId } = req.query;
      const { where, params } = buildListWhere({ status, category, search, statusId, categoryId });
      let sql = `
        SELECT ${AUCTION_COLS}
        FROM auction a
        INNER JOIN (
          SELECT MAX(id) as latest_id
          FROM auction
          GROUP BY product_id
        ) latest ON a.id = latest.latest_id
        JOIN product p ON p.id = a.product_id
        LEFT JOIN product_category c ON c.id = p.category_id
        JOIN auction_status s ON s.id = a.status_id
        JOIN user seller ON seller.id = a.seller_id
        ${where}
        ORDER BY a.id ASC
      `;
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
        `SELECT ${AUCTION_COLS}
         FROM auction a
         JOIN product p ON p.id = a.product_id
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN auction_status s ON s.id = a.status_id
         JOIN user seller ON seller.id = a.seller_id
         WHERE a.status_id = 1
           AND p.image IS NOT NULL AND p.image != '' AND p.image != 'null'
         ORDER BY (
           SELECT COUNT(*) FROM auction_history h WHERE h.auction_id = a.id
         ) DESC
         LIMIT ${lim}`
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
        `SELECT ${AUCTION_COLS}
         FROM auction a
         JOIN product p ON p.id = a.product_id
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN auction_status s ON s.id = a.status_id
         JOIN user seller ON seller.id = a.seller_id
         WHERE a.status_id = 1
           AND p.image IS NOT NULL AND p.image != '' AND p.image != 'null'
         ORDER BY a.end_time ASC
         LIMIT ${lim}`
      );
      res.json(rows.map(mapAuctionRow));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async getNew(req, res) {
    try {
      const lim = Math.min(Number(req.query.limit) || 12, 50);
      const [rows] = await pool.execute(
        `SELECT ${AUCTION_COLS}
         FROM auction a
         JOIN product p ON p.id = a.product_id
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN auction_status s ON s.id = a.status_id
         JOIN user seller ON seller.id = a.seller_id
         WHERE a.status_id = 1
           AND p.image IS NOT NULL AND p.image != '' AND p.image != 'null'
         ORDER BY a.created_at DESC
         LIMIT ${lim}`
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
      const [rows] = await pool.execute(
        `SELECT ${AUCTION_COLS}
         FROM auction a
         JOIN product p ON p.id = a.product_id
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN auction_status s ON s.id = a.status_id
         JOIN user seller ON seller.id = a.seller_id
         WHERE a.id = ?`,
        [id]
      );
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
        `SELECT h.id, h.auction_id, h.user_id, h.bid_amount, h.bid_time,
                u.username AS user_name
         FROM auction_history h
         JOIN user u ON u.id = h.user_id
         WHERE h.auction_id = ?
         ORDER BY h.bid_time DESC
         LIMIT 30`,
        [auctionId]
      );
      const out = rows.map((r) => ({
        id: String(r.id),
        auctionId: String(r.auction_id),
        userId: String(r.user_id),
        userName: r.user_name,
        bidAmount: Number(r.bid_amount),
        bidTime: r.bid_time instanceof Date ? r.bid_time.toISOString() : r.bid_time,
      }));
      res.json(out);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },
};
