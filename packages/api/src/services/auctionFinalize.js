import { getPool } from '../config/database.js';

function formatVnd(amount) {
  return Number(amount).toLocaleString('vi-VN');
}

/**
 * Kết thúc phiên, gán người thắng, tạo thông báo (và giao dịch pending nếu có người thắng).
 * Function này là IDEMPOTENT - có thể gọi nhiều lần mà không tạo duplicate.
 */
export async function finalizeAuction(auctionId, { notify = true, forceNotify = false } = {}) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Lấy auction với lock để prevent race conditions
    const [arows] = await conn.execute(
      `SELECT a.*, p.title AS product_title
       FROM auction a
       JOIN product p ON p.id = a.product_id
       WHERE a.id = ? FOR UPDATE`,
      [auctionId]
    );
    const auction = arows[0];
    if (!auction) {
      await conn.rollback();
      return { ok: false, message: 'Không tìm thấy phiên đấu giá' };
    }

    // IDEMPOTENCY CHECK: Nếu đã ended (status_id = 2) thì skip hoàn toàn
    if (auction.status_id === 2) {
      await conn.commit();
      return {
        ok: true,
        auctionId,
        alreadyFinalized: true,
        message: 'Phiên đã được kết thúc trước đó',
      };
    }

    const [topBids] = await conn.execute(
      `SELECT id, user_id, bid_amount FROM auction_history
       WHERE auction_id = ?
       ORDER BY bid_amount DESC, bid_time ASC
       LIMIT 1`,
      [auctionId]
    );
    const topBid = topBids[0];

    // Update auction status và winner (nếu chưa được set)
    await conn.execute(
      `UPDATE auction SET status_id = 2, winner_id = COALESCE(winner_id, ?) WHERE id = ?`,
      [topBid ? topBid.user_id : null, auctionId]
    );

    let notificationCreated = false;
    let transactionCreated = false;

    if (notify && topBid) {
      // Gửi thông báo cho NGƯỜI THẮNG (với lock để prevent duplicate)
      const [existingWinner] = await conn.execute(
        `SELECT id FROM notification WHERE user_id = ? AND auction_id = ? AND title LIKE 'Chúc mừng%' LIMIT 1`,
        [topBid.user_id, auctionId]
      );

      if (existingWinner.length === 0 || forceNotify) {
        if (forceNotify && existingWinner.length > 0) {
          await conn.execute(`DELETE FROM notification WHERE id = ?`, [existingWinner[0].id]);
        }

        const title = 'Chúc mừng! Bạn đã thắng đấu giá';
        const message = `Bạn là người thắng phiên "${auction.product_title}" với giá ${formatVnd(topBid.bid_amount)} VNĐ. Vui lòng hoàn tất thanh toán trong mục giao dịch.`;

        await conn.execute(
          `INSERT INTO notification (user_id, title, message, auction_id) VALUES (?, ?, ?, ?)`,
          [topBid.user_id, title, message, auctionId]
        );
        notificationCreated = true;

        // Gửi real-time cho winner
        if (global.io) {
          global.io.to(`user-${topBid.user_id}`).emit('user-notification', {
            userId: topBid.user_id,
            auctionId,
            type: 'won',
          });
        }

        // Tạo payment record pending cho winner (với INSERT IGNORE để prevent duplicate)
        await conn.execute(
          `INSERT IGNORE INTO payment (user_id, auction_id, amount, status, payment_method)
           VALUES (?, ?, ?, 'pending', 'wallet')`,
          [topBid.user_id, auctionId, topBid.bid_amount]
        );
        transactionCreated = true;
      }

      // Gửi thông báo cho TẤT CẢ NGƯỜI THAM GIA (trừ winner)
      const [allBidders] = await conn.execute(
        `SELECT DISTINCT user_id FROM auction_history WHERE auction_id = ?`,
        [auctionId]
      );

      for (const bidder of allBidders) {
        if (Number(bidder.user_id) === Number(topBid.user_id)) continue;

        const [existingResult] = await conn.execute(
          `SELECT id FROM notification 
           WHERE user_id = ? AND auction_id = ? AND title LIKE 'Kết quả đấu giá%' LIMIT 1`,
          [bidder.user_id, auctionId]
        );

        if (existingResult.length === 0) {
          const resultTitle = 'Kết quả đấu giá';
          const resultMessage = `Phiên đấu giá "${auction.product_title}" đã kết thúc. Người thắng: ${formatVnd(topBid.bid_amount)} VNĐ. Cảm ơn bạn đã tham gia!`;

          await conn.execute(
            `INSERT INTO notification (user_id, title, message, auction_id) VALUES (?, ?, ?, ?)`,
            [bidder.user_id, resultTitle, resultMessage, auctionId]
          );

          if (global.io) {
            global.io.to(`user-${bidder.user_id}`).emit('user-notification', {
              userId: bidder.user_id,
              auctionId,
              type: 'auction_ended',
            });
          }
        }
      }
    }

    await conn.commit();

    return {
      ok: true,
      auctionId,
      winnerUserId: topBid?.user_id ?? null,
      winningAmount: topBid ? Number(topBid.bid_amount) : null,
      notificationCreated,
      transactionCreated,
      message: topBid
        ? notificationCreated
          ? 'Đã kết thúc phiên và gửi thông báo cho người thắng.'
          : 'Đã kết thúc phiên (thông báo đã gửi trước đó).'
        : 'Đã kết thúc phiên (không có lượt đặt giá).',
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/** Tự động kết thúc các phiên active đã hết giờ */
export async function finalizeExpiredAuctions() {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT id FROM auction WHERE status_id = 1 AND end_time <= NOW()`
  );

  const results = [];
  for (const row of rows) {
    try {
      const r = await finalizeAuction(row.id, { notify: true });
      results.push(r);
    } catch (e) {
      console.error('finalizeExpiredAuctions', row.id, e);
    }
  }
  return results;
}
