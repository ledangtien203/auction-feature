import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const config = {
  port: Number(process.env.PORT || 4000),
  jwt_secret: process.env.JWT_SECRET || 'dev-insecure-auction-secret-change-me',
  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'auction_system',
  },
  ai_system_prompt:
    process.env.AI_SYSTEM_PROMPT ||
    'Bạn là trợ lý AI cho nền tảng đấu giá trực tuyến. Trả lời ngắn gọn, hữu ích, bằng tiếng Việt.',
};

export function validateConfig() {
  if (config.jwt_secret === 'dev-insecure-auction-secret-change-me') {
    console.warn('⚠️  JWT_SECRET sử dụng mặc định không an toàn. Hãy thiết lập biến môi trường.');
  }
}
