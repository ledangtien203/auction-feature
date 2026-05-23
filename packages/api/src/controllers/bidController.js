import { getPool } from '../config/database.js';
import { mapBidRow, mapAuctionRow } from '../utils/rows.js';

const pool = getPool();

function formatVnd(amount) {
  return Number(amount).toLocaleString('vi-VN');
}

export const bidController = {
  async getMyBids(req, res) {
    try {
      const userId = req.user.id;
      const [bids] = await pool.execute(
        `SELECT h.id, h.auction_id, h.user_id, h.bid_amount, h.bid_time,
                p.title AS auction_title
         FROM auction_history h
         JOIN auction a ON a.id = h.auction_id
         JOIN product p ON p.id = a.product_id
         WHERE h.user_id = ?
         ORDER BY h.bid_time DESC`,
        [userId]
      );

      const auctionIds = [...new Set(bids.map((b) => b.auction_id))];
      const winnerByAuction = new Map();
      for (const aid of auctionIds) {
        const [w] = await pool.execute(
          `SELECT user_id, bid_amount FROM auction_history WHERE auction_id = ?
           ORDER BY bid_amount DESC, bid_time ASC LIMIT 1`,
          [aid]
        );
        if (w[0]) {
          winnerByAuction.set(Number(aid), {
            userId: Number(w[0].user_id),
            amount: Number(w[0].bid_amount),
          });
        }
      }

      const out = bids.map((b) => {
        const aid = Number(b.auction_id);
        const win = winnerByAuction.get(aid);
        const isWinning = win && win.userId === userId && Number(b.bid_amount) === win.amount;
        return {
          ...mapBidRow({ ...b, is_winning: isWinning }),
          auctionTitle: b.auction_title,
        };
      });

      const [auctions] =
        auctionIds.length === 0
          ? [[]]
          : await pool.execute(
              `SELECT a.*, p.title AS auction_title
               FROM auction a
               JOIN product p ON p.id = a.product_id
               WHERE a.id IN (${auctionIds.map(() => '?').join(',')})`,
              auctionIds
            );
      const auctionById = new Map(auctions.map((a) => [a.id, mapAuctionRow(a)]));
      res.json({ bids: out, auctions: Object.fromEntries(auctionById) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Không tải được lịch sử đặt giá' });
    }
  },

  async placeBid(req, res) {
    const conn = await pool.getConnection();
    try {
      const auctionId = Number(req.params.auctionId);
      const amount = Number(req.body?.amount);
      if (Number.isNaN(auctionId) || Number.isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
      }

      const [urows] = await conn.execute(`SELECT is_blocked FROM user WHERE id = ?`, [req.user.id]);
      if (!urows[0] || urows[0].is_blocked) {
        return res.status(403).json({ message: 'Tài khoản không thể đặt giá' });
      }

      await conn.beginTransaction();
      const [arows] = await conn.execute(
        `SELECT a.*, p.title AS product_title, s.name AS status_name
         FROM auction a
         JOIN product p ON p.id = a.product_id
         JOIN auction_status s ON s.id = a.status_id
         WHERE a.id = ? FOR UPDATE`,
        [auctionId]
      );
      const a = arows[0];
      if (!a) {
        await conn.rollback();
        return res.status(404).json({ message: 'Không tìm thấy đấu giá' });
      }
      if (a.status_id !== 1) {
        await conn.rollback();
        return res.status(400).json({ message: 'Phiên đấu giá không hoạt động' });
      }
      const end = new Date(a.end_time);
      if (end.getTime() <= Date.now()) {
        await conn.rollback();
        return res.status(400).json({ message: 'Phiên đấu giá đã kết thúc' });
      }
      const current = Number(a.current_price);
      const minInc = Number(a.bid_increment);
      const minNext = current > 0 ? current + minInc : Number(a.start_price);
      if (amount < minNext) {
        await conn.rollback();
        return res.status(400).json({ message: `Giá tối thiểu là ${minNext}` });
      }

      const [prevTopBid] = await conn.execute(
        `SELECT id, user_id, bid_amount FROM auction_history WHERE auction_id = ? ORDER BY bid_amount DESC LIMIT 1`,
        [auctionId]
      );
      const prevTopBidder = prevTopBid[0] || null;

      await conn.execute(
        `INSERT INTO auction_history (auction_id, user_id, bid_amount) VALUES (?, ?, ?)`,
        [auctionId, req.user.id, amount]
      );
      await conn.execute(
        `UPDATE auction SET current_price = ? WHERE id = ?`,
        [amount, auctionId]
      );

      // Gửi thông báo cho tất cả người đã bid trừ người đang bid
      const [allBidders] = await conn.execute(
        `SELECT DISTINCT user_id FROM auction_history 
         WHERE auction_id = ? AND user_id != ?`,
        [auctionId, req.user.id]
      );

      for (const bidder of allBidders) {
        // Xóa thông báo overbid cũ nếu có (để gửi thông báo mới với giá mới)
        await conn.execute(
          `DELETE FROM notification 
           WHERE user_id = ? AND auction_id = ? AND title = 'Bạn đã bị vượt giá!'`,
          [bidder.user_id, auctionId]
        );
        
        // Tạo thông báo overbid mới với giá hiện tại
        const outbidTitle = 'Bạn đã bị vượt giá!';
        const outbidMessage = `Có người đặt giá cao hơn bạn ${formatVnd(amount)} VNĐ cho phiên "${a.product_title}". Hãy đặt giá cao hơn để giành chiến thắng!`;
        await conn.execute(
          `INSERT INTO notification (user_id, title, message, auction_id) VALUES (?, ?, ?, ?)`,
          [bidder.user_id, outbidTitle, outbidMessage, auctionId]
        );
        
        // Emit real-time notification
        if (global.io) {
          global.io.to(`user-${bidder.user_id}`).emit('user-notification', {
            userId: bidder.user_id,
            auctionId: auctionId,
            type: 'outbid',
          });
        }
      }

      await conn.commit();

      const [updated] = await pool.execute(
        `SELECT a.*, p.title AS product_title,
                (SELECT COUNT(*) FROM auction_history h WHERE h.auction_id = a.id) AS total_bids
         FROM auction a
         JOIN product p ON p.id = a.product_id
         WHERE a.id = ?`,
        [auctionId]
      );
      const updatedAuction = mapAuctionRow(updated[0]);

      if (global.io) {
        global.io.to(`auction-${auctionId}`).emit('bid-update', {
          auctionId,
          auction: updatedAuction,
          newBid: {
            id: null,
            auctionId: String(auctionId),
            userId: String(req.user.id),
            bidAmount: amount,
            bidTime: new Date(),
          },
        });

        global.io.emit('auction-activity', {
          type: 'new-bid',
          auctionId,
          bidAmount: amount,
          userId: req.user.id,
          timestamp: new Date(),
        });
      }

      res.json({ auction: updatedAuction });
    } catch (e) {
      await conn.rollback();
      console.error(e);
      res.status(500).json({ message: 'Đặt giá thất bại' });
    } finally {
      conn.release();
    }
  },

  async getWonAuctions(req, res) {
    try {
      const userId = req.user.id;
      const [auctions] = await pool.execute(
        `SELECT a.*, p.title AS product_title, p.image AS product_image,
                s.name AS status_name
         FROM auction a
         JOIN product p ON p.id = a.product_id
         JOIN auction_status s ON s.id = a.status_id
         WHERE a.winner_id = ?
         ORDER BY a.end_time DESC`,
        [userId]
      );

      const wonAuctions = await Promise.all(
        auctions.map(async (auction) => {
          const [winningBid] = await pool.execute(
            `SELECT h.*, u.username FROM auction_history h JOIN user u ON u.id = h.user_id WHERE h.auction_id = ? ORDER BY h.bid_amount DESC LIMIT 1`,
            [auction.id]
          );
          const [tx] = await pool.execute(
            `SELECT * FROM transaction_history WHERE auction_id = ? AND user_id = ? LIMIT 1`,
            [auction.id, userId]
          );
          return {
            ...mapAuctionRow(auction),
            winningBid: winningBid[0] ? mapBidRow(winningBid[0]) : null,
            transactionStatus: tx[0]?.status || null,
          };
        })
      );

      res.json({ wonAuctions });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Không tải được danh sách đấu giá đã thắng' });
    }
  },
};
