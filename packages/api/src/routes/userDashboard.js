import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { getPool } from '../config/database.js';
import { mapAuctionRow } from '../utils/rows.js';

const router = Router();
const pool = getPool();

router.use(authRequired);

// Stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Active bids count
    const [activeBids] = await pool.execute(
      `SELECT COUNT(DISTINCT h.auction_id) as count
       FROM auction_history h
       JOIN auction a ON a.id = h.auction_id
       WHERE h.user_id = ? AND a.status_id = 1`,
      [userId]
    );

    // Won auctions count
    const [wonAuctions] = await pool.execute(
      `SELECT COUNT(*) as count FROM auction WHERE winner_id = ?`,
      [userId]
    );

    // My auctions count
    const [myAuctions] = await pool.execute(
      `SELECT COUNT(*) as count FROM auction WHERE seller_id = ?`,
      [userId]
    );

    // Pending payments count
    const [pendingPayments] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM transaction_history t
       JOIN auction a ON a.id = t.auction_id
       WHERE t.user_id = ? AND a.winner_id = ? AND t.status = 'pending'`,
      [userId, userId]
    );

    // Watched auctions count
    const [watchedAuctions] = await pool.execute(
      `SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?`,
      [userId]
    );

    // Recent bids
    const [recentBids] = await pool.execute(
      `SELECT h.*, p.title AS auction_title, a.current_price, a.status_id
       FROM auction_history h
       JOIN auction a ON a.id = h.auction_id
       JOIN product p ON p.id = a.product_id
       WHERE h.user_id = ?
       ORDER BY h.bid_time DESC
       LIMIT 5`,
      [userId]
    );

    // Get winning status for each bid
    const recentBidsWithStatus = await Promise.all(
      recentBids.map(async (bid) => {
        const [topBid] = await pool.execute(
          `SELECT user_id, bid_amount FROM auction_history 
           WHERE auction_id = ? ORDER BY bid_amount DESC LIMIT 1`,
          [bid.auction_id]
        );
        const isWinning = topBid[0] && 
          Number(topBid[0].user_id) === userId && 
          Number(topBid[0].bid_amount) === Number(bid.bid_amount);
        return {
          id: String(bid.id),
          auctionId: String(bid.auction_id),
          userId: String(bid.user_id),
          bidAmount: Number(bid.bid_amount),
          bidTime: bid.bid_time instanceof Date ? bid.bid_time.toISOString() : bid.bid_time,
          auctionTitle: bid.auction_title,
          currentPrice: Number(bid.current_price),
          statusId: Number(bid.status_id),
          isWinning: Boolean(isWinning),
        };
      })
    );

    // My auctions (recent)
    const [myAuctionsList] = await pool.execute(
      `SELECT a.*, p.title, p.image,
              (SELECT COUNT(*) FROM auction_history h WHERE h.auction_id = a.id) as total_bids
       FROM auction a
       JOIN product p ON p.id = a.product_id
       WHERE a.seller_id = ?
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [userId]
    );

    const myAuctionsFormatted = myAuctionsList.map((a) => ({
      id: String(a.id),
      title: a.title,
      image: a.image,
      currentPrice: Number(a.current_price),
      startPrice: Number(a.start_price),
      statusId: Number(a.status_id),
      totalBids: Number(a.total_bids),
      endTime: a.end_time instanceof Date ? a.end_time.toISOString() : a.end_time,
    }));

    res.json({
      activeBids: Number(activeBids[0]?.count || 0),
      wonAuctions: Number(wonAuctions[0]?.count || 0),
      myAuctions: Number(myAuctions[0]?.count || 0),
      pendingPayments: Number(pendingPayments[0]?.count || 0),
      watchedAuctions: Number(watchedAuctions[0]?.count || 0),
      recentBids: recentBidsWithStatus,
      myAuctionsList: myAuctionsFormatted,
    });
  } catch (e) {
    console.error('User stats error:', e);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
  }
});

export default router;

// User's own auctions CRUD
router.get('/auctions', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT a.*,
              p.name AS product_name, p.title AS product_title,
              p.description AS product_description, p.image AS product_image,
              p.category_id, c.name AS category_name,
              seller.name AS seller_name,
              (SELECT COUNT(*) FROM auction_history h WHERE h.auction_id = a.id) AS total_bids
       FROM auction a
       JOIN product p ON p.id = a.product_id
       LEFT JOIN product_category c ON c.id = p.category_id
       JOIN user seller ON seller.id = a.seller_id
       WHERE a.seller_id = ?
       ORDER BY a.id DESC`,
      [userId]
    );
    res.json(rows.map(mapAuctionRow));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đấu giá' });
  }
});

router.post('/auctions', async (req, res) => {
  try {
    const userId = req.user.id;
    const b = req.body || {};
    const startPrice = Number(b.startPrice || b.startingBid);
    const bidIncrement = Number(b.bidIncrement || b.minIncrement || 1000);
    const durationMinutes = Number(b.durationMinutes || 15);
    const statusId = Number(b.statusId || 1);

    if (!b.name && !b.title && !b.productId) {
      return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
    }
    if (!startPrice) {
      return res.status(400).json({ message: 'Giá khởi điểm không hợp lệ' });
    }

    let productId = Number(b.productId);
    if (!productId) {
      const [prodResult] = await pool.execute(
        `INSERT INTO product (name, title, description, category_id, image, start_price, status, seller_id)
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
        [
          b.name || b.title,
          b.title || b.name,
          b.description || null,
          b.categoryId ? Number(b.categoryId) : null,
          b.image || null,
          startPrice,
          userId,
        ]
      );
      productId = prodResult.insertId;
    }

    const [r] = await pool.execute(
      `INSERT INTO auction (product_id, seller_id, start_price, current_price, bid_increment, start_time, end_time, duration_minutes, status_id)
       VALUES (?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE), ?, ?)`,
      [productId, userId, startPrice, startPrice, bidIncrement, durationMinutes, durationMinutes, statusId]
    );

    const [rows] = await pool.execute(
      `SELECT a.*,
              p.name AS product_name, p.title AS product_title,
              p.description AS product_description, p.image AS product_image,
              p.category_id, c.name AS category_name,
              seller.name AS seller_name,
              (SELECT COUNT(*) FROM auction_history h WHERE h.auction_id = a.id) AS total_bids
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
});

router.put('/auctions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const b = req.body || {};

    // Verify ownership
    const [[auctionRow]] = await pool.execute(
      `SELECT product_id, seller_id FROM auction WHERE id = ?`,
      [id]
    );
    if (!auctionRow) return res.status(404).json({ message: 'Không tìm thấy đấu giá' });
    if (auctionRow.seller_id !== userId) return res.status(403).json({ message: 'Không có quyền' });

    const auctionUpdates = [];
    const auctionValues = [];
    if (b.startPrice !== undefined) { auctionUpdates.push('start_price = ?'); auctionValues.push(Number(b.startPrice)); }
    if (b.currentPrice !== undefined) { auctionUpdates.push('current_price = ?'); auctionValues.push(Number(b.currentPrice)); }
    if (b.bidIncrement !== undefined) { auctionUpdates.push('bid_increment = ?'); auctionValues.push(Number(b.bidIncrement)); }
    if (b.statusId !== undefined) { auctionUpdates.push('status_id = ?'); auctionValues.push(Number(b.statusId)); }
    if (b.endTime) { auctionUpdates.push('end_time = ?'); auctionValues.push(new Date(b.endTime)); }

    if (auctionUpdates.length > 0) {
      auctionValues.push(id);
      await pool.execute(`UPDATE auction SET ${auctionUpdates.join(', ')} WHERE id = ?`, auctionValues);
    }

    // Update product
    const productUpdates = [];
    const productValues = [];
    if (b.title !== undefined) { productUpdates.push('name = ?', 'title = ?'); productValues.push(b.title, b.title); }
    if (b.description !== undefined) { productUpdates.push('description = ?'); productValues.push(b.description); }
    if (b.image !== undefined) { productUpdates.push('image = ?'); productValues.push(b.image); }
    if (b.categoryId !== undefined) { productUpdates.push('category_id = ?'); productValues.push(b.categoryId || null); }

    if (productUpdates.length > 0) {
      productValues.push(auctionRow.product_id);
      await pool.execute(`UPDATE product SET ${productUpdates.join(', ')} WHERE id = ?`, productValues);
    }

    const [rows] = await pool.execute(
      `SELECT a.*,
              p.name AS product_name, p.title AS product_title,
              p.description AS product_description, p.image AS product_image,
              p.category_id, c.name AS category_name,
              seller.name AS seller_name,
              (SELECT COUNT(*) FROM auction_history h WHERE h.auction_id = a.id) AS total_bids
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
});

router.delete('/auctions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    const [[auctionRow]] = await pool.execute(
      `SELECT seller_id FROM auction WHERE id = ?`,
      [id]
    );
    if (!auctionRow) return res.status(404).json({ message: 'Không tìm thấy đấu giá' });
    if (auctionRow.seller_id !== userId) return res.status(403).json({ message: 'Không có quyền' });

    await pool.execute(`DELETE FROM auction WHERE id = ?`, [id]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Xóa thất bại' });
  }
});

// User's transactions
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT t.*, a.title AS auction_title
       FROM transaction_history t
       LEFT JOIN auction a ON a.id = t.auction_id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json({
      transactions: rows.map((t) => ({
        id: String(t.id),
        type: t.type,
        amount: Number(t.amount),
        status: t.status,
        createdAt: t.created_at instanceof Date ? t.created_at.toISOString() : t.created_at,
        description: t.type === 'payment' ? `Thanh toán đấu giá: ${t.auction_title || ''}` : `Giao dịch ${t.type}`,
        auctionTitle: t.auction_title,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi khi lấy lịch sử giao dịch' });
  }
});
