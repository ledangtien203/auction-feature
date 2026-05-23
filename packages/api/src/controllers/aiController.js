import { getPool } from '../config/database.js';

const pool = getPool();

async function getAiReply(message) {
  const text = message.toLowerCase();

  if (text.includes('giá') || text.includes('bao nhiêu tiền')) {
    const [rows] = await pool.query(
      `SELECT p.title, a.current_price
       FROM auction a
       JOIN product p ON p.id = a.product_id
       WHERE a.status_id = 1`
    );
    const found = rows.find((item) =>
      item.title && text.includes(item.title.toLowerCase())
    );

    if (found) {
      return `Sản phẩm ${found.title} hiện đang được đấu giá ở mức ${Number(found.current_price).toLocaleString('vi-VN')} VNĐ.`;
    }

    return 'Không tìm thấy sản phẩm bạn hỏi.';
  }

  if (
    (text.includes('bao nhiêu') || text.includes('bao nhieu')) &&
    (text.includes('sản phẩm') || text.includes('san pham'))
  ) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM auction WHERE status_id = 1'
    );
    return `Hiện có ${rows[0].total} sản phẩm đang đấu giá trên hệ thống.`;
  }

  if (text.includes('sản phẩm gì') || text.includes('có gì')) {
    const [rows] = await pool.query(
      `SELECT p.title FROM auction a
       JOIN product p ON p.id = a.product_id
       WHERE a.status_id = 1
       LIMIT 5`
    );
    if (rows.length === 0) return 'Hiện chưa có sản phẩm nào đang đấu giá.';
    const names = rows.map((item) => item.title).join(', ');
    return `Một số sản phẩm đang đấu giá: ${names}.`;
  }

  return null;
}

export const aiController = {
  async chat(req, res, next) {
    try {
      const { message } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({ message: 'Tin nhắn không được để trống' });
      }

      const reply = await getAiReply(message.trim());
      res.json({ reply: reply || 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về sản phẩm đang đấu giá.' });
    } catch (error) {
      next(error);
    }
  },
};
