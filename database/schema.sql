CREATE DATABASE IF NOT EXISTS auction_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auction_system;

-- =====================================================
-- Table: role
-- =====================================================
CREATE TABLE IF NOT EXISTS role (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

-- =====================================================
-- Table: user
-- =====================================================
CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    avatar VARCHAR(500),
    address VARCHAR(500),
    birthday DATE,
    role_id VARCHAR(50) DEFAULT 'user',
    is_verified TINYINT DEFAULT 0,
    is_blocked TINYINT DEFAULT 0,
    balance INT DEFAULT 0,
    rating FLOAT DEFAULT 5.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role(id)
);

-- =====================================================
-- Table: product_category
-- =====================================================
CREATE TABLE IF NOT EXISTS product_category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Table: product
-- =====================================================
CREATE TABLE IF NOT EXISTS product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    category_id INT,
    image VARCHAR(500),
    start_price INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    seller_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_category(id) ON DELETE SET NULL,
    FOREIGN KEY (seller_id) REFERENCES user(id) ON DELETE CASCADE
);

-- =====================================================
-- Table: auction_status
-- =====================================================
CREATE TABLE IF NOT EXISTS auction_status (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- =====================================================
-- Table: auction_time
-- =====================================================
CREATE TABLE IF NOT EXISTS auction_time (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    minutes INT NOT NULL UNIQUE
);

-- =====================================================
-- Table: auction
-- =====================================================
CREATE TABLE IF NOT EXISTS auction (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    seller_id INT NOT NULL,
    winner_id INT,
    start_price INT NOT NULL,
    current_price INT NOT NULL,
    bid_increment INT DEFAULT 1000,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration_minutes INT DEFAULT 15,
    status_id INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT GENERATED ALWAYS AS (CASE WHEN status_id = 1 THEN 1 ELSE NULL END) STORED,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES user(id) ON DELETE SET NULL,
    FOREIGN KEY (status_id) REFERENCES auction_status(id),
    UNIQUE INDEX idx_product_active (product_id, is_active)
);

-- =====================================================
-- Table: auction_history
-- =====================================================
CREATE TABLE IF NOT EXISTS auction_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    user_id INT NOT NULL,
    bid_amount INT NOT NULL,
    bid_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_unique_bid (auction_id, user_id, bid_amount)
);

-- =====================================================
-- Table: transaction_history
-- =====================================================
CREATE TABLE IF NOT EXISTS transaction_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    auction_id INT,
    amount INT NOT NULL,
    type ENUM('deposit', 'withdraw', 'payment', 'refund') NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE SET NULL
);

-- =====================================================
-- Table: notification
-- =====================================================
CREATE TABLE IF NOT EXISTS notification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    auction_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE
);

-- =====================================================
-- Table: comment
-- =====================================================
CREATE TABLE IF NOT EXISTS comment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- =====================================================
-- Table: action_logs
-- =====================================================
CREATE TABLE IF NOT EXISTS action_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type VARCHAR(100),
    description TEXT,
    ip_address VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
);

-- =====================================================
-- Table: settings
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_name VARCHAR(255) DEFAULT 'Đấu Giá Trực Tuyến',
    site_email VARCHAR(255) DEFAULT 'contact@daugia.com',
    support_phone VARCHAR(50) DEFAULT '1900 1234',
    address VARCHAR(500) DEFAULT '',
    min_bid_increment INT DEFAULT 100000,
    auction_duration INT DEFAULT 72,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    auto_extend_auctions TINYINT DEFAULT 1,
    require_verification TINYINT DEFAULT 1,
    notify_email TINYINT DEFAULT 1,
    notify_overbid TINYINT DEFAULT 1,
    notify_ending_soon TINYINT DEFAULT 1,
    bank_name VARCHAR(255) DEFAULT '',
    account_number VARCHAR(100) DEFAULT '',
    account_name VARCHAR(255) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



-- 1. Tạo bảng wallet
CREATE TABLE IF NOT EXISTS wallet (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 2. Tạo bảng wallet_transaction
CREATE TABLE IF NOT EXISTS wallet_transaction (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wallet_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('deposit', 'withdraw', 'payment', 'refund', 'bid_refund') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    reference_id VARCHAR(255) NULL,
    description VARCHAR(500) NULL,
    payment_method VARCHAR(100) DEFAULT 'wallet',
    metadata JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallet(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);


-- 3. Tạo bảng payment
CREATE TABLE IF NOT EXISTS payment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    auction_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'wallet',
    transaction_id VARCHAR(255) NULL,
    paid_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE,
    UNIQUE INDEX payment_auction_id_unique (auction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_auction_id (auction_id),
    INDEX idx_status (status)
);

-- 4. Tạo bảng bank_account
CREATE TABLE IF NOT EXISTS bank_account (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(200) NOT NULL,
    qr_code_image VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Thêm dữ liệu ngân hàng mặc định
INSERT INTO bank_account (bank_name, bank_code, account_number, account_holder) VALUES
('Vietcombank', 'VCB', '1234567890', 'CONG TY TNHH DAU GIA TRUC TUYEN'),
('MB Bank', 'MB', '0987654321', 'CONG TY TNHH DAU GIA TRUC TUYEN'),
('Techcombank', 'TCB', '1122334455', 'CONG TY TNHH DAU GIA TRUC TUYEN');



-- Insert default settings
INSERT IGNORE INTO settings (id) VALUES (1);

-- =====================================================
-- Insert default data - ORDER MATTERS!
-- =====================================================

-- Default roles (MUST insert first - used by user table)

INSERT IGNORE INTO role (id, name, description) VALUES
('admin', 'Administrator', 'Quản trị viên'),
('user', 'Người dùng', 'Người dùng thông thường');

-- Default auction statuses
INSERT IGNORE INTO auction_status (id, name) VALUES
(1, 'Đang diễn ra'),
(2, 'Đã kết thúc'),
(3, 'Đã hủy');

-- Default auction times
INSERT IGNORE INTO auction_time (title, minutes) VALUES
('5 phút', 5),
('10 phút', 10),
('15 phút', 15),
('20 phút', 20),
('30 phút', 30),
('35 phút', 35),
('45 phút', 45),
('1 giờ', 60),
('90 phút', 90),
('2 giờ', 120);

-- Admin user (password: admin123)
INSERT IGNORE INTO user (username, email, password_hash, name, phone, address, birthday, role_id, is_verified, balance, rating) VALUES
('admin', 'admin@daugia.com', '$2a$10$AamhzmZ7J1t4zOruB6L.EuFexlbxLGR4c2grjstlD36DMhYX14MsC', 'Administrator', '0901234567', '123 Admin Street, HCM', '1990-01-01', 'admin', 1, 100000000, 5.0);

-- Sample users (password: 123456 for all)
INSERT IGNORE INTO user (username, email, password_hash, name, phone, address, birthday, role_id, is_verified, balance, rating) VALUES
('nguyenvana', 'nguyenvana@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Nguyễn Văn A', '0912345678', '456 Lê Lợi, Quận 1, HCM', '1995-05-15', 'user', 1, 50000000, 4.8),
('tran_thi_b', 'tranb@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Trần Thị B', '0923456789', '789 Nguyễn Huệ, Quận 1, HCM', '1998-03-20', 'user', 1, 30000000, 4.5),
('le_van_c', 'levanc@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Lê Văn C', '0934567890', '321 Đồng Khởi, Quận 1, HCM', '1992-11-10', 'user', 1, 80000000, 4.9),
('pham_thi_d', 'phamd@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Phạm Thị D', '0945678901', '654 Trần Hưng Đạo, Quận 5, HCM', '1996-07-25', 'user', 0, 15000000, 4.2),
('hoang_van_e', 'hoange@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Hoàng Văn E', '0956789012', '987 Võ Văn Tần, Quận 3, HCM', '1993-09-30', 'user', 1, 60000000, 4.6),
('vu_thi_f', 'vuthif@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Vũ Thị F', '0967890123', '147 Cái Khế, Quận Ninh Kiều, Cần Thơ', '1997-04-12', 'user', 1, 45000000, 4.7),
('dang_van_g', 'dangvg@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Đặng Văn G', '0978901234', '258 Lý Thường Kiệt, Quận 10, HCM', '1991-12-05', 'user', 1, 75000000, 4.8),
('bui_thi_h', 'buithih@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Bùi Thị H', '0989012345', '369 Trần Phú, Quận Hà Đông, Hà Nội', '1994-08-18', 'user', 0, 20000000, 4.0),
('do_van_i', 'dovani@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Đỗ Văn I', '0990123456', '741 Nguyễn Trãi, Quận 5, HCM', '1999-02-28', 'user', 1, 35000000, 4.4),
('truong_thi_j', 'truongtj@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Trương Thị J', '0901234560', '852 Điện Biên Phủ, Quận Bình Thạnh, HCM', '1993-06-14', 'user', 1, 55000000, 4.6),
('phan_van_k', 'phanvk@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Phan Văn K', '0912345679', '963 Lê Quang Định, Quận Gò Vấp, HCM', '1992-10-22', 'user', 1, 90000000, 4.9),
('trinh_thi_l', 'trinhtl@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Trịnh Thị L', '0923456780', '159 Võ Thị Sáu, Quận 3, HCM', '1996-01-30', 'user', 0, 12000000, 3.8),
('mai_van_m', 'maivanm@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Mai Văn M', '0934567891', '357 Pasteur, Quận 1, HCM', '1990-07-08', 'user', 1, 70000000, 4.7),
('ngoc_thi_n', 'ngoctn@mail.com', '$2a$10$ezJ9L3tUpgxf.UqGGInkP.cetT6qNvRce9t8Rl15rgvwebRSPqlDu', 'Ngọc Thị N', '0945678902', '753 Nguyễn Văn Linh, Quận 7, HCM', '1998-11-16', 'user', 1, 40000000, 4.5);

-- Product categories
INSERT IGNORE INTO product_category (name, description, image) VALUES
('Điện thoại & Tablet', 'Các sản phẩm điện thoại, smartphone, tablet', 'https://placehold.co/400x300?text=Dien-thoai'),
('Laptop & Máy tính', 'Laptop, PC, linh kiện máy tính', 'https://placehold.co/400x300?text=Laptop'),
('Đồng hồ', 'Đồng hồ thông minh, đồng hồ cơ', 'https://placehold.co/400x300?text=Dong-ho'),
('Giày dép', 'Giày thể thao, giày da, sandal', 'https://placehold.co/400x300?text=Giay-dep'),
('Túi xách', 'Túi xách nam, túi xách nữ, ba lô', 'https://placehold.co/400x300?text=Tui-xach'),
('Trang sức', 'Nhẫn, vòng, dây chuyền, hoa tai', 'https://placehold.co/400x300?text=Trang-suc'),
('Đồ gia dụng', 'Đồ dùng gia đình, nội thất nhỏ', 'https://placehold.co/400x300?text=Gia-dung'),
('Sách & Văn phòng phẩm', 'Sách, tạp chí, dụng cụ học tập', 'https://placehold.co/400x300?text=Sach'),
('Ô tô & Xe máy', 'Xe hơi, xe máy, phụ tùng', 'https://placehold.co/400x300?text=O-to'),
('Nghệ thuật & Sưu tầm', 'Tranh, tượng, tem, tiền xu', 'https://placehold.co/400x300?text=Nghe-thuat');

-- Products (24 products)
INSERT IGNORE INTO product (id, name, title, description, category_id, image, start_price, status, seller_id) VALUES
-- Điện thoại (3 sản phẩm)
(1, 'iPhone 15 Pro Max', 'iPhone 15 Pro Max 256GB - Chính hãng', 'iPhone 15 Pro Max màu Titan tự nhiên, dung lượng 256GB, chưa active, đầy đủ phụ kiện', 1, 'https://placehold.co/400x400?text=iPhone+15+Pro+Max', 25000000, 'active', 2),
(2, 'Samsung S24 Ultra', 'Samsung Galaxy S24 Ultra 512GB', 'Samsung S24 Ultra màu đen, màn hình Dynamic AMOLED 2X 6.8 inch', 1, 'https://placehold.co/400x400?text=Samsung+S24+Ultra', 20000000, 'active', 3),
(3, 'Xiaomi 14 Pro', 'Xiaomi 14 Pro 512GB', 'Xiaomi 14 Pro màu xanh lá, Snapdragon 8 Gen 3', 1, 'https://placehold.co/400x400?text=Xiaomi+14+Pro', 12000000, 'active', 4);

-- Điện thoại & Tablet
UPDATE product SET image = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80'
WHERE id = 1; -- iPhone 15 Pro Max
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80'
WHERE id = 2; -- Samsung Galaxy S24 Ultra
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'
WHERE id = 3; -- Xiaomi 14 Pro
 
-- Laptop & Máy tính
UPDATE product SET image = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80'
WHERE id = 4; -- MacBook Pro M3
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80'
WHERE id = 5; -- Dell XPS 15
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1611186871525-9a7ba11f8941?w=600&q=80'
WHERE id = 6; -- MacBook Air M2
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1593640408182-31c228b1d71f?w=600&q=80'
WHERE id = 7; -- ASUS ROG Zephyrus
 
-- Đồng hồ
UPDATE product SET image = 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80'
WHERE id = 8; -- Rolex Submariner
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80'
WHERE id = 9; -- Apple Watch Ultra 2
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80'
WHERE id = 10; -- Omega Seamaster
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=600&q=80'
WHERE id = 11; -- Samsung Galaxy Watch 6
 
-- Giày dép
UPDATE product SET image = 'https://images.unsplash.com/photo-1556906781-9a412961a5be?w=600&q=80'
WHERE id = 12; -- Nike Air Jordan 1
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1584735175315-9d5df23be4be?w=600&q=80'
WHERE id = 13; -- Adidas Yeezy 350
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
WHERE id = 14; -- Nike Dunk Low
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80'
WHERE id = 15; -- New Balance 550
 
-- Túi xách
UPDATE product SET image = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'
WHERE id = 16; -- Louis Vuitton Speedy
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80'
WHERE id = 17; -- Gucci Marmont
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1614179818511-e0e4e2fa8c77?w=600&q=80'
WHERE id = 18; -- Chanel Classic Flap
 
-- Trang sức
UPDATE product SET image = 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80'
WHERE id = 19; -- Vòng tay Cartier Love
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80'
WHERE id = 20; -- Nhẫn kim cương GIA
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80'
WHERE id = 21; -- Dây chuyền Van Cleef
 
-- Đồ gia dụng
UPDATE product SET image = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
WHERE id = 22; -- Robot hút bụi Dyson
 
UPDATE product SET image = 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80'
WHERE id = 23; -- Máy lọc không khí Xiaomi
 
-- Nghệ thuật & Sưu tầm
UPDATE product SET image = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80'
WHERE id = 24; -- Tranh sơn dầu
 
-- Xác nhận kết quả
SELECT id, name, SUBSTRING(image, 1, 60) AS image_preview FROM product ORDER BY id;

-- Auctions - ACTIVE (24 auctions)
INSERT IGNORE INTO auction (product_id, seller_id, winner_id, start_price, current_price, bid_increment, start_time, end_time, duration_minutes, status_id) VALUES
-- Đang diễn ra - Active auctions (1-24)
(1, 2, NULL, 25000000, 28000000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 60, 1),
(2, 3, NULL, 20000000, 22000000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE), 30, 1),
(3, 4, NULL, 12000000, 13500000, 300000, NOW(), DATE_ADD(NOW(), INTERVAL 45 MINUTE), 45, 1),
(4, 2, NULL, 45000000, 48000000, 1000000, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 120, 1),
(5, 4, NULL, 35000000, 37000000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 60, 1),
(6, 5, NULL, 28000000, 30000000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 90 MINUTE), 90, 1),
(7, 6, NULL, 42000000, 45000000, 1000000, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 120, 1),
(8, 3, NULL, 180000000, 195000000, 5000000, NOW(), DATE_ADD(NOW(), INTERVAL 60 MINUTE), 60, 1),
(9, 5, NULL, 15000000, 16500000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 45 MINUTE), 45, 1),
(10, 7, NULL, 95000000, 100000000, 2000000, NOW(), DATE_ADD(NOW(), INTERVAL 60 MINUTE), 60, 1),
(11, 4, NULL, 8000000, 9500000, 200000, NOW(), DATE_ADD(NOW(), INTERVAL 20 MINUTE), 20, 1),
(12, 5, NULL, 6000000, 7200000, 200000, NOW(), DATE_ADD(NOW(), INTERVAL 35 MINUTE), 35, 1),
(13, 9, NULL, 4500000, 5000000, 100000, NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE), 30, 1),
(14, 10, NULL, 5500000, 6000000, 100000, NOW(), DATE_ADD(NOW(), INTERVAL 45 MINUTE), 45, 1),
(15, 2, NULL, 45000000, 52000000, 1000000, NOW(), DATE_ADD(NOW(), INTERVAL 60 MINUTE), 60, 1),
(16, 3, NULL, 28000000, 31000000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 60 MINUTE), 60, 1),
(17, 11, NULL, 120000000, 130000000, 3000000, NOW(), DATE_ADD(NOW(), INTERVAL 120 MINUTE), 120, 1),
(18, 4, NULL, 85000000, 92000000, 2000000, NOW(), DATE_ADD(NOW(), INTERVAL 60 MINUTE), 60, 1),
(19, 5, NULL, 120000000, 135000000, 3000000, NOW(), DATE_ADD(NOW(), INTERVAL 60 MINUTE), 60, 1),
(20, 12, NULL, 75000000, 82000000, 2000000, NOW(), DATE_ADD(NOW(), INTERVAL 90 MINUTE), 90, 1),
(21, 6, NULL, 18000000, 19500000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 60 MINUTE), 60, 1),
(22, 13, NULL, 5500000, 6200000, 100000, NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE), 30, 1),
(23, 7, NULL, 35000000, 38000000, 1000000, NOW(), DATE_ADD(NOW(), INTERVAL 120 MINUTE), 120, 1),
(24, 8, NULL, 8500000, 9200000, 200000, NOW(), DATE_ADD(NOW(), INTERVAL 45 MINUTE), 45, 1);

-- Auction History (bid records for active auctions)
INSERT IGNORE INTO auction_history (auction_id, user_id, bid_amount, bid_time) VALUES
-- Auction 1: iPhone
(1, 3, 25500000, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(1, 4, 26000000, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(1, 5, 27000000, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, 6, 27500000, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(1, 7, 28000000, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
-- Auction 2: Samsung
(2, 2, 20500000, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(2, 4, 21000000, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(2, 5, 22000000, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
-- Auction 3: Xiaomi
(3, 2, 12500000, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(3, 5, 13000000, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(3, 8, 13500000, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
-- Auction 4: MacBook Pro
(4, 3, 46000000, DATE_SUB(NOW(), INTERVAL 100 MINUTE)),
(4, 4, 47000000, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(4, 5, 48000000, DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
(4, 6, 49000000, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(4, 7, 50000000, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(4, 8, 51000000, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
-- Auction 5: Dell XPS
(5, 2, 35500000, DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
(5, 5, 36000000, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(5, 7, 37000000, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
-- Auction 6: MacBook Air
(6, 3, 28500000, DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
(6, 4, 29000000, DATE_SUB(NOW(), INTERVAL 70 MINUTE)),
(6, 6, 30000000, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
-- Auction 7: ASUS ROG
(7, 3, 43000000, DATE_SUB(NOW(), INTERVAL 110 MINUTE)),
(7, 5, 44000000, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(7, 8, 45000000, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
-- Auction 8: Rolex
(8, 2, 185000000, DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
(8, 4, 190000000, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(8, 5, 195000000, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
-- Auction 9: Apple Watch
(9, 2, 15500000, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(9, 6, 16000000, DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
(9, 7, 16500000, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
-- Auction 10: Omega
(10, 3, 96000000, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(10, 5, 98000000, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(10, 8, 100000000, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
-- Auction 11: Jordan
(11, 2, 8500000, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(11, 3, 9000000, DATE_SUB(NOW(), INTERVAL 12 MINUTE)),
(11, 5, 9500000, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
-- Auction 12: Yeezy
(12, 3, 6500000, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(12, 4, 6800000, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(12, 6, 7200000, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
-- Auction 13: Nike Dunk
(13, 4, 4700000, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(13, 7, 5000000, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
-- Auction 14: NB 550
(14, 5, 5700000, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(14, 8, 6000000, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
-- Auction 15: LV Speedy
(15, 3, 47000000, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(15, 4, 49000000, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(15, 6, 51000000, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(15, 7, 52000000, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
-- Auction 16: Gucci
(16, 2, 29000000, DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
(16, 5, 30000000, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(16, 8, 31000000, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
-- Auction 17: Chanel
(17, 3, 125000000, DATE_SUB(NOW(), INTERVAL 100 MINUTE)),
(17, 5, 128000000, DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
(17, 7, 130000000, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
-- Auction 18: Cartier
(18, 2, 87000000, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(18, 6, 90000000, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(18, 8, 92000000, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
-- Auction 19: Diamond Ring
(19, 3, 125000000, DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
(19, 6, 130000000, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(19, 8, 135000000, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
-- Auction 20: Van Cleef
(20, 2, 78000000, DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
(20, 4, 80000000, DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
(20, 7, 82000000, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
-- Auction 21: Dyson
(21, 2, 18200000, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(21, 5, 18800000, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(21, 8, 19500000, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
-- Auction 22: Air Purifier
(22, 3, 5600000, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(22, 6, 6000000, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(22, 9, 6200000, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
-- Auction 23: Painting
(23, 2, 36000000, DATE_SUB(NOW(), INTERVAL 110 MINUTE)),
(23, 5, 37000000, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(23, 8, 38000000, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
-- Auction 24: Samsung Watch
(24, 3, 8600000, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(24, 6, 9000000, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(24, 9, 9200000, DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- Transaction History (deposits, withdrawals, payments, refunds)
INSERT IGNORE INTO transaction_history (user_id, auction_id, amount, type, status, created_at) VALUES
-- User 2 deposits
(2, NULL, 20000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(2, NULL, 30000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, NULL, 15000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, NULL, 25000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- User 2 payments
(2, 1, 28000000, 'payment', 'pending', NOW()),
-- User 2 withdrawals
(2, NULL, 5000000, 'withdraw', 'completed', DATE_SUB(NOW(), INTERVAL 7 DAY)),
-- User 3 deposits
(3, NULL, 50000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(3, NULL, 40000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, NULL, 30000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- User 3 payments
(3, 2, 22000000, 'payment', 'pending', NOW()),
-- User 4 deposits
(4, NULL, 35000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(4, NULL, 25000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 4 DAY)),
-- User 4 payments
(4, NULL, 6800000, 'payment', 'pending', NOW()),
-- User 4 withdrawals
(4, NULL, 8000000, 'withdraw', 'completed', DATE_SUB(NOW(), INTERVAL 8 DAY)),
-- User 5 deposits
(5, NULL, 45000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(5, NULL, 30000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, NULL, 20000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- User 5 payments
(5, NULL, 9500000, 'payment', 'pending', NOW()),
(5, NULL, 16500000, 'payment', 'pending', NOW()),
-- User 6 deposits
(6, NULL, 40000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(6, NULL, 35000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- User 7 deposits
(7, NULL, 60000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(7, NULL, 40000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- User 8 deposits
(8, NULL, 55000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(8, NULL, 30000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- User 9 deposits
(9, NULL, 30000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(9, NULL, 25000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- User 10 deposits
(10, NULL, 35000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 10 DAY)),
-- User 11 deposits
(11, NULL, 150000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 4 DAY)),
-- User 12 deposits
(12, NULL, 100000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 8 DAY)),
-- User 13 deposits
(13, NULL, 20000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(13, NULL, 15000000, 'deposit', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Notifications
INSERT IGNORE INTO notification (user_id, auction_id, title, message, is_read, created_at) VALUES
-- User 2 notifications
(2, 1, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá iPhone 15 Pro Max với giá 28,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(2, NULL, 'Cảnh báo bảo mật', 'Phát hiện đăng nhập từ thiết bị lạ từ IP 192.168.1.105', 0, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(2, 21, 'Đấu giá mới', 'Robot hút bụi Dyson vừa được đăng bán đấu giá với giá khởi điểm 18,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
-- User 3 notifications
(3, 8, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Rolex Submariner với giá 195,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(3, 2, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Samsung S24 Ultra với giá 22,000,000 VNĐ', 1, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(3, NULL, 'Thông báo thanh toán', 'Thanh toán đấu giá đang chờ xử lý', 0, NOW()),
-- User 4 notifications
(4, 4, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá MacBook Pro M3 với giá 48,000,000 VNĐ', 1, DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
(4, 5, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Dell XPS 15 với giá 37,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(4, NULL, 'Đánh giá tài khoản', 'Bạn đã nhận được đánh giá 5 sao từ người mua', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- User 5 notifications
(5, 11, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Nike Air Jordan 1 với giá 9,500,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(5, 9, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Apple Watch Ultra 2 với giá 16,500,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(5, NULL, 'Đấu giá sắp kết thúc', 'Phiên đấu giá sẽ kết thúc trong 15 phút', 0, NOW()),
-- User 6 notifications
(6, 4, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá MacBook Pro M3 với giá 49,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(6, NULL, 'Nạp tiền thành công', 'Tài khoản đã được cộng 35,000,000 VNĐ', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- User 7 notifications
(7, 6, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá MacBook Air M2 với giá 30,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(7, 13, 'Đấu giá mới', 'Nike Dunk Low Panda vừa được đăng bán đấu giá với giá khởi điểm 4,500,000 VNĐ', 1, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
-- User 8 notifications
(8, 3, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Xiaomi 14 Pro với giá 13,500,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(8, NULL, 'Tài khoản chưa xác minh', 'Vui lòng xác minh tài khoản để đăng bán sản phẩm', 0, DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- User 9 notifications
(9, 13, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Nike Dunk Low với giá 5,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(9, 24, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Samsung Galaxy Watch 6 với giá 9,200,000 VNĐ', 0, NOW()),
-- User 10 notifications
(10, 14, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá New Balance 550 với giá 6,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(10, NULL, 'Chào mừng', 'Chào mừng bạn đến với Đấu Giá Trực Tuyến!', 1, DATE_SUB(NOW(), INTERVAL 15 DAY)),
-- User 11 notifications
(11, 17, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Chanel Classic Flap với giá 130,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(11, NULL, 'Tài khoản VIP', 'Chúc mừng bạn đã trở thành khách hàng VIP', 1, DATE_SUB(NOW(), INTERVAL 10 DAY)),
-- User 12 notifications
(12, 20, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Dây chuyền Van Cleef với giá 82,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(12, NULL, 'Nạp tiền thành công', 'Tài khoản đã được cộng 100,000,000 VNĐ', 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),
-- User 13 notifications
(13, 22, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Máy lọc không khí Xiaomi với giá 6,200,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(13, NULL, 'Tài khoản chưa xác minh', 'Vui lòng xác minh tài khoản để tham gia đấu giá', 0, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Comments
INSERT IGNORE INTO comment (auction_id, user_id, content, created_at) VALUES
-- Auction 1: iPhone comments
(1, 3, 'Máy còn bảo hành không shop ơi?', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(1, 2, 'Còn đầy đủ phụ kiện không bạn? Có tai nghe và sạc không?', DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(1, 4, 'Mình thấy giá này hợp lý rồi đấy', DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
(1, 5, 'Có hỗ trợ trả góp không vậy?', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(1, 6, 'Ship Hà Nội được không ạ?', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
-- Auction 2: Samsung comments
(2, 4, 'Samsung này màn hình có bị lỗi gì không?', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(2, 2, 'Máy mới 100%, chưa active, đầy đủ phụ kiện bạn nhé', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(2, 5, 'Mình ở Đà Nẵng, có ship được không?', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
-- Auction 3: Xiaomi comments
(3, 2, 'Máy này có camera 108MP không bạn?', DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
(3, 5, 'Màu xanh lá này đẹp quá!', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
-- Auction 4: MacBook Pro comments
(4, 3, 'Máy còn bảo hành Apple được bao lâu?', DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(4, 4, 'Có kèm túi chống sốc không shop?', DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
(4, 5, 'Mình cần giao hàng nhanh, có hỗ trợ không?', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(4, 6, 'Máy có touchbar không vậy?', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
-- Auction 8: Rolex comments
(8, 2, 'Rolex chính hãng không bạn? Có hộp và giấy tờ đầy đủ không?', DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(8, 4, 'Mình ở Hà Nội, có thể mang đi check đồng hồ không?', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(8, 5, 'Đã mua ở đây 3 lần rồi, uy tín lắm!', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(8, 7, 'Có bảo hành quốc tế không ạ?', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
-- Auction 11: Jordan comments
(11, 2, 'Size nào vậy bạn? Mình mang 41 có vừa không?', DATE_SUB(NOW(), INTERVAL 12 MINUTE)),
(11, 3, 'Size 42 bạn nhé, mình đang đeo vừa', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(11, 5, 'Còn hộp và giấy tờ không bạn?', DATE_SUB(NOW(), INTERVAL 8 MINUTE)),
-- Auction 12: Yeezy comments
(12, 3, 'Giày này chạy có êm không bạn?', DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(12, 4, 'Yeezy 350 thoải mái lắm, mình đang có 2 đôi', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
-- Auction 15: LV comments
(15, 4, 'Túi này còn mới không? Có ví không?', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(15, 2, 'Túi mới 99%, đi vài lần thôi bạn. Có ví đầy đủ nhé', DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(15, 6, 'Mình ở Đà Nẵng, ship được không shop?', DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
(15, 7, 'Túi đẹp quá, giá này hời rồi!', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
-- Auction 17: Chanel comments
(17, 3, 'Chanel này mua ở cửa hàng nào vậy bạn?', DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
(17, 5, 'Hộp và dust bag đầy đủ không ạ?', DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
(17, 7, 'Có receipt mua hàng không bạn?', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
-- Auction 18: Cartier comments
(18, 2, 'Vòng này size nào vậy bạn? Mình mang size 16 có vừa không?', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(18, 6, 'Size 17 bạn nhé, vàng hồng 18K chính hãng Cartier', DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
-- Auction 19: Diamond Ring comments
(19, 3, 'Kim cương này có chứng nhận GIA không ạ?', DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(19, 6, 'Có đầy đủ GIA certificate bạn nhé, kèm box và receipt', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(19, 8, 'Giá này quá tốt rồi!', DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
-- Auction 23: Painting comments
(23, 2, 'Tranh này của họa sĩ nào vậy bạn?', DATE_SUB(NOW(), INTERVAL 100 MINUTE)),
(23, 5, 'Có giấy chứng nhận tác phẩm không ạ?', DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
(23, 8, 'Tranh đẹp quá! Có thể xem trực tiếp được không?', DATE_SUB(NOW(), INTERVAL 45 MINUTE));

-- Action Logs
INSERT IGNORE INTO action_logs (user_id, action_type, description, ip_address, created_at) VALUES
-- Admin actions
(1, 'login', 'Đăng nhập quản trị', '192.168.1.1', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 'manage_user', 'Cập nhật thông tin người dùng nguyenvana', '192.168.1.1', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'manage_auction', 'Duyệt phiên đấu giá mới', '192.168.1.1', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, 'view_report', 'Xem báo cáo doanh thu tháng', '192.168.1.1', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
-- User 12 actions
(12, 'login', 'Đăng nhập thành công', '192.168.1.110', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(12, 'deposit', 'Nạp tiền 100,000,000 VNĐ', '192.168.1.110', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(12, 'bid', 'Đặt giá 82,000,000 VNĐ cho Dây chuyền Van Cleef', '192.168.1.110', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
-- User 13 actions
(13, 'login', 'Đăng nhập thành công', '192.168.1.111', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(13, 'register', 'Đăng ký tài khoản mới', '192.168.1.111', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(13, 'bid', 'Đặt giá 6,200,000 VNĐ cho Máy lọc không khí Xiaomi', '192.168.1.111', DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
-- System actions
(NULL, 'system', 'Tự động cập nhật trạng thái đấu giá kết thúc', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(NULL, 'system', 'Gửi thông báo đấu giá sắp kết thúc', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(NULL, 'system', 'Cập nhật xếp hạng người dùng', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(NULL, 'system', 'Backup cơ sở dữ liệu', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 2 DAY));
