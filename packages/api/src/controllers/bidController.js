import { getPool } from '../config/database.js';
import { mapBidRow, mapAuctionRow } from '../utils/rows.js';
import { mapAuctionRow as mapAuctionRowUtil } from '../utils/rows.js';

const pool = getPool();

function formatVnd(amount) {
  return Number(amount).toLocaleString('vi-VN');
}

export const bidController = {
  async getMyBids(req, res) {
    try {
      const userId = req.user.id;
      const [bids] = await pool.execute(
        `SELECT b.id, b.auction_id, a.title AS auction_title, b.amount, b.created_at
         FROM bids b
         JOIN auctions a ON a.id = b.auction_id
         WHERE b.user_id = ?
         ORDER BY b.created_at DESC`,
        [userId]
      );

      const auctionIds = [...new Set(bids.map((b) => b.auction_id))];
      const winnerByAuction = new Map();
      for (const aid of auctionIds) {
        const [w] = await pool.execute(
          `SELECT user_id, amount FROM bids WHERE auction_id = ?
           ORDER BY amount DESC, created_at DESC LIMIT 1`,
          [aid]
        );
        if (w[0]) {
          winnerByAuction.set(Number(aid), {
            userId: Number(w[0].user_id),
            amount: Number(w[0].amount),
          });
        }
      }

      const out = bids.map((b) => {
        const aid = Number(b.auction_id);
        const win = winnerByAuction.get(aid);
        const isWinning = win && win.userId === userId && Number(b.amount) === win.amount;
        return mapBidRow({ ...b, is_winning: isWinning });
      });

      const [auctions] =
        auctionIds.length === 0
          ? [[]]
          : await pool.query(
              `SELECT * FROM auctions WHERE id IN (${auctionIds.map(() => '?').join(',')})`,
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

      const [urows] = await conn.execute(`SELECT status FROM users WHERE id = ?`, [req.user.id]);
      if (!urows[0] || urows[0].status !== 'active') {
        return res.status(403).json({ message: 'Tài khoản không thể đặt giá' });
      }

      await conn.beginTransaction();
      const [arows] = await conn.execute(`SELECT * FROM auctions WHERE id = ? FOR UPDATE`, [
        auctionId,
      ]);
      const a = arows[0];
      if (!a) {
        await conn.rollback();
        return res.status(404).json({ message: 'Không tìm thấy đấu giá' });
      }
      if (a.status !== 'active') {
        await conn.rollback();
        return res.status(400).json({ message: 'Phiên đấu giá không hoạt động' });
      }
      const end = new Date(a.end_time);
      if (end.getTime() <= Date.now()) {
        await conn.rollback();
        return res.status(400).json({ message: 'Phiên đấu giá đã kết thúc' });
      }
      const current = Number(a.current_bid);
      const minInc = Number(a.min_increment);
      const minNext = current > 0 ? current + minInc : Number(a.starting_bid);
      if (amount < minNext) {
        await conn.rollback();
        return res.status(400).json({ message: `Giá tối thiểu là ${minNext}` });
      }

      const [prevTopBid] = await conn.execute(
        `SELECT id, user_id, amount FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1`,
        [auctionId]
      );
      const prevTopBidder = prevTopBid[0] || null;

      await conn.execute(`INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)`, [
        auctionId,
        req.user.id,
        amount,
      ]);
      await conn.execute(
        `UPDATE auctions SET current_bid = ?, total_bids = total_bids + 1 WHERE id = ?`,
        [amount, auctionId]
      );

      let outbidNotification = null;
      if (prevTopBidder && Number(prevTopBidder.user_id) !== req.user.id) {
        const [existingOutbid] = await conn.execute(
          `SELECT id FROM notifications WHERE user_id = ? AND auction_id = ? AND type = 'outbid'
           AND DATE(created_at) = CURDATE() LIMIT 1`,
          [prevTopBidder.user_id, auctionId]
        );
        if (existingOutbid.length === 0) {
          const outbidTitle = 'Bạn đã bị vượt giá!';
          const outbidMessage = `Có người đặt giá cao hơn bạn ${formatVnd(amount)} VNĐ cho phiên "${a.title}". Hãy đặt giá cao hơn để giành chiến thắng!`;
          await conn.execute(
            `INSERT INTO notifications (user_id, type, title, message, auction_id)
             VALUES (?, 'outbid', ?, ?, ?)`,
            [prevTopBidder.user_id, outbidTitle, outbidMessage, auctionId]
          );
          outbidNotification = { userId: prevTopBidder.user_id, auctionId };
        }
      }

      await conn.commit();

      const [updated] = await pool.execute(`SELECT * FROM auctions WHERE id = ?`, [auctionId]);
      const updatedAuction = mapAuctionRow(updated[0]);

      if (global.io) {
        global.io.to(`auction-${auctionId}`).emit('bid-update', {
          auctionId,
          auction: updatedAuction,
          newBid: {
            id: null,
            auction_id: auctionId,
            user_id: req.user.id,
            amount: amount,
            created_at: new Date(),
            is_winning: true,
          },
        });

        global.io.emit('auction-activity', {
          type: 'new-bid',
          auctionId,
          bidAmount: amount,
          userId: req.user.id,
          timestamp: new Date(),
        });

        if (outbidNotification) {
          global.io.to(`user-${outbidNotification.userId}`).emit('user-notification', {
            userId: outbidNotification.userId,
            auctionId: outbidNotification.auctionId,
            type: 'outbid',
          });
        }
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
        `SELECT a.*, t.status AS transaction_status, t.payment_method
         FROM auctions a
         LEFT JOIN transactions t ON t.auction_id = a.id AND t.user_id = ?
         WHERE a.winner_user_id = ?
         ORDER BY a.end_time DESC`,
        [userId, userId]
      );

      const wonAuctions = await Promise.all(
        auctions.map(async (auction) => {
          const [winningBid] = await pool.execute(`SELECT * FROM bids WHERE id = ?`, [
            auction.winning_bid_id,
          ]);

          return {
            ...mapAuctionRow(auction),
            winningBid: winningBid[0] ? mapBidRow(winningBid[0]) : null,
            transactionStatus: auction.transaction_status,
            paymentMethod: auction.payment_method,
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
