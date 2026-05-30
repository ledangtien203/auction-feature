import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { getPool } from '../config/database.js';

const router = Router();
const pool = getPool();

// Get user's wallet
router.get('/', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create wallet
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

    // Get recent transactions
    const [transactions] = await pool.execute(
      `SELECT * FROM wallet_transaction 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );

    res.json({
      wallet: {
        id: wallet.id,
        balance: Number(wallet.balance),
        createdAt: wallet.created_at instanceof Date ? wallet.created_at.toISOString() : wallet.created_at,
      },
      transactions: transactions.map(t => ({
        id: String(t.id),
        amount: Number(t.amount),
        type: t.type,
        status: t.status,
        description: t.description || '',
        createdAt: t.created_at instanceof Date ? t.created_at.toISOString() : t.created_at,
      }))
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin ví' });
  }
});

// Deposit money (fake top-up)
router.post('/deposit', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod = 'bank_transfer' } = req.body;

    // Validate amount
    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ message: 'Số tiền nạp không hợp lệ' });
    }

    if (depositAmount > 100000000) { // Max 100 million
      return res.status(400).json({ message: 'Số tiền nạp tối đa là 100.000.000đ' });
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
      wallet = { id: result.insertId, balance: 0 };
    }

    // Create transaction record
    const [txResult] = await pool.execute(
      `INSERT INTO wallet_transaction 
       (wallet_id, user_id, amount, type, status, payment_method, description) 
       VALUES (?, ?, ?, 'deposit', 'completed', ?, ?)`,
      [wallet.id, userId, depositAmount, paymentMethod, `Nạp tiền qua ${paymentMethod}`]
    );

    // Update wallet balance
    await pool.execute(
      'UPDATE wallet SET balance = balance + ? WHERE id = ?',
      [depositAmount, wallet.id]
    );

    // Get updated wallet
    const [updatedWallets] = await pool.execute(
      'SELECT * FROM wallet WHERE id = ?',
      [wallet.id]
    );

    res.json({
      success: true,
      message: 'Nạp tiền thành công',
      transaction: {
        id: txResult.insertId,
        amount: depositAmount,
        type: 'deposit',
        status: 'completed',
        description: `Nạp tiền qua ${paymentMethod}`,
      },
      wallet: {
        id: updatedWallets[0].id,
        balance: Number(updatedWallets[0].balance),
      }
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Lỗi khi nạp tiền' });
  }
});

// Withdraw money (fake withdrawal)
router.post('/withdraw', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, bankAccount } = req.body;

    // Validate amount
    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      return res.status(400).json({ message: 'Số tiền rút không hợp lệ' });
    }

    if (withdrawAmount > 100000000) {
      return res.status(400).json({ message: 'Số tiền rút tối đa là 100.000.000đ' });
    }

    // Get wallet
    const [wallets] = await pool.execute(
      'SELECT * FROM wallet WHERE user_id = ?',
      [userId]
    );

    if (!wallets[0]) {
      return res.status(400).json({ message: 'Bạn chưa có ví' });
    }

    const wallet = wallets[0];

    // Check balance
    if (Number(wallet.balance) < withdrawAmount) {
      return res.status(400).json({ message: 'Số dư không đủ' });
    }

    // Validate bank account info
    if (!bankAccount?.accountNumber || !bankAccount?.bankName) {
      return res.status(400).json({ message: 'Thông tin tài khoản ngân hàng không hợp lệ' });
    }

    // Create transaction record (pending)
    const [txResult] = await pool.execute(
      `INSERT INTO wallet_transaction 
       (wallet_id, user_id, amount, type, status, payment_method, description, metadata) 
       VALUES (?, ?, ?, 'withdraw', 'pending', 'bank_transfer', ?, ?)`,
      [
        wallet.id,
        userId,
        withdrawAmount,
        `Rút tiền về tài khoản ${bankAccount.bankName} - ${bankAccount.accountNumber}`,
        JSON.stringify(bankAccount)
      ]
    );

    // Deduct from wallet immediately for fake system
    await pool.execute(
      'UPDATE wallet SET balance = balance - ? WHERE id = ?',
      [withdrawAmount, wallet.id]
    );

    // Update transaction to completed (fake - immediate)
    await pool.execute(
      'UPDATE wallet_transaction SET status = ? WHERE id = ?',
      ['completed', txResult.insertId]
    );

    // Get updated wallet
    const [updatedWallets] = await pool.execute(
      'SELECT * FROM wallet WHERE id = ?',
      [wallet.id]
    );

    res.json({
      success: true,
      message: 'Rút tiền thành công',
      transaction: {
        id: txResult.insertId,
        amount: withdrawAmount,
        type: 'withdraw',
        status: 'completed',
        description: `Rút tiền về tài khoản ${bankAccount.bankName}`,
      },
      wallet: {
        id: updatedWallets[0].id,
        balance: Number(updatedWallets[0].balance),
      }
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Lỗi khi rút tiền' });
  }
});

// Pay for auction
router.post('/pay', authRequired, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { auctionId } = req.body;

    if (!auctionId) {
      return res.status(400).json({ message: 'Thiếu thông tin đấu giá' });
    }

    // Get auction info
    const [auctions] = await connection.execute(
      `SELECT a.*, p.title as product_title 
       FROM auction a 
       JOIN product p ON p.id = a.product_id 
       WHERE a.id = ? AND a.winner_id = ?`,
      [auctionId, userId]
    );

    if (!auctions[0]) {
      connection.release();
      return res.status(404).json({ message: 'Không tìm thấy đấu giá hoặc bạn không phải người thắng' });
    }

    const auction = auctions[0];

    // Check if already paid by looking at payment table
    const [existingPayment] = await connection.execute(
      `SELECT * FROM payment WHERE auction_id = ? AND user_id = ? AND status = 'paid' LIMIT 1`,
      [auctionId, userId]
    );

    if (existingPayment[0]) {
      connection.release();
      return res.status(400).json({ message: 'Đơn hàng đã được thanh toán' });
    }

    // Also check wallet_transaction for completed payment
    const [existingWalletTx] = await connection.execute(
      `SELECT * FROM wallet_transaction WHERE reference_id = ? AND user_id = ? AND type = 'payment' AND status = 'completed' LIMIT 1`,
      [auctionId, userId]
    );

    if (existingWalletTx[0]) {
      connection.release();
      return res.status(400).json({ message: 'Đơn hàng đã được thanh toán' });
    }

    // Get wallet
    const [wallets] = await connection.execute(
      'SELECT * FROM wallet WHERE user_id = ?',
      [userId]
    );

    if (!wallets[0]) {
      connection.release();
      return res.status(400).json({ message: 'Bạn chưa có ví' });
    }

    const wallet = wallets[0];
    const paymentAmount = Number(auction.current_price);

    // Check balance
    if (Number(wallet.balance) < paymentAmount) {
      connection.release();
      return res.status(400).json({
        message: 'Số dư không đủ',
        required: paymentAmount,
        available: Number(wallet.balance)
      });
    }

    await connection.beginTransaction();

    // Deduct from wallet
    await connection.execute(
      'UPDATE wallet SET balance = balance - ? WHERE id = ?',
      [paymentAmount, wallet.id]
    );

    // Create wallet transaction
    const [txResult] = await connection.execute(
      `INSERT INTO wallet_transaction 
       (wallet_id, user_id, amount, type, status, reference_id, description) 
       VALUES (?, ?, ?, 'payment', 'completed', ?, ?)`,
      [wallet.id, userId, paymentAmount, auctionId, `Thanh toán đấu giá: ${auction.product_title}`]
    );

    // Create payment record
    await connection.execute(
      `INSERT INTO payment (user_id, auction_id, amount, status, payment_method, transaction_id, paid_at) 
       VALUES (?, ?, ?, 'paid', 'wallet', ?, NOW())`,
      [userId, auctionId, paymentAmount, `PAY-${txResult.insertId}`]
    );

    // Update auction status to paid (status_id = 4)
    await connection.execute(
      'UPDATE auction SET status_id = 4 WHERE id = ?',
      [auctionId]
    );

    // Create notification for user
    await connection.execute(
      `INSERT INTO notification (user_id, auction_id, title, message) 
       VALUES (?, ?, 'Thanh toán thành công', ?)`,
      [userId, auctionId, `Bạn đã thanh toán ${paymentAmount.toLocaleString('vi-VN')}đ cho đấu giá "${auction.product_title}"`]
    );

    await connection.commit();

    // Get updated wallet
    const [updatedWallets] = await pool.execute(
      'SELECT * FROM wallet WHERE id = ?',
      [wallet.id]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Thanh toán thành công',
      payment: {
        id: txResult.insertId,
        auctionId: auctionId,
        amount: paymentAmount,
        status: 'paid',
      },
      wallet: {
        id: updatedWallets[0].id,
        balance: Number(updatedWallets[0].balance),
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Lỗi khi thanh toán: ' + error.message });
  }
});

// Get payment history for auction
router.get('/payments/:auctionId', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { auctionId } = req.params;

    const [payments] = await pool.execute(
      `SELECT p.*, a.title as auction_title
       FROM payment p
       JOIN auction a ON a.id = p.auction_id
       WHERE p.user_id = ? AND p.auction_id = ?`,
      [userId, auctionId]
    );

    res.json(payments[0] || null);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin thanh toán' });
  }
});

// Get bank accounts for QR payment
router.get('/banks', async (req, res) => {
  try {
    const [banks] = await pool.execute(
      'SELECT * FROM bank_account WHERE is_active = TRUE'
    );

    res.json(banks);
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách ngân hàng' });
  }
});

// Transfer money (for admin refund, etc)
router.post('/transfer', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { toUserId, amount, description } = req.body;

    // Only admin can transfer
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền chuyển tiền' });
    }

    const transferAmount = Number(amount);
    if (!transferAmount || transferAmount <= 0) {
      return res.status(400).json({ message: 'Số tiền không hợp lệ' });
    }

    // Get sender wallet (admin)
    const [senderWallets] = await pool.execute(
      'SELECT * FROM wallet WHERE user_id = ?',
      [userId]
    );

    if (!senderWallets[0] || Number(senderWallets[0].balance) < transferAmount) {
      return res.status(400).json({ message: 'Số dư không đủ' });
    }

    // Get or create receiver wallet
    let [receiverWallets] = await pool.execute(
      'SELECT * FROM wallet WHERE user_id = ?',
      [toUserId]
    );

    if (!receiverWallets[0]) {
      await pool.execute(
        'INSERT INTO wallet (user_id, balance) VALUES (?, 0)',
        [toUserId]
      );
      [receiverWallets] = await pool.execute(
        'SELECT * FROM wallet WHERE user_id = ?',
        [toUserId]
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Deduct from sender
      await connection.execute(
        'UPDATE wallet SET balance = balance - ? WHERE id = ?',
        [transferAmount, senderWallets[0].id]
      );

      // Add to receiver
      await connection.execute(
        'UPDATE wallet SET balance = balance + ? WHERE id = ?',
        [transferAmount, receiverWallets[0].id]
      );

      // Record transactions
      await connection.execute(
        `INSERT INTO wallet_transaction 
         (wallet_id, user_id, amount, type, status, description) 
         VALUES (?, ?, ?, 'withdraw', 'completed', ?)`,
        [senderWallets[0].id, userId, transferAmount, description || 'Chuyển tiền']
      );

      const [txResult] = await connection.execute(
        `INSERT INTO wallet_transaction 
         (wallet_id, user_id, amount, type, status, description) 
         VALUES (?, ?, ?, 'deposit', 'completed', ?)`,
        [receiverWallets[0].id, toUserId, transferAmount, description || 'Nhận tiền']
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Chuyển tiền thành công',
        transactionId: txResult.insertId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Lỗi khi chuyển tiền' });
  }
});

export default router;
