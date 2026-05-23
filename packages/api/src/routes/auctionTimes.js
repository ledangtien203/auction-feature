import { Router } from 'express';
import { getPool } from '../config/database.js';

const router = Router();
const pool = getPool();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM auction_time ORDER BY minutes ASC`);
    res.json(rows.map((row) => ({
      id: Number(row.id),
      title: row.title,
      minutes: Number(row.minutes),
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

export default router;
