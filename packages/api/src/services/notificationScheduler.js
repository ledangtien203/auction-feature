import { getPool } from '../config/database.js';

/**
 * Gửi thông báo cho tất cả người đã bid về phiên sắp kết thúc.
 * Chạy mỗi 5 phút.
 */
export async function notifyEndingAuctions() {
  const pool = getPool();

  try {
    // Lấy các phiên active kết thúc trong 1 giờ tới và chưa được thông báo
    // Kiểm tra xem bảng notification có cột auction_id không
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'notification'
        AND COLUMN_NAME = 'auction_id'
    `);

    const hasAuctionId = columns.length > 0;

    let auctions;
    if (hasAuctionId) {
      [auctions] = await pool.execute(`
        SELECT a.id, p.title AS auction_title, a.end_time
        FROM auction a
        JOIN product p ON p.id = a.product_id
        WHERE a.status_id = 1
          AND a.end_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
          AND NOT EXISTS (
            SELECT 1 FROM notification n
            WHERE n.auction_id = a.id
          )
      `);
    } else {
      // Fallback: lấy tất cả phiên sắp kết thúc
      [auctions] = await pool.execute(`
        SELECT a.id, p.title AS auction_title, a.end_time
        FROM auction a
        JOIN product p ON p.id = a.product_id
        WHERE a.status_id = 1
          AND a.end_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
      `);
    }

    if (!auctions.length) return [];

    const results = [];

    for (const auction of auctions) {
      // Lấy danh sách user đã bid (không trùng lặp)
      const [bidders] = await pool.execute(
        `SELECT DISTINCT user_id FROM auction_history WHERE auction_id = ?`,
        [auction.id]
      );

      for (const bidder of bidders) {
        // Kiểm tra đã thông báo chưa
        if (hasAuctionId) {
          const [existing] = await pool.execute(
            `SELECT id FROM notification WHERE user_id = ? AND auction_id = ? LIMIT 1`,
            [bidder.user_id, auction.id]
          );
          if (existing.length > 0) continue;
        }

        if (hasAuctionId) {
          await pool.execute(
            `INSERT INTO notification (user_id, auction_id, title, message) VALUES (?, ?, ?, ?)`,
            [
              bidder.user_id,
              auction.id,
              'Phiên đấu giá sắp kết thúc!',
              `Phiên "${auction.auction_title}" sẽ kết thúc trong 1 giờ tới. Hãy nhanh tay đặt giá!`,
            ]
          );
        } else {
          await pool.execute(
            `INSERT INTO notification (user_id, title, message) VALUES (?, ?, ?)`,
            [
              bidder.user_id,
              'Phiên đấu giá sắp kết thúc!',
              `Phiên "${auction.auction_title}" sẽ kết thúc trong 1 giờ tới. Hãy nhanh tay đặt giá!`,
            ]
          );
        }

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

    if (results.length > 0) {
      console.log(`Đã gửi ${results.length} thông báo auction_ending`);
    }

    return results;
  } catch (e) {
    console.error('notifyEndingAuctions error:', e);
    return [];
  }
}
