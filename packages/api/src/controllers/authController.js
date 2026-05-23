import bcrypt from 'bcryptjs';
import { getPool } from '../config/database.js';
import { signToken } from '../middleware/auth.js';
import { mapUserRow } from '../utils/rows.js';

const pool = getPool();

export const authController = {
  async register(req, res) {
    try {
      const { username, email, password, name, phone } = req.body || {};
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }
      const hash = await bcrypt.hash(password, 10);
      const [r] = await pool.execute(
        `INSERT INTO user (username, email, password_hash, name, phone, role_id, is_verified, balance)
         VALUES (?, ?, ?, ?, ?, 'user', 0, 0)`,
        [username.trim(), email.trim().toLowerCase(), hash, name?.trim() || null, phone?.trim() || null]
      );
      const userId = r.insertId;
      const token = signToken({ id: userId, email: email.trim().toLowerCase(), role: 'user' });
      const [rows] = await pool.execute(
        `SELECT u.*, r.name AS role_name
         FROM user u
         LEFT JOIN role r ON r.id = u.role_id
         WHERE u.id = ?`,
        [userId]
      );
      res.status(201).json({ token, user: mapUserRow(rows[0]) });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email hoặc username đã được sử dụng' });
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
        `SELECT u.*, r.name AS role_name
         FROM user u
         LEFT JOIN role r ON r.id = u.role_id
         WHERE u.email = ?`,
        [email.trim().toLowerCase()]
      );
      const row = rows[0];
      if (!row) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }
      if (row.is_blocked) {
        return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
      }
      const isPasswordValid = await bcrypt.compare(password, row.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      }
      const token = signToken({ id: row.id, email: row.email, role: row.role_id });
      res.json({ token, user: mapUserRow(row) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Đăng nhập thất bại' });
    }
  },

  async me(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT u.*, r.name AS role_name
         FROM user u
         LEFT JOIN role r ON r.id = u.role_id
         WHERE u.id = ?`,
        [req.user.id]
      );
      const row = rows[0];
      if (!row) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      res.json({ user: mapUserRow(row) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, phone, avatar, address, birthday, password } = req.body || {};
      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name?.trim() || null);
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone?.trim() || null);
      }
      if (avatar !== undefined) {
        updates.push('avatar = ?');
        values.push(avatar?.trim() || null);
      }
      if (address !== undefined) {
        updates.push('address = ?');
        values.push(address?.trim() || null);
      }
      if (birthday !== undefined) {
        updates.push('birthday = ?');
        values.push(birthday || null);
      }
      if (password !== undefined) {
        if (password.length < 6) {
          return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }
        const hash = await bcrypt.hash(password, 10);
        updates.push('password_hash = ?');
        values.push(hash);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'Không có thông tin nào được cập nhật' });
      }

      values.push(req.user.id);
      await pool.execute(`UPDATE user SET ${updates.join(', ')} WHERE id = ?`, values);

      const [rows] = await pool.execute(
        `SELECT u.*, r.name AS role_name
         FROM user u
         LEFT JOIN role r ON r.id = u.role_id
         WHERE u.id = ?`,
        [req.user.id]
      );
      res.json({ user: mapUserRow(rows[0]) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Cập nhật thất bại' });
    }
  },
};
