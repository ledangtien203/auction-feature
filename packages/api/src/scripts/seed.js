import { getPool } from '../config/database.js';
import bcrypt from 'bcryptjs';

const pool = getPool();

async function seed() {
  console.log('🔄 Bắt đầu seed database...');

  try {
    // Seed categories (nếu chưa có)
    const [existingCats] = await pool.execute('SELECT COUNT(*) as c FROM categories');
    if (existingCats[0].c === 0) {
      console.log('📦 Đang seed categories...');
      await pool.execute(`
        INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
        ('Đồng hồ', 'dong-ho', 'Đồng hồ cao cấp', 1, 1),
        ('Trang sức', 'trang-suc', 'Trang sức, đá quý', 1, 2),
        ('Nghệ thuật', 'nghe-thuat', 'Tranh, tượng, hiện vật', 1, 3),
        ('Xe cổ', 'xe-co', 'Xe cổ, xe sưu tầm', 1, 4),
        ('Máy ảnh', 'may-anh', 'Máy ảnh collectible', 1, 5),
        ('Nội thất', 'noi-that', 'Nội thất cổ, thiết kế', 1, 6),
        ('Thời trang', 'thoi-trang', 'Túi xách, giày hiệu', 1, 7),
        ('Sưu tầm', 'suu-tam', 'Đồ sưu tầm hiếm', 1, 8)
      `);
      console.log('✅ Categories đã được seed');
    } else {
      console.log('ℹ️  Categories đã tồn tại, bỏ qua');
    }

    // Seed users (nếu chưa có)
    const [existingUsers] = await pool.execute('SELECT COUNT(*) as c FROM users');
    if (existingUsers[0].c === 0) {
      console.log('📦 Đang seed users...');
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const userPassword = await bcrypt.hash('123456', 10);

      await pool.execute(`
        INSERT INTO users (name, email, password, phone, role, status) VALUES
        ('Quản trị viên', 'admin@auction.vn', ?, '0901000001', 'admin', 'active'),
        ('Nguyễn Văn A', 'user@auction.vn', ?, '0902000002', 'user', 'active'),
        ('Trần Thị B', 'tran.b@auction.vn', ?, '0903000003', 'user', 'active'),
        ('Lê Văn C', 'le.c@auction.vn', ?, '0904000004', 'user', 'active')
      `, [hashedPassword, userPassword, userPassword, userPassword]);
      console.log('✅ Users đã được seed');
    } else {
      console.log('ℹ️  Users đã tồn tại, bỏ qua');
    }

    // Seed sample auctions (nếu chưa có)
    const [existingAuctions] = await pool.execute('SELECT COUNT(*) as c FROM auctions');
    if (existingAuctions[0].c === 0) {
      console.log('📦 Đang seed auctions...');
      await pool.execute(`
        INSERT INTO auctions (
          title, description, image, category, category_id,
          starting_bid, min_increment, current_bid, total_bids,
          start_time, end_time, status, seller
        ) VALUES
        (
          'Rolex Submariner Date 126610LN',
          'Đồng hồ Rolex Submariner bản thép không gỉ, fullbox.',
          '/uploads/rolex-submariner.jpg', 'Đồng hồ', 1,
          180000000, 5000000, 215000000, 3,
          NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 'active', 'Cửa hàng Luxury Time'
        ),
        (
          'Tranh sơn dầu "Sông Hồng"',
          'Tranh sơn dầu khổ lớn, có chứng nhận xuất xứ.',
          '/uploads/tranh-song-hong.jpg', 'Nghệ thuật', 3,
          45000000, 2000000, 52000000, 2,
          NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 'active', 'Gallery Hà Nội'
        ),
        (
          'Mercedes-Benz 280SL Pagoda 1970',
          'Xe cổ nguyên bản, sổ service đầy đủ.',
          '/uploads/mercedes-pagoda.jpg', 'Xe cổ', 4,
          2500000000, 50000000, 2500000000, 0,
          DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'upcoming', 'Showroom Classic Auto'
        ),
        (
          'Leica M6 TTL 0.85 — Bản đen',
          'Máy ảnh Leica M6 kèm lens Summicron 35mm f/2.',
          '/uploads/leica-m6.jpg', 'Máy ảnh', 5,
          95000000, 3000000, 108000000, 2,
          DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 1 HOUR), 'ended', 'Studio Retro'
        ),
        (
          'Vòng tay kim cương 2.5 carat',
          'Kim cương natural, kiểm định GIA, vàng trắng 18K.',
          '/uploads/kim-cuong-vong.jpg', 'Trang sức', 2,
          320000000, 10000000, 385000000, 2,
          NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), 'active', 'Jewelry House'
        )
      `);
      console.log('✅ Auctions đã được seed');
    } else {
      console.log('ℹ️  Auctions đã tồn tại, bỏ qua');
    }

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed thất bại:', error);
    process.exit(1);
  }
}

seed();
