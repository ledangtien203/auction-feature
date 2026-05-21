import { getPool } from '../config/database.js';

const pool = getPool();

async function getAiReply(message) {
  const text = message.toLowerCase();

  if (text.includes('giá') || text.includes('bao nhiêu tiền')) {
    const [rows] = await pool.query('SELECT title, current_bid FROM auctions');
    const found = rows.find((item) => text.includes(item.title.toLowerCase()));

    if (found) {
      return `Sản phẩm ${found.title} hiện đang được đấu giá ở mức ${Number(found.current_bid).toLocaleString('vi-VN')} VNĐ.`;
    }

    return 'Không tìm thấy sản phẩm bạn hỏi.';
  }

  if (
    (text.includes('bao nhiêu') || text.includes('bao nhieu')) &&
    (text.includes('sản phẩm') || text.includes('san pham'))
  ) {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM auctions');
    return `Hiện có ${rows[0].total} sản phẩm trên hệ thống đấu giá.`;
  }

  if (text.includes('sản phẩm gì') || text.includes('có gì')) {
    const [rows] = await pool.query('SELECT title FROM auctions LIMIT 5');
    const names = rows.map((item) => item.title).join(', ');
    return `Một số sản phẩm đang đấu giá: ${names}.`;
  }

  const [knowledgeRows] = await pool.query(
    `SELECT answer FROM chatbot_knowledge
     WHERE is_active = 1 AND ? LIKE CONCAT('%', keyword, '%')
     ORDER BY priority DESC
     LIMIT 1`,
    [text]
  );

  if (knowledgeRows.length > 0) {
    return knowledgeRows[0].answer;
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
      res.json({ reply });
    } catch (error) {
      next(error);
    }
  },
};
