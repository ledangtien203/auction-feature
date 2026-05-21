import bcrypt from 'bcryptjs';
import { getPool } from '../config/database.js';
import { signToken } from '../middleware/auth.js';
import { mapUserRow } from '../utils/rows.js';

const pool = getPool();

export const authController = {
  async register(req, res) {
    try {
      const { name, email, password, phone } = req.body || {};
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }
      const hash = await bcrypt.hash(password, 10);
      const [r] = await pool.execute(
        `INSERT INTO users (name, email, password, phone, role, status)
         VALUES (?, ?, ?, ?, 'user', 'active')`,
        [name.trim(), email.trim().toLowerCase(), hash, phone?.trim() || null]
      );
      const userId = r.insertId;
      const token = signToken({ id: userId, email: email.trim().toLowerCase(), role: 'user' });
      const [rows] = await pool.execute(
        `SELECT id, name, email, role, status, join_date, phone, avatar FROM users WHERE id = ?`,
        [userId]
      );
      res.status(201).json({ token, user: mapUserRow(rows[0], { total_bids: 0, total_spent: 0 }) });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      console.error(e);
      res.status(500).json({ message: 'Đăng ký thất bại' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'Email và mật khẩu không được để trống' });
      }
      const [rows] = await pool.execute(
        `SELECT id, name, email, password, role, status, join_date, phone, avatar FROM users WHERE email = ?`,
        [email.trim().toLowerCase()]
      );
      const row = rows[0];
      const isPasswordHashed = typeof row?.password === 'string' && row.password.startsWith('$2');
      const isPasswordValid =
        row &&
        (isPasswordHashed ? await bcrypt.compare(password, row.password) : password === row.password);

      if (!row || !isPasswordValid) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }
      if (!isPasswordHashed) {
        console.warn(
          `Legacy plaintext password detected for user ${row.email}. Update database to store hashed passwords.`
        );
      }
      if (row.status !== 'active') {
        return res.status(403).json({ message: 'Tài khoản đã bị tạm khóa' });
      }
      const [agg] = await pool.execute(
        `SELECT COUNT(*) AS c, COALESCE(SUM(amount),0) AS s FROM bids WHERE user_id = ?`,
        [row.id]
      );
      const token = signToken({ id: row.id, email: row.email, role: row.role });
      const userResponse = mapUserRow(row, { total_bids: agg[0].c, total_spent: agg[0].s });
      console.log('Login response user:', userResponse);
      res.json({ token, user: userResponse });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Đăng nhập thất bại' });
    }
  },

  async me(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, email, role, status, join_date, phone, avatar FROM users WHERE id = ?`,
        [req.user.id]
      );
      const row = rows[0];
      if (!row) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      const [agg] = await pool.execute(
        `SELECT COUNT(*) AS c, COALESCE(SUM(amount),0) AS s FROM bids WHERE user_id = ?`,
        [row.id]
      );
      res.json({ user: mapUserRow(row, { total_bids: agg[0].c, total_spent: agg[0].s }) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, phone, avatar, password } = req.body || {};
      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name.trim());
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone?.trim() || null);
      }
      if (avatar !== undefined) {
        updates.push('avatar = ?');
        values.push(avatar?.trim() || null);
      }
      if (password !== undefined) {
        if (password.length < 6) {
          return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }
        const hash = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        values.push(hash);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'Không có thông tin nào được cập nhật' });
      }

      values.push(req.user.id);
      await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

      const [rows] = await pool.execute(
        `SELECT id, name, email, role, status, join_date, phone, avatar FROM users WHERE id = ?`,
        [req.user.id]
      );
      const row = rows[0];
      const [agg] = await pool.execute(
        `SELECT COUNT(*) AS c, COALESCE(SUM(amount),0) AS s FROM bids WHERE user_id = ?`,
        [row.id]
      );
      res.json({ user: mapUserRow(row, { total_bids: agg[0].c, total_spent: agg[0].s }) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Cập nhật thất bại' });
    }
  },
};
