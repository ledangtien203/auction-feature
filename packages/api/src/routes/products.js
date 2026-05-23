import { Router } from 'express';
import { getPool } from '../config/database.js';

const router = Router();
const pool = getPool();

router.get('/', async (req, res) => {
  try {
    const { categoryId, search, status } = req.query;
    let sql = `
      SELECT p.*, c.name AS category_name, u.username AS seller_name
      FROM product p
      LEFT JOIN product_category c ON c.id = p.category_id
      JOIN user u ON u.id = p.seller_id
      WHERE 1=1
    `;
    const params = [];

    if (categoryId) {
      sql += ` AND p.category_id = ?`;
      params.push(Number(categoryId));
    }
    if (search) {
      sql += ` AND (p.name LIKE ? OR p.title LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY p.id DESC`;

    const [rows] = await pool.execute(sql, params);
    res.json(rows.map(mapProductRow));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS category_name, u.username AS seller_name
       FROM product p
       LEFT JOIN product_category c ON c.id = p.category_id
       JOIN user u ON u.id = p.seller_id
       WHERE p.id = ?`,
      [Number(req.params.id)]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(mapProductRow(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

function mapProductRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name,
    title: row.title || row.name,
    description: row.description || null,
    categoryId: row.category_id != null ? Number(row.category_id) : null,
    categoryName: row.category_name || null,
    image: row.image || null,
    startPrice: Number(row.start_price || 0),
    status: row.status,
    sellerId: Number(row.seller_id),
    sellerName: row.seller_name || null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export default router;
