import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

// Static context about the platform
const STATIC_CONTEXT = `Bạn là trợ lý AI của nền tảng đấu giá trực tuyến.
Luôn trả lời ngắn gọn, thân thiện, bằng tiếng Việt.
Nếu không biết câu trả lời, hãy nói rằng bạn không biết và gợi ý liên hệ hotline.`;

// Get dynamic data from database
async function getDynamicContext() {
  const pool = getPool();

  try {
    // Get active auctions
    const [activeAuctions] = await pool.execute(`
      SELECT p.name, a.current_price, a.start_price, s.name as status_name
      FROM auction a
      JOIN product p ON p.id = a.product_id
      JOIN auction_status s ON s.id = a.status_id
      WHERE a.status_id = 1
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    // Get categories
    const [categories] = await pool.execute(`
      SELECT c.name, COUNT(p.id) as product_count
      FROM product_category c
      LEFT JOIN product p ON p.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
      LIMIT 10
    `);

    // Get recent winners
    const [recentWinners] = await pool.execute(`
      SELECT u.username, p.name as product_name, a.current_price
      FROM auction a
      JOIN user u ON u.id = a.winner_id
      JOIN product p ON p.id = a.product_id
      WHERE a.winner_id IS NOT NULL
      ORDER BY a.updated_at DESC
      LIMIT 5
    `);

    // Get stats
    const [[auctionStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status_id = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status_id = 2 THEN 1 ELSE 0 END) as ended
      FROM auction
    `);

    const [[userStats]] = await pool.execute(`
      SELECT COUNT(*) as total_users FROM user WHERE role_id = 'user'
    `);

    let context = STATIC_CONTEXT + '\n\n';

    // Add stats
    context += `📊 THỐNG KÊ HỆ THỐNG:\n`;
    context += `- Tổng phiên đấu giá: ${auctionStats.total}\n`;
    context += `- Đang diễn ra: ${auctionStats.active}\n`;
    context += `- Đã kết thúc: ${auctionStats.ended}\n`;
    context += `- Tổng người dùng: ${userStats.total_users}\n\n`;

    // Add categories
    if (categories.length > 0) {
      context += `📂 DANH MỤC SẢN PHẨM:\n`;
      categories.forEach((cat) => {
        context += `- ${cat.name} (${cat.product_count} sản phẩm)\n`;
      });
      context += '\n';
    }

    // Add active auctions
    if (activeAuctions.length > 0) {
      context += `🔥 PHIÊN ĐẤU GIÁ ĐANG DIỄN RA:\n`;
      activeAuctions.forEach((auction, i) => {
        const price = auction.current_price > 0 ? auction.current_price : auction.start_price;
        context += `${i + 1}. ${auction.name} - Giá hiện tại: ${price.toLocaleString('vi-VN')} VNĐ\n`;
      });
      context += '\n';
    }

    // Add recent winners
    if (recentWinners.length > 0) {
      context += `🏆 NGƯỜI THẮNG GẦN ĐÂY:\n`;
      recentWinners.forEach((winner, i) => {
        context += `${i + 1}. ${winner.username} thắng "${winner.product_name}" với giá ${winner.current_price.toLocaleString('vi-VN')} VNĐ\n`;
      });
      context += '\n';
    }

    return context;
  } catch (error) {
    console.error('Error fetching dynamic context:', error);
    return (
      STATIC_CONTEXT +
      '\n\nHiện tại đang có lỗi kết nối database. Vui lòng liên hệ hotline 1900 1234 để được hỗ trợ.'
    );
  }
}

// Store chat history per session
const chatHistories = new Map();

async function callOllama(prompt, sessionId) {
  const context = await getDynamicContext();
  let history = chatHistories.get(sessionId) || [];

  const fullPrompt = `${context}\n\nLịch sử trò chuyện (để nhớ ngữ cảnh):\n${history.map((h) => `Người dùng: ${h.user}\nTrợ lý: ${h.bot}`).join('\n')}\n\nNgười dùng hỏi: ${prompt}\nTrợ lý trả lời (ngắn gọn, dựa trên thông tin ở trên):`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

// hiệu năng của ollama
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: fullPrompt,
        stream: false,
        keep_alive: -1,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 300,
          num_ctx: 2048,
          num_gpu: 999,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();

    history.push({ user: prompt, bot: data.response });
    if (history.length > 10) history.shift();
    chatHistories.set(sessionId, history);

    return data.response;
  } catch (error) {
    if (error.name === 'AbortError') {
      return 'Xin lỗi, câu trả lời bị timeout. Vui lòng thử lại.';
    }
    console.error('Ollama error:', error);
    throw error;
  }
}

router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const session = sessionId || 'default';
    const reply = await callOllama(message, session);

    res.json({
      reply,
      sessionId: session,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Không thể kết nối với AI. Vui lòng đảm bảo Ollama đang chạy.',
    });
  }
});

router.get('/health', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      res.json({ status: 'online', models: data.models });
    } else {
      res.json({ status: 'offline' });
    }
  } catch {
    res.json({ status: 'offline' });
  }
});

router.delete('/session/:sessionId', (req, res) => {
  chatHistories.delete(req.params.sessionId);
  res.json({ success: true });
});

export default router;
