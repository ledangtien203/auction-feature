import { getPool } from '../config/database.js';

/**
 * Gửi thông báo cho tất cả người đã bid về phiên sắp kết thúc.
 * Chạy mỗi 5 phút.
 */
export async function notifyEndingAuctions() {
  const pool = getPool();

  try {
    // Lấy các phiên active kết thúc trong 1 giờ tới và chưa được thông báo
    const [auctions] = await pool.execute(`
      SELECT a.id, a.title, a.end_time
      FROM auctions a
      WHERE a.status = 'active'
        AND a.end_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.auction_id = a.id AND n.type = 'auction_ending'
        )
    `);

    if (!auctions.length) return [];

    const results = [];

    for (const auction of auctions) {
      // Lấy danh sách user đã bid (không trùng lặp)
      const [bidders] = await pool.execute(
        `SELECT DISTINCT user_id FROM bids WHERE auction_id = ?`,
        [auction.id]
      );

      for (const bidder of bidders) {
        const [existing] = await pool.execute(
          `SELECT id FROM notifications WHERE user_id = ? AND auction_id = ? AND type = 'auction_ending'`,
          [bidder.user_id, auction.id]
        );

        if (existing.length === 0) {
          await pool.execute(
            `INSERT INTO notifications (user_id, type, title, message, auction_id)
             VALUES (?, 'auction_ending', ?, ?, ?)`,
            [
              bidder.user_id,
              'Phiên đấu giá sắp kết thúc!',
              `Phiên "${auction.title}" sẽ kết thúc trong 1 giờ tới. Hãy nhanh tay đặt giá!`,
              auction.id,
            ]
          );

          // Emit real-time notification
          if (global.io) {
            global.io.to(`user-${bidder.user_id}`).emit('user-notification', {
              userId: bidder.user_id,
              auctionId: auction.id,
              type: 'auction_ending',
            });
          }

          results.push({ auctionId: auction.id, userId: bidder.user_id });
        }
      }
    }

    if (results.length > 0) {
      console.log(`📬 Đã gửi ${results.length} thông báo auction_ending`);
    }

    return results;
  } catch (e) {
    console.error('notifyEndingAuctions error:', e);
    return [];
  }
}
