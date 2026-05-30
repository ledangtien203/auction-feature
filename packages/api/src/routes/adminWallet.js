import { Router } from 'express';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { getPool } from '../config/database.js';

const router = Router();
const pool = getPool();

// Get all wallets (admin only)
router.get('/', authRequired, adminRequired, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (u.username LIKE ? OR u.email LIKE ? OR u.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM wallet w 
       JOIN user u ON u.id = w.user_id 
       WHERE ${whereClause}`,
      params
    );

    // Get wallets
    const [wallets] = await pool.execute(
      `SELECT w.*, u.username, u.email, u.name, u.avatar,
              (SELECT COUNT(*) FROM wallet_transaction WHERE wallet_id = w.id) as total_transactions,
              (SELECT SUM(amount) FROM wallet_transaction WHERE wallet_id = w.id AND type = 'deposit' AND status = 'completed') as total_deposit,
              (SELECT SUM(amount) FROM wallet_transaction WHERE wallet_id = w.id AND type = 'withdraw' AND status = 'completed') as total_withdraw,
              (SELECT SUM(amount) FROM wallet_transaction WHERE wallet_id = w.id AND type = 'payment' AND status = 'completed') as total_payment
       FROM wallet w 
       JOIN user u ON u.id = w.user_id 
       WHERE ${whereClause}
       ORDER BY w.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({
      wallets: wallets.map(w => ({
        id: w.id,
        userId: w.user_id,
        username: w.username,
        email: w.email,
        name: w.name,
        avatar: w.avatar,
        balance: Number(w.balance),
        totalTransactions: Number(w.total_transactions) || 0,
        totalDeposit: Number(w.total_deposit) || 0,
        totalWithdraw: Number(w.total_withdraw) || 0,
        totalPayment: Number(w.total_payment) || 0,
        createdAt: w.created_at,
        updatedAt: w.updated_at,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult[0].total),
        totalPages: Math.ceil(Number(countResult[0].total) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all wallets error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách ví' });
  }
});

// Get wallet details (admin only)
router.get('/:userId', authRequired, adminRequired, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info
    const [users] = await pool.execute(
      'SELECT id, username, email, name, avatar FROM user WHERE id = ?',
      [userId]
    );

    if (!users[0]) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Get wallet
    let [wallets] = await pool.execute(
      'SELECT * FROM wallet WHERE user_id = ?',
      [userId]
    );

    let wallet = wallets[0];

    if (!wallet) {
      // Create wallet if not exists
      const [result] = await pool.execute(
        'INSERT INTO wallet (user_id, balance) VALUES (?, 0)',
        [userId]
      );
      wallet = {
        id: result.insertId,
        user_id: userId,
        balance: 0,
        created_at: new Date()
      };
    }

    // Get transactions
    const [transactions] = await pool.execute(
      `SELECT wt.*, 
              a.title as auction_title
       FROM wallet_transaction wt
       LEFT JOIN auction a ON a.id = wt.reference_id AND wt.type = 'payment'
       WHERE wt.user_id = ?
       ORDER BY wt.created_at DESC
       LIMIT 50`,
      [userId]
    );

    // Get payments
    const [payments] = await pool.execute(
      `SELECT p.*, a.title as auction_title
       FROM payment p
       JOIN auction a ON a.id = p.auction_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({
      user: users[0],
      wallet: {
        id: wallet.id,
        balance: Number(wallet.balance),
        createdAt: wallet.created_at,
      },
      transactions: transactions.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        status: t.status,
        description: t.description,
        auctionTitle: t.auction_title,
        createdAt: t.created_at,
      })),
      payments: payments.map(p => ({
        id: p.id,
        auctionId: p.auction_id,
        auctionTitle: p.auction_title,
        amount: Number(p.amount),
        status: p.status,
        paidAt: p.paid_at,
        createdAt: p.created_at,
      }))
    });
  } catch (error) {
    console.error('Get wallet details error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết ví' });
  }
});

// Add money to wallet (admin)
router.post('/:userId/deposit', authRequired, adminRequired, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;

    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ message: 'Số tiền không hợp lệ' });
    }

    // Get or create wallet
    let [wallets] = await pool.execute(
      'SELECT * FROM wallet WHERE user_id = ?',
      [userId]
    );

    let wallet = wallets[0];

    if (!wallet) {
      const [result] = await pool.execute(
        'INSERT INTO wallet (user_id, balance) VALUES (?, 0)',
        [userId]
      );
      wallet = { id: result.insertId };
    }

    // Update balance
    await pool.execute(
      'UPDATE wallet SET balance = balance + ? WHERE id = ?',
      [depositAmount, wallet.id]
    );

    // Record transaction
    const [txResult] = await pool.execute(
      `INSERT INTO wallet_transaction 
       (wallet_id, user_id, amount, type, status, payment_method, description) 
       VALUES (?, ?, ?, 'deposit', 'completed', 'admin_add', ?)`,
      [wallet.id, userId, depositAmount, description || 'Admin nạp tiền']
    );

    // Create notification
    await pool.execute(
      `INSERT INTO notification (user_id, type, title, message) 
       VALUES (?, 'deposit', 'Nạp tiền thành công', ?)`,
      [userId, `Admin đã nạp ${depositAmount.toLocaleString('vi-VN')}đ vào ví của bạn. ${description || ''}`]
    );

    // Get updated wallet
    const [updatedWallets] = await pool.execute(
      'SELECT * FROM wallet WHERE id = ?',
      [wallet.id]
    );

    res.json({
      success: true,
      message: 'Nạp tiền thành công',
      transactionId: txResult.insertId,
      newBalance: Number(updatedWallets[0].balance)
    });
  } catch (error) {
    console.error('Admin deposit error:', error);
    res.status(500).json({ message: 'Lỗi khi nạp tiền' });
  }
});

// Deduct money from wallet (admin)
router.post('/:userId/deduct', authRequired, adminRequired, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;

    const deductAmount = Number(amount);
    if (!deductAmount || deductAmount <= 0) {
      return res.status(400).json({ message: 'Số tiền không hợp lệ' });
    }

    // Get wallet
    const [wallets] = await pool.execute(
      'SELECT * FROM wallet WHERE user_id = ?',
      [userId]
    );

    if (!wallets[0]) {
      return res.status(400).json({ message: 'Người dùng chưa có ví' });
    }

    const wallet = wallets[0];

    // Check balance
    if (Number(wallet.balance) < deductAmount) {
      return res.status(400).json({ message: 'Số dư không đủ' });
    }

    // Update balance
    await pool.execute(
      'UPDATE wallet SET balance = balance - ? WHERE id = ?',
      [deductAmount, wallet.id]
    );

    // Record transaction
    const [txResult] = await pool.execute(
      `INSERT INTO wallet_transaction 
       (wallet_id, user_id, amount, type, status, payment_method, description) 
       VALUES (?, ?, ?, 'withdraw', 'completed', 'admin_deduct', ?)`,
      [wallet.id, userId, deductAmount, description || 'Admin trừ tiền']
    );

    // Create notification
    await pool.execute(
      `INSERT INTO notification (user_id, type, title, message) 
       VALUES (?, 'withdraw', 'Trừ tiền ví', ?)`,
      [userId, `Admin đã trừ ${deductAmount.toLocaleString('vi-VN')}đ từ ví của bạn. ${description || ''}`]
    );

    // Get updated wallet
    const [updatedWallets] = await pool.execute(
      'SELECT * FROM wallet WHERE id = ?',
      [wallet.id]
    );

    res.json({
      success: true,
      message: 'Trừ tiền thành công',
      transactionId: txResult.insertId,
      newBalance: Number(updatedWallets[0].balance)
    });
  } catch (error) {
    console.error('Admin deduct error:', error);
    res.status(500).json({ message: 'Lỗi khi trừ tiền' });
  }
});

// Get wallet statistics (admin dashboard)
router.get('/stats/overview', authRequired, adminRequired, async (req, res) => {
  try {
    // Total balance
    const [totalBalance] = await pool.execute(
      'SELECT SUM(balance) as total FROM wallet'
    );

    // Total transactions today
    const [todayTransactions] = await pool.execute(
      `SELECT COUNT(*) as count, SUM(amount) as total 
       FROM wallet_transaction 
       WHERE DATE(created_at) = CURDATE() AND status = 'completed'`
    );

    // Transaction stats by type
    const [typeStats] = await pool.execute(
      `SELECT type, COUNT(*) as count, SUM(amount) as total 
       FROM wallet_transaction 
       WHERE status = 'completed' 
       GROUP BY type`
    );

    // Top up wallets
    const [topWallets] = await pool.execute(
      `SELECT w.*, u.username, u.email, u.name 
       FROM wallet w 
       JOIN user u ON u.id = w.user_id 
       ORDER BY w.balance DESC 
       LIMIT 10`
    );

    // Recent transactions
    const [recentTx] = await pool.execute(
      `SELECT wt.*, u.username 
       FROM wallet_transaction wt 
       JOIN user u ON u.id = wt.user_id 
       ORDER BY wt.created_at DESC 
       LIMIT 10`
    );

    res.json({
      totalBalance: Number(totalBalance[0]?.total) || 0,
      todayTransactions: {
        count: Number(todayTransactions[0]?.count) || 0,
        amount: Number(todayTransactions[0]?.total) || 0
      },
      typeStats: typeStats.map(t => ({
        type: t.type,
        count: Number(t.count),
        total: Number(t.total)
      })),
      topWallets: topWallets.map(w => ({
        userId: w.user_id,
        username: w.username,
        email: w.email,
        name: w.name,
        balance: Number(w.balance)
      })),
      recentTransactions: recentTx.map(t => ({
        id: t.id,
        userId: t.user_id,
        username: t.username,
        amount: Number(t.amount),
        type: t.type,
        description: t.description,
        createdAt: t.created_at
      }))
    });
  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê' });
  }
});

export default router;
