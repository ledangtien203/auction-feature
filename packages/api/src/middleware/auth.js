import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function signToken(payload) {
  return jwt.sign(payload, config.jwt_secret, { expiresIn: '7d' });
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yêu cầu đăng nhập' });
  }
  try {
    req.user = jwt.verify(header.slice(7), config.jwt_secret);
    next();
  } catch {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ' });
  }
}

export function adminRequired(req, res, next) {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'Admin') {
    return res.status(403).json({ message: 'Chỉ quản trị viên mới được truy cập' });
  }
  next();
}
