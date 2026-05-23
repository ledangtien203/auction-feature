import { getPool } from '../config/database.js';
import { mapAuctionRow, mapTransactionRow, mapUserRow, mapProductCategoryRow } from '../utils/rows.js';
import { finalizeAuction, finalizeExpiredAuctions } from '../services/auctionFinalize.js';

const pool = getPool();

const AUCTION_COLS = `
  a.id, a.product_id, a.seller_id, a.winner_id,
  a.start_price, a.current_price, a.bid_increment,
  a.start_time, a.end_time, a.duration_minutes,
  a.status_id, a.created_at, a.updated_at,
  p.name AS product_name, p.title AS product_title,
  p.description AS product_description, p.image AS product_image,
  p.category_id, c.name AS category_name,
  seller.name AS seller_name,
  (SELECT COUNT(*) FROM auction_history h WHERE h.auction_id = a.id) AS total_bids
`;

export const adminController = {
  async getDashboard(req, res) {
    try {
      const [[rev]] = await pool.execute(
        `SELECT COALESCE(SUM(amount),0) AS total FROM transaction_history WHERE status = 'completed'`
      );
      const [[activeA]] = await pool.execute(
        `SELECT COUNT(*) AS c FROM auction WHERE status_id = 1`
      );
      const [[usersC]] = await pool.execute(`SELECT COUNT(*) AS c FROM user WHERE role_id = 'user'`);
      const [[pendingT]] = await pool.execute(
        `SELECT COUNT(*) AS c FROM transaction_history WHERE status = 'pending'`
      );
      const [recentA] = await pool.execute(
        `SELECT ${AUCTION_COLS}
         FROM auction a
         JOIN product p ON p.id = a.product_id
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN user seller ON seller.id = a.seller_id
         WHERE a.status_id = 1
         ORDER BY a.id DESC LIMIT 5`
      );
      // New users instead of transactions
      const [newUsers] = await pool.execute(
        `SELECT u.id, u.username, u.email, u.name, u.created_at, u.is_verified, u.rating
         FROM user u
         WHERE u.role_id = 'user'
         ORDER BY u.created_at DESC LIMIT 5`
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
        newUsers: newUsers.map(mapUserRow),
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
        FROM transaction_history
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
        SELECT c.name, COUNT(a.id) AS count
        FROM product_category c
        LEFT JOIN product p ON p.category_id = c.id
        LEFT JOIN auction a ON a.product_id = p.id
        GROUP BY c.id, c.name
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
          name: row.name,
          value: total > 0 ? Math.round((Number(row.count) / total) * 100) : 0,
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
          HOUR(bid_time) AS hour,
          COUNT(*) AS bids
        FROM auction_history
        WHERE bid_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY HOUR(bid_time)
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
      let sql = `SELECT u.*, r.name AS role_name,
        (SELECT COUNT(*) FROM auction_history h WHERE h.user_id = u.id) AS total_bids,
        (SELECT COALESCE(SUM(bid_amount),0) FROM auction_history h WHERE h.user_id = u.id) AS total_spent
        FROM user u
        LEFT JOIN role r ON r.id = u.role_id`;
      const params = [];
      if (q) {
        sql += ` WHERE u.username LIKE ? OR u.email LIKE ? OR u.name LIKE ?`;
        params.push(q, q, q);
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
      const [rows] = await pool.execute(`SELECT is_blocked FROM user WHERE id = ?`, [id]);
      if (!rows[0]) return res.status(404).json({ message: 'Không tìm thấy' });
      const next = rows[0].is_blocked ? 0 : 1;
      await pool.execute(`UPDATE user SET is_blocked = ? WHERE id = ?`, [next, id]);
      const [u] = await pool.execute(
        `SELECT u.*, r.name AS role_name,
          (SELECT COUNT(*) FROM auction_history h WHERE h.user_id = u.id) AS total_bids,
          (SELECT COALESCE(SUM(bid_amount),0) FROM auction_history h WHERE h.user_id = u.id) AS total_spent
         FROM user u LEFT JOIN role r ON r.id = u.role_id WHERE u.id = ?`,
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
      const [rows] = await pool.execute(
        `SELECT ${AUCTION_COLS}
         FROM auction a
         JOIN product p ON p.id = a.product_id
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN user seller ON seller.id = a.seller_id
         ORDER BY a.id ASC`
      );
      res.json(rows.map(mapAuctionRow));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async createAuction(req, res) {
    try {
      const b = req.body || {};
      const sellerId = Number(b.sellerId || req.user.id);
      const startPrice = Number(b.startPrice);
      const bidIncrement = Number(b.bidIncrement || 1000);
      const durationMinutes = Number(b.durationMinutes || 15);
      const statusId = Number(b.statusId || 1);

      let productId = Number(b.productId);

      // If productId not provided, create product from form fields
      if (!productId) {
        if (!b.name && !b.title) {
          return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
        }
        const productName = b.name || b.title;
        const productTitle = b.title || b.name;
        const [prodResult] = await pool.execute(
          `INSERT INTO product (name, title, description, category_id, image, start_price, status, seller_id)
           VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
          [
            productName,
            productTitle,
            b.description || b.productDescription || null,
            b.categoryId ? Number(b.categoryId) : null,
            b.image || b.productImage || null,
            startPrice,
            sellerId,
          ]
        );
        productId = prodResult.insertId;
      }

      if (!startPrice) {
        return res.status(400).json({ message: 'Giá khởi điểm không hợp lệ' });
      }

      const [r] = await pool.execute(
        `INSERT INTO auction (product_id, seller_id, start_price, current_price, bid_increment, start_time, end_time, duration_minutes, status_id)
         VALUES (?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE), ?, ?)`,
        [productId, sellerId, startPrice, startPrice, bidIncrement, durationMinutes, durationMinutes, statusId]
      );

      const [rows] = await pool.execute(
        `SELECT ${AUCTION_COLS}
         FROM auction a
         JOIN product p ON p.id = a.product_id
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN user seller ON seller.id = a.seller_id
         WHERE a.id = ?`,
        [r.insertId]
      );
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
      const updates = [];
      const values = [];

      if (b.startPrice !== undefined) { updates.push('start_price = ?'); values.push(Number(b.startPrice)); }
      if (b.currentPrice !== undefined) { updates.push('current_price = ?'); values.push(Number(b.currentPrice)); }
      if (b.bidIncrement !== undefined) { updates.push('bid_increment = ?'); values.push(Number(b.bidIncrement)); }
      if (b.statusId !== undefined) { updates.push('status_id = ?'); values.push(Number(b.statusId)); }
      if (b.endTime) { updates.push('end_time = ?'); values.push(new Date(b.endTime)); }
      if (b.winnerId !== undefined) { updates.push('winner_id = ?'); values.push(b.winnerId ? Number(b.winnerId) : null); }

      if (updates.length > 0) {
        values.push(id);
        await pool.execute(`UPDATE auction SET ${updates.join(', ')} WHERE id = ?`, values);
      }

      // Update product fields if provided
      if (b.title !== undefined || b.description !== undefined ||
          b.productDescription !== undefined || b.image !== undefined ||
          b.categoryId !== undefined) {
        const [auctionRows] = await pool.execute(
          `SELECT product_id FROM auction WHERE id = ?`,
          [id]
        );
        const productId = auctionRows[0]?.product_id;
        if (productId) {
          const productUpdates = [];
          const productValues = [];
          if (b.title !== undefined) {
            productUpdates.push('name = ?', 'title = ?');
            productValues.push(b.title, b.title);
          }
          if (b.description !== undefined) { productUpdates.push('description = ?'); productValues.push(b.description); }
          if (b.productDescription !== undefined) { productUpdates.push('description = ?'); productValues.push(b.productDescription); }
          if (b.image !== undefined) { productUpdates.push('image = ?'); productValues.push(b.image); }
          if (b.categoryId !== undefined) { productUpdates.push('category_id = ?'); productValues.push(b.categoryId || null); }
          if (productUpdates.length > 0) {
            productValues.push(productId);
            await pool.execute(`UPDATE product SET ${productUpdates.join(', ')} WHERE id = ?`, productValues);
          }
        }
      }

      const [rows] = await pool.execute(
        `SELECT ${AUCTION_COLS}
         FROM auction a
         JOIN product p ON p.id = a.product_id
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN user seller ON seller.id = a.seller_id
         WHERE a.id = ?`,
        [id]
      );
      res.json(mapAuctionRow(rows[0]));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Cập nhật thất bại' });
    }
  },

  async deleteAuction(req, res) {
    try {
      const id = Number(req.params.id);
      await pool.execute(`DELETE FROM auction WHERE id = ?`, [id]);
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
        `SELECT t.*, u.username AS user_name, p.title AS auction_title
         FROM transaction_history t
         JOIN user u ON u.id = t.user_id
         LEFT JOIN auction a ON a.id = t.auction_id
         LEFT JOIN product p ON p.id = a.product_id
         ORDER BY t.created_at DESC`
      );
      res.json(rows.map(mapTransactionRow));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async updateTransactionStatus(req, res) {
    try {
      const id = Number(req.params.id);
      const status = req.body?.status;
      if (!['completed', 'failed', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }
      await pool.execute(`UPDATE transaction_history SET status = ? WHERE id = ?`, [status, id]);
      const [rows] = await pool.execute(
        `SELECT t.*, u.username AS user_name, p.title AS auction_title
         FROM transaction_history t
         JOIN user u ON u.id = t.user_id
         LEFT JOIN auction a ON a.id = t.auction_id
         LEFT JOIN product p ON p.id = a.product_id
         WHERE t.id = ?`,
        [id]
      );
      res.json(mapTransactionRow(rows[0]));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async getCategories(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM product_category ORDER BY id ASC`
      );
      res.json(rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async createCategory(req, res) {
    try {
      const { name, description, image } = req.body || {};
      if (!name) return res.status(400).json({ message: 'Tên danh mục không được trống' });
      const [r] = await pool.execute(
        `INSERT INTO product_category (name, description, image) VALUES (?, ?, ?)`,
        [name, description || null, image || null]
      );
      const [rows] = await pool.execute(
        `SELECT * FROM product_category WHERE id = ?`,
        [r.insertId]
      );
      res.status(201).json(rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Tạo danh mục thất bại' });
    }
  },

  async updateCategory(req, res) {
    try {
      const id = Number(req.params.id);
      const { name, description, image } = req.body || {};
      if (!name) return res.status(400).json({ message: 'Tên danh mục không được trống' });
      await pool.execute(
        `UPDATE product_category SET name = ?, description = ?, image = ? WHERE id = ?`,
        [name, description || null, image || null, id]
      );
      const [rows] = await pool.execute(`SELECT * FROM product_category WHERE id = ?`, [id]);
      if (!rows[0]) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      res.json(rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Cập nhật danh mục thất bại' });
    }
  },

  async deleteCategory(req, res) {
    try {
      const id = Number(req.params.id);
      // Check if category has products
      const [[productCount]] = await pool.execute(
        `SELECT COUNT(*) AS c FROM product WHERE category_id = ?`,
        [id]
      );
      if (productCount.c > 0) {
        return res.status(400).json({
          message: `Không thể xóa: danh mục có ${productCount.c} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`
        });
      }
      await pool.execute(`DELETE FROM product_category WHERE id = ?`, [id]);
      res.status(204).send();
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Xóa danh mục thất bại' });
    }
  },

  async getProducts(req, res) {
    try {
      const search = req.query.search ? `%${req.query.search}%` : null;
      let sql = `
        SELECT p.*, c.name AS category_name, u.username AS seller_name,
          (SELECT COUNT(*) FROM auction a WHERE a.product_id = p.id) AS auction_count
        FROM product p
        LEFT JOIN product_category c ON c.id = p.category_id
        JOIN user u ON u.id = p.seller_id
      `;
      const params = [];
      if (search) {
        sql += ` WHERE p.name LIKE ? OR p.title LIKE ?`;
        params.push(search, search);
      }
      sql += ` ORDER BY p.id DESC`;
      const [rows] = await pool.execute(sql, params);
      res.json(rows.map(mapProductRow));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async createProduct(req, res) {
    try {
      const { name, title, description, categoryId, image, startPrice, status, sellerId } = req.body || {};
      if (!name) return res.status(400).json({ message: 'Tên sản phẩm không được trống' });
      if (!sellerId) return res.status(400).json({ message: 'Người bán không được trống' });

      const [r] = await pool.execute(
        `INSERT INTO product (name, title, description, category_id, image, start_price, status, seller_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, title || name, description || null, categoryId || null, image || null, startPrice || 0, status || 'active', sellerId]
      );
      const [rows] = await pool.execute(
        `SELECT p.*, c.name AS category_name, u.username AS seller_name
         FROM product p
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN user u ON u.id = p.seller_id
         WHERE p.id = ?`,
        [r.insertId]
      );
      res.status(201).json(mapProductRow(rows[0]));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Tạo sản phẩm thất bại' });
    }
  },

  async updateProduct(req, res) {
    try {
      const id = Number(req.params.id);
      const { name, title, description, categoryId, image, startPrice, status } = req.body || {};
      const updates = [];
      const values = [];

      if (name !== undefined) { updates.push('name = ?'); values.push(name); }
      if (title !== undefined) { updates.push('title = ?'); values.push(title); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (categoryId !== undefined) { updates.push('category_id = ?'); values.push(categoryId || null); }
      if (image !== undefined) { updates.push('image = ?'); values.push(image || null); }
      if (startPrice !== undefined) { updates.push('start_price = ?'); values.push(startPrice); }
      if (status !== undefined) { updates.push('status = ?'); values.push(status); }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'Không có thông tin nào được cập nhật' });
      }

      values.push(id);
      await pool.execute(`UPDATE product SET ${updates.join(', ')} WHERE id = ?`, values);

      const [rows] = await pool.execute(
        `SELECT p.*, c.name AS category_name, u.username AS seller_name
         FROM product p
         LEFT JOIN product_category c ON c.id = p.category_id
         JOIN user u ON u.id = p.seller_id
         WHERE p.id = ?`,
        [id]
      );
      if (!rows[0]) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      res.json(mapProductRow(rows[0]));
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Cập nhật sản phẩm thất bại' });
    }
  },

  async deleteProduct(req, res) {
    try {
      const id = Number(req.params.id);
      // Check if product has auctions
      const [[auctionCount]] = await pool.execute(
        `SELECT COUNT(*) AS c FROM auction WHERE product_id = ?`,
        [id]
      );
      if (auctionCount.c > 0) {
        return res.status(400).json({
          message: `Không thể xóa: sản phẩm có ${auctionCount.c} phiên đấu giá. Hãy xóa phiên đấu giá trước.`
        });
      }
      await pool.execute(`DELETE FROM product WHERE id = ?`, [id]);
      res.status(204).send();
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Xóa sản phẩm thất bại' });
    }
  },

  async getSettings(req, res) {
    try {
      const [rows] = await pool.execute(`SELECT * FROM settings WHERE id = 1`);
      if (rows[0]) {
        res.json({
          siteName: rows[0].site_name || 'Đấu Giá Trực Tuyến',
          siteEmail: rows[0].site_email || 'contact@daugia.com',
          supportPhone: rows[0].support_phone || '1900 1234',
          address: rows[0].address || '',
          minBidIncrement: rows[0].min_bid_increment || 100000,
          auctionDuration: rows[0].auction_duration || 72,
          commissionRate: rows[0].commission_rate || 10,
          autoExtendAuctions: Boolean(rows[0].auto_extend_auctions),
          requireVerification: Boolean(rows[0].require_verification),
          notifyEmail: Boolean(rows[0].notify_email),
          notifyOverbid: Boolean(rows[0].notify_overbid),
          notifyEndingSoon: Boolean(rows[0].notify_ending_soon),
          bankName: rows[0].bank_name || '',
          accountNumber: rows[0].account_number || '',
          accountName: rows[0].account_name || '',
        });
      } else {
        res.json({
          siteName: 'Đấu Giá Trực Tuyến',
          siteEmail: 'contact@daugia.com',
          supportPhone: '1900 1234',
          address: '',
          minBidIncrement: 100000,
          auctionDuration: 72,
          commissionRate: 10,
          autoExtendAuctions: true,
          requireVerification: true,
          notifyEmail: true,
          notifyOverbid: true,
          notifyEndingSoon: true,
          bankName: '',
          accountNumber: '',
          accountName: '',
        });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async updateSettings(req, res) {
    try {
      const s = req.body || {};
      const settings = {
        siteName: s.siteName || 'Đấu Giá Trực Tuyến',
        siteEmail: s.siteEmail || 'contact@daugia.com',
        supportPhone: s.supportPhone || '1900 1234',
        address: s.address || '',
        minBidIncrement: Number(s.minBidIncrement) || 100000,
        auctionDuration: Number(s.auctionDuration) || 72,
        commissionRate: Number(s.commissionRate) || 10,
        autoExtendAuctions: Boolean(s.autoExtendAuctions) ? 1 : 0,
        requireVerification: Boolean(s.requireVerification) ? 1 : 0,
        notifyEmail: Boolean(s.notifyEmail) ? 1 : 0,
        notifyOverbid: Boolean(s.notifyOverbid) ? 1 : 0,
        notifyEndingSoon: Boolean(s.notifyEndingSoon) ? 1 : 0,
        bankName: s.bankName || '',
        accountNumber: s.accountNumber || '',
        accountName: s.accountName || '',
      };

      // Check if settings row exists
      const [[existing]] = await pool.execute(`SELECT id FROM settings WHERE id = 1`);
      if (existing) {
        await pool.execute(
          `UPDATE settings SET
            site_name = ?, site_email = ?, support_phone = ?, address = ?,
            min_bid_increment = ?, auction_duration = ?, commission_rate = ?,
            auto_extend_auctions = ?, require_verification = ?,
            notify_email = ?, notify_overbid = ?, notify_ending_soon = ?,
            bank_name = ?, account_number = ?, account_name = ?
          WHERE id = 1`,
          [
            settings.siteName, settings.siteEmail, settings.supportPhone, settings.address,
            settings.minBidIncrement, settings.auctionDuration, settings.commissionRate,
            settings.autoExtendAuctions, settings.requireVerification,
            settings.notifyEmail, settings.notifyOverbid, settings.notifyEndingSoon,
            settings.bankName, settings.accountNumber, settings.accountName,
          ]
        );
      } else {
        await pool.execute(
          `INSERT INTO settings (id, site_name, site_email, support_phone, address,
            min_bid_increment, auction_duration, commission_rate,
            auto_extend_auctions, require_verification,
            notify_email, notify_overbid, notify_ending_soon,
            bank_name, account_number, account_name)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            settings.siteName, settings.siteEmail, settings.supportPhone, settings.address,
            settings.minBidIncrement, settings.auctionDuration, settings.commissionRate,
            settings.autoExtendAuctions, settings.requireVerification,
            settings.notifyEmail, settings.notifyOverbid, settings.notifyEndingSoon,
            settings.bankName, settings.accountNumber, settings.accountName,
          ]
        );
      }
      res.json({ message: 'Đã lưu cài đặt' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lưu cài đặt thất bại' });
    }
  },

  async getReportStats(req, res) {
    try {
      const [[totalAuctions]] = await pool.execute(`SELECT COUNT(*) AS c FROM auction`);
      const [[activeAuctions]] = await pool.execute(`SELECT COUNT(*) AS c FROM auction WHERE status_id = 1`);
      const [[endedAuctions]] = await pool.execute(`SELECT COUNT(*) AS c FROM auction WHERE status_id = 2`);
      const [[totalUsers]] = await pool.execute(`SELECT COUNT(*) AS c FROM user WHERE role_id = 'user'`);
      const [[totalRevenue]] = await pool.execute(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM transaction_history WHERE status = 'completed'`
      );
      const [[pendingTransactions]] = await pool.execute(
        `SELECT COUNT(*) AS c FROM transaction_history WHERE status = 'pending'`
      );

      const successRate = totalAuctions.c > 0
        ? Math.round((endedAuctions.c / totalAuctions.c) * 100)
        : 0;

      res.json({
        totalAuctions: totalAuctions.c,
        activeAuctions: activeAuctions.c,
        endedAuctions: endedAuctions.c,
        totalUsers: totalUsers.c,
        totalRevenue: Number(totalRevenue.total),
        pendingTransactions: pendingTransactions.c,
        successRate,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },
};

function mapProductRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name,
    title: row.title || row.name,
    description: row.description || null,
    categoryId: row.category_id != null ? Number(row.category_id) : null,
    categoryName: row.category_name || null,
    image: row.image || null,
    startPrice: Number(row.start_price || 0),
    status: row.status,
    sellerId: Number(row.seller_id),
    sellerName: row.seller_name || null,
    auctionCount: Number(row.auction_count || 0),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}
