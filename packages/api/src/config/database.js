import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try multiple env file locations
dotenv.config({ path: path.join(__dirname, '../../../packages/.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });

let pool;

export function getPool() {
  if (!pool) {
    const dbConfig = {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'auction_system',
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
      charset: 'utf8mb4',
    };
    console.log('🔌 Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
    });
    pool = mysql.createPool(dbConfig);
    
    // Test MySQL connection
    (async () => {
      try {
        const [rows] = await pool.query('SELECT DATABASE() AS db');
        console.log('✅ Connected to database:', rows[0].db);
      } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
        console.error('   Make sure MySQL is running and the database exists.');
        console.error('   Run: pnpm seed');
      }
    })();
  }

  return pool;
}