-- =============================================================================
-- HỆ THỐNG ĐẤU GIÁ TRỰC TUYẾN — CSDL MySQL (ĐỒ ÁN) — 10 BẢNG
-- File     : database/schema.sql
-- Engine   : InnoDB, utf8mb4_unicode_ci
-- Quy ước  : Tiền tệ BIGINT (VND)
-- =============================================================================
-- Chạy: mysql -u root -p < database/schema.sql
--
-- Tài khoản mẫu:
--   Admin : admin@auction.vn  / Admin@123
--   User  : user@auction.vn  / 123456
-- =============================================================================

CREATE DATABASE IF NOT EXISTS auction_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE auction_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS v_auction_current_leader;
DROP VIEW IF EXISTS v_user_bid_stats;
DROP VIEW IF EXISTS v_hourly_bid_activity;
DROP VIEW IF EXISTS v_category_distribution;
DROP VIEW IF EXISTS v_monthly_revenue;

DROP TABLE IF EXISTS admin_activity_logs;
DROP TABLE IF EXISTS chatbot_knowledge;
DROP TABLE IF EXISTS auction_watchlist;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS auction_images;
DROP TABLE IF EXISTS auctions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. USERS — Tài khoản, role, trạng thái, last_login_at
-- =============================================================================
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password      VARCHAR(255) NOT NULL COMMENT 'Bcrypt hash',
  phone         VARCHAR(20) NULL,
  avatar        TEXT NULL,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  status        ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  join_date     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,

  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role_status (role, status)
) ENGINE=InnoDB
  COMMENT='Tài khoản người dùng và quản trị viên';

-- =============================================================================
-- 2. CATEGORIES — Danh mục (Admin Categories)
-- =============================================================================
CREATE TABLE categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(120) NOT NULL,
  description TEXT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=bật, 0=tắt',
  sort_order  INT UNSIGNED NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_categories_name (name),
  UNIQUE KEY uk_categories_slug (slug),
  KEY idx_categories_active_sort (is_active, sort_order)
) ENGINE=InnoDB
  COMMENT='Danh mục sản phẩm đấu giá';

-- =============================================================================
-- 3. AUCTIONS — Phiên đấu giá
-- =============================================================================
CREATE TABLE auctions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(500) NOT NULL,
  description     TEXT NOT NULL,
  image           TEXT NOT NULL COMMENT 'Ảnh đại diện',
  category        VARCHAR(120) NOT NULL COMMENT 'Tên danh mục (đồng bộ API)',
  category_id     INT UNSIGNED NULL,
  starting_bid    BIGINT UNSIGNED NOT NULL,
  min_increment   BIGINT UNSIGNED NOT NULL,
  current_bid     BIGINT UNSIGNED NOT NULL,
  total_bids      INT UNSIGNED NOT NULL DEFAULT 0,
  start_time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time        DATETIME NOT NULL,
  status          ENUM('active', 'upcoming', 'ended') NOT NULL DEFAULT 'upcoming',
  seller          VARCHAR(255) NOT NULL DEFAULT '—',
  winner_user_id  INT UNSIGNED NULL,
  winning_bid_id  BIGINT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_auctions_status (status),
  KEY idx_auctions_category_id (category_id),
  KEY idx_auctions_end_time (end_time),
  KEY idx_auctions_status_end (status, end_time),
  KEY idx_auctions_winner (winner_user_id),

  CONSTRAINT fk_auctions_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_auctions_winner
    FOREIGN KEY (winner_user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Phiên đấu giá';

-- =============================================================================
-- 4. AUCTION_IMAGES — Nhiều ảnh / phiên
-- =============================================================================
CREATE TABLE auction_images (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  auction_id  INT UNSIGNED NOT NULL,
  image_url   TEXT NOT NULL,
  sort_order  INT UNSIGNED NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_auction_images_auction (auction_id, sort_order),

  CONSTRAINT fk_auction_images_auction
    FOREIGN KEY (auction_id) REFERENCES auctions(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Thư viện ảnh bổ sung cho phiên đấu giá';

-- =============================================================================
-- 5. BIDS — Lịch sử đặt giá
-- =============================================================================
CREATE TABLE bids (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  auction_id  INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  amount      BIGINT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_bids_auction_time (auction_id, created_at DESC),
  KEY idx_bids_user (user_id, created_at DESC),
  KEY idx_bids_auction_amount (auction_id, amount DESC, created_at DESC),

  CONSTRAINT fk_bids_auction
    FOREIGN KEY (auction_id) REFERENCES auctions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bids_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Lịch sử đặt giá';

ALTER TABLE auctions
  ADD CONSTRAINT fk_auctions_winning_bid
    FOREIGN KEY (winning_bid_id) REFERENCES bids(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- 6. TRANSACTIONS — Thanh toán sau đấu giá
-- =============================================================================
CREATE TABLE transactions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  auction_id      INT UNSIGNED NOT NULL,
  user_id         INT UNSIGNED NOT NULL,
  amount          BIGINT UNSIGNED NOT NULL,
  status          ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  payment_method  ENUM('bank_transfer', 'momo', 'vnpay', 'cash', 'other') NULL,
  note            VARCHAR(500) NULL,
  completed_at    DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_transactions_auction (auction_id),
  KEY idx_transactions_user (user_id),
  KEY idx_transactions_status (status),
  KEY idx_transactions_created (created_at DESC),

  CONSTRAINT fk_transactions_auction
    FOREIGN KEY (auction_id) REFERENCES auctions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Giao dịch thanh toán sau đấu giá';

-- =============================================================================
-- 7. NOTIFICATIONS — Thông báo
-- =============================================================================
CREATE TABLE notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  type        ENUM('outbid', 'won', 'payment', 'auction_ending', 'system') NOT NULL DEFAULT 'system',
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  auction_id  INT UNSIGNED NULL,
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_notifications_user_read (user_id, is_read, created_at DESC),
  KEY idx_notifications_auction (auction_id),
  UNIQUE KEY uk_notifications_won_once (user_id, auction_id, type)
    COMMENT 'Mỗi phiên chỉ một thông báo won/user (auction_id NULL cho type khác)',

  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_auction
    FOREIGN KEY (auction_id) REFERENCES auctions(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Thông báo trong ứng dụng';

-- =============================================================================
-- 8. AUCTION_WATCHLIST — Theo dõi phiên yêu thích
-- =============================================================================
CREATE TABLE auction_watchlist (
  user_id     INT UNSIGNED NOT NULL,
  auction_id  INT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, auction_id),
  KEY idx_watchlist_auction (auction_id),

  CONSTRAINT fk_watchlist_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_watchlist_auction
    FOREIGN KEY (auction_id) REFERENCES auctions(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Phiên đấu giá người dùng theo dõi';

-- =============================================================================
-- 9. CHATBOT_KNOWLEDGE — Tri thức chatbot AI
-- =============================================================================
CREATE TABLE chatbot_knowledge (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  keyword     VARCHAR(255) NOT NULL COMMENT 'Khớp LIKE trong câu hỏi',
  answer      TEXT NOT NULL,
  category    VARCHAR(80) NULL DEFAULT 'general',
  priority    INT NOT NULL DEFAULT 0 COMMENT 'Cao hơn = ưu tiên',
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_chatbot_active_priority (is_active, priority DESC),
  KEY idx_chatbot_keyword (keyword)
) ENGINE=InnoDB
  COMMENT='Cơ sở tri thức chatbot (/api/ai/chat)';

-- =============================================================================
-- 10. ADMIN_ACTIVITY_LOGS — Nhật ký admin
-- =============================================================================
CREATE TABLE admin_activity_logs (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id    INT UNSIGNED NOT NULL,
  action      VARCHAR(80) NOT NULL COMMENT 'VD: create_auction, ban_user',
  entity_type VARCHAR(40) NULL COMMENT 'auction, user, transaction, category',
  entity_id   INT UNSIGNED NULL,
  detail      JSON NULL,
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_admin_logs_admin_time (admin_id, created_at DESC),
  KEY idx_admin_logs_entity (entity_type, entity_id),

  CONSTRAINT fk_admin_logs_admin
    FOREIGN KEY (admin_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Audit log thao tác quản trị';

-- =============================================================================
-- VIEW — Báo cáo admin
-- =============================================================================
CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT
  DATE_FORMAT(created_at, '%Y-%m') AS month_key,
  DATE_FORMAT(created_at, '%m/%Y') AS month_label,
  COALESCE(SUM(amount), 0) AS revenue,
  COUNT(DISTINCT auction_id) AS auction_count
FROM transactions
WHERE status = 'completed'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%m/%Y')
ORDER BY month_key ASC;

CREATE OR REPLACE VIEW v_category_distribution AS
SELECT
  c.name,
  COUNT(a.id) AS auction_count,
  ROUND(COUNT(a.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM auctions), 0), 1) AS percentage
FROM categories c
LEFT JOIN auctions a ON a.category_id = c.id
WHERE c.is_active = 1
GROUP BY c.id, c.name
ORDER BY auction_count DESC;

CREATE OR REPLACE VIEW v_hourly_bid_activity AS
SELECT
  DATE_FORMAT(created_at, '%H:00') AS hour_label,
  HOUR(created_at) AS hour_num,
  COUNT(*) AS bid_count
FROM bids
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY HOUR(created_at), DATE_FORMAT(created_at, '%H:00')
ORDER BY hour_num ASC;

CREATE OR REPLACE VIEW v_user_bid_stats AS
SELECT
  u.id AS user_id,
  u.name,
  u.email,
  u.role,
  u.status,
  COUNT(b.id) AS total_bids,
  COALESCE(SUM(b.amount), 0) AS total_spent,
  MAX(b.created_at) AS last_bid_at
FROM users u
LEFT JOIN bids b ON b.user_id = u.id
GROUP BY u.id, u.name, u.email, u.role, u.status;

CREATE OR REPLACE VIEW v_auction_current_leader AS
SELECT
  a.id AS auction_id,
  a.title,
  a.status,
  a.current_bid,
  a.end_time,
  b.user_id AS leader_user_id,
  u.name AS leader_name,
  b.amount AS leader_amount,
  b.created_at AS leader_bid_at
FROM auctions a
LEFT JOIN bids b ON b.id = (
  SELECT b2.id
  FROM bids b2
  WHERE b2.auction_id = a.id
  ORDER BY b2.amount DESC, b2.created_at DESC
  LIMIT 1
)
LEFT JOIN users u ON u.id = b.user_id;

-- =============================================================================
-- DỮ LIỆU MẪU
-- =============================================================================

INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
('Đồng hồ',     'dong-ho',     'Đồng hồ cao cấp',              1, 1),
('Trang sức',   'trang-suc',   'Trang sức, đá quý',            1, 2),
('Nghệ thuật', 'nghe-thuat',  'Tranh, tượng, hiện vật',       1, 3),
('Xe cổ',       'xe-co',       'Xe cổ, xe sưu tầm',            1, 4),
('Máy ảnh',     'may-anh',     'Máy ảnh collectible',          1, 5),
('Nội thất',    'noi-that',    'Nội thất cổ, thiết kế',        1, 6),
('Thời trang',  'thoi-trang',  'Túi xách, giày hiệu',          1, 7),
('Sưu tầm',     'suu-tam',     'Đồ sưu tầm hiếm',              1, 8);

INSERT INTO users (name, email, password, phone, role, status, last_login_at) VALUES
('Quản trị viên', 'admin@auction.vn', '$2a$10$YTrmBimP5vpyBRIitjMPDeZZaJa5mM0JYpCXTSje0a2FOy1JO495e', '0901000001', 'admin', 'active', NOW()),
('Nguyễn Văn A',  'user@auction.vn',  '$2a$10$rKd8rMHsH28g/B4lwLF81.ONyYSEB6nF/q8qV0mjdhu3gDTlFExk2', '0902000002', 'user',  'active', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Trần Thị B',    'tran.b@auction.vn','$2a$10$rKd8rMHsH28g/B4lwLF81.ONyYSEB6nF/q8qV0mjdhu3gDTlFExk2', '0903000003', 'user',  'active', NULL),
('Lê Văn C',      'le.c@auction.vn',  '$2a$10$rKd8rMHsH28g/B4lwLF81.ONyYSEB6nF/q8qV0mjdhu3gDTlFExk2', '0904000004', 'user',  'active', NULL);

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
  'Tranh sơn dầu “Sông Hồng”',
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
);

INSERT INTO auction_images (auction_id, image_url, sort_order) VALUES
(1, '/uploads/rolex-sub-1.jpg', 1),
(1, '/uploads/rolex-sub-2.jpg', 2),
(2, '/uploads/tranh-sh-1.jpg', 1),
(4, '/uploads/leica-m6-2.jpg', 1);

INSERT INTO bids (auction_id, user_id, amount, created_at) VALUES
(1, 2, 190000000, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 3, 200000000, DATE_SUB(NOW(), INTERVAL 36 HOUR)),
(1, 2, 215000000, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(2, 2, 47000000,  DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 4, 52000000,  DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(4, 3, 98000000,  DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 2, 108000000, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 2, 350000000, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 4, 385000000, DATE_SUB(NOW(), INTERVAL 2 HOUR));

UPDATE auctions SET winner_user_id = 2, winning_bid_id = 7 WHERE id = 4;

INSERT INTO transactions (auction_id, user_id, amount, status, payment_method, note, completed_at, created_at) VALUES
(4, 2, 108000000, 'completed', 'bank_transfer', 'Thanh toán đợt 1', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 4, 385000000, 'pending',   'momo',          'Đang xác nhận',    NULL, NOW());

INSERT INTO notifications (user_id, type, title, message, auction_id) VALUES
(2, 'outbid',         'Bạn bị vượt giá',      'Có người đặt giá cao hơn tại phiên Rolex Submariner.', 1),
(2, 'won',            'Chúc mừng bạn thắng',  'Bạn thắng phiên Leica M6 TTL.', 4),
(4, 'auction_ending', 'Sắp kết thúc',         'Phiên vòng tay kim cương kết thúc trong 24 giờ.', 5),
(2, 'payment',        'Thanh toán',           'Hoàn tất thanh toán phiên Leica M6.', 4);

INSERT INTO auction_watchlist (user_id, auction_id) VALUES
(2, 1), (2, 5), (3, 1), (4, 5);

INSERT INTO chatbot_knowledge (keyword, answer, category, priority, is_active) VALUES
('xin chào',  'Xin chào! Tôi là trợ lý đấu giá. Bạn cần hỗ trợ gì?', 'greeting', 10, 1),
('đặt giá',   'Đăng nhập → chi tiết phiên → nhập giá ≥ giá hiện tại + bước giá tối thiểu.', 'guide', 8, 1),
('thanh toán','Sau khi thắng, thanh toán theo hướng dẫn trong mục Giao dịch.', 'payment', 7, 1),
('đăng ký',   'Nhấn Đăng ký, điền họ tên, email, mật khẩu (≥6 ký tự).', 'account', 6, 1),
('giao hàng', 'Giao hàng 3–7 ngày làm việc sau khi thanh toán thành công.', 'shipping', 5, 1);

INSERT INTO admin_activity_logs (admin_id, action, entity_type, entity_id, detail) VALUES
(1, 'create_auction', 'auction', 1, '{"title":"Rolex Submariner Date 126610LN"}'),
(1, 'seed_database', 'system', NULL, '{"source":"schema.sql"}');

-- =============================================================================
SELECT 'auction_db: 10 bảng + 5 view — seed xong.' AS message;
