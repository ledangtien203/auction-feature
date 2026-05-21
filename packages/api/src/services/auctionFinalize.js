import { getPool } from '../config/database.js';

function formatVnd(amount) {
  return Number(amount).toLocaleString('vi-VN');
}

/**
 * Kết thúc phiên, gán người thắng, tạo thông báo (và giao dịch pending nếu có người thắng).
 */
export async function finalizeAuction(auctionId, { notify = true, forceNotify = false } = {}) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [arows] = await conn.execute(`SELECT * FROM auctions WHERE id = ? FOR UPDATE`, [
      auctionId,
    ]);
    const auction = arows[0];
    if (!auction) {
      await conn.rollback();
      return { ok: false, message: 'Không tìm thấy phiên đấu giá' };
    }

    const [topBids] = await conn.execute(
      `SELECT id, user_id, amount FROM bids
       WHERE auction_id = ?
       ORDER BY amount DESC, created_at DESC
       LIMIT 1`,
      [auctionId]
    );
    const topBid = topBids[0];

    await conn.execute(
      `UPDATE auctions SET status = 'ended', winner_user_id = ?, winning_bid_id = ? WHERE id = ?`,
      [topBid ? topBid.user_id : null, topBid ? topBid.id : null, auctionId]
    );

    let notificationCreated = false;
    let transactionCreated = false;

    if (notify && topBid) {
      const [existing] = await conn.execute(
        `SELECT id FROM notifications
         WHERE user_id = ? AND auction_id = ? AND type = 'won'
         LIMIT 1`,
        [topBid.user_id, auctionId]
      );

      if (existing.length === 0 || forceNotify) {
        if (forceNotify && existing.length > 0) {
          await conn.execute(`DELETE FROM notifications WHERE id = ?`, [existing[0].id]);
        }

        const title = 'Chúc mừng! Bạn đã thắng đấu giá';
        const message = `Bạn là người thắng phiên "${auction.title}" với giá ${formatVnd(topBid.amount)} VNĐ. Vui lòng hoàn tất thanh toán trong mục giao dịch.`;

        await conn.execute(
          `INSERT INTO notifications (user_id, type, title, message, auction_id)
           VALUES (?, 'won', ?, ?, ?)`,
          [topBid.user_id, title, message, auctionId]
        );
        notificationCreated = true;

        const [txExists] = await conn.execute(
          `SELECT id FROM transactions WHERE auction_id = ? LIMIT 1`,
          [auctionId]
        );
        if (txExists.length === 0) {
          await conn.execute(
            `INSERT INTO transactions (auction_id, user_id, amount, status)
             VALUES (?, ?, ?, 'pending')`,
            [auctionId, topBid.user_id, topBid.amount]
          );
          transactionCreated = true;
        }
      }
    }

    await conn.commit();

    if (global.io && notificationCreated && topBid) {
      global.io.emit('user-notification', {
        userId: topBid.user_id,
        auctionId,
        type: 'won',
      });
    }

    return {
      ok: true,
      auctionId,
      winnerUserId: topBid?.user_id ?? null,
      winningAmount: topBid ? Number(topBid.amount) : null,
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
    `SELECT id FROM auctions WHERE status = 'active' AND end_time <= NOW()`
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
