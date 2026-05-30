-- =====================================================
-- Restore Database - Full Seed Data
-- =====================================================

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
('admin', 'admin@daugia.com', '$2b$10$rQZ8J5KQJ5JxgkOZrYQx8ePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Administrator', '0901234567', '123 Admin Street, HCM', '1990-01-01', 'admin', 1, 100000000, 5.0);

-- Sample users (password: 123456 for all)
INSERT IGNORE INTO user (username, email, password_hash, name, phone, address, birthday, role_id, is_verified, balance, rating) VALUES
('nguyenvana', 'nguyenvana@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Nguyễn Văn A', '0912345678', '456 Lê Lợi, Quận 1, HCM', '1995-05-15', 'user', 1, 50000000, 4.8),
('tran_thi_b', 'tranb@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Trần Thị B', '0923456789', '789 Nguyễn Huệ, Quận 1, HCM', '1998-03-20', 'user', 1, 30000000, 4.5),
('le_van_c', 'levanc@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Lê Văn C', '0934567890', '321 Đồng Khởi, Quận 1, HCM', '1992-11-10', 'user', 1, 80000000, 4.9),
('pham_thi_d', 'phamd@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Phạm Thị D', '0945678901', '654 Trần Hưng Đạo, Quận 5, HCM', '1996-07-25', 'user', 0, 15000000, 4.2),
('hoang_van_e', 'hoange@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Hoàng Văn E', '0956789012', '987 Võ Văn Tần, Quận 3, HCM', '1993-09-30', 'user', 1, 60000000, 4.6),
('vu_thi_f', 'vuthif@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Vũ Thị F', '0967890123', '147 Cái Khế, Quận Ninh Kiều, Cần Thơ', '1997-04-12', 'user', 1, 45000000, 4.7),
('dang_van_g', 'dangvg@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Đặng Văn G', '0978901234', '258 Lý Thường Kiệt, Quận 10, HCM', '1991-12-05', 'user', 1, 75000000, 4.8),
('bui_thi_h', 'buithih@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Bùi Thị H', '0989012345', '369 Trần Phú, Quận Hà Đông, Hà Nội', '1994-08-18', 'user', 0, 20000000, 4.0),
('do_van_i', 'dovani@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Đỗ Văn I', '0990123456', '741 Nguyễn Trãi, Quận 5, HCM', '1999-02-28', 'user', 1, 35000000, 4.4),
('truong_thi_j', 'truongtj@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Trương Thị J', '0901234560', '852 Điện Biên Phủ, Quận Bình Thạnh, HCM', '1993-06-14', 'user', 1, 55000000, 4.6),
('phan_van_k', 'phanvk@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Phan Văn K', '0912345679', '963 Lê Quang Định, Quận Gò Vấp, HCM', '1992-10-22', 'user', 1, 90000000, 4.9),
('trinh_thi_l', 'trinhtl@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Trịnh Thị L', '0923456780', '159 Võ Thị Sáu, Quận 3, HCM', '1996-01-30', 'user', 0, 12000000, 3.8),
('mai_van_m', 'maivanm@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Mai Văn M', '0934567891', '357 Pasteur, Quận 1, HCM', '1990-07-08', 'user', 1, 70000000, 4.7),
('ngoc_thi_n', 'ngoctn@mail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Vyj.GvfKjKjKjKjKjKjK', 'Ngọc Thị N', '0945678902', '753 Nguyễn Văn Linh, Quận 7, HCM', '1998-11-16', 'user', 1, 40000000, 4.5);

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
INSERT INTO product (id, name, title, description, category_id, image, start_price, status, seller_id) VALUES
-- Điện thoại (3 sản phẩm)
(1, 'iPhone 15 Pro Max', 'iPhone 15 Pro Max 256GB - Chính hãng', 'iPhone 15 Pro Max màu Titan tự nhiên, dung lượng 256GB, chưa active, đầy đủ phụ kiện', 1, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80', 25000000, 'active', 2),
(2, 'Samsung S24 Ultra', 'Samsung Galaxy S24 Ultra 512GB', 'Samsung S24 Ultra màu đen, màn hình Dynamic AMOLED 2X 6.8 inch', 1, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80', 20000000, 'active', 3),
(3, 'Xiaomi 14 Pro', 'Xiaomi 14 Pro 512GB', 'Xiaomi 14 Pro màu xanh lá, Snapdragon 8 Gen 3', 1, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80', 12000000, 'active', 4),
-- Laptop & Máy tính (4 sản phẩm)
(4, 'MacBook Pro M3', 'MacBook Pro M3 14 inch 512GB', 'MacBook Pro M3 chip 8-core CPU, 10-core GPU, 16GB RAM', 2, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', 45000000, 'active', 2),
(5, 'Dell XPS 15', 'Dell XPS 15 9530 1TB SSD', 'Dell XPS 15 Intel Core i9, 32GB RAM, 1TB SSD', 2, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', 35000000, 'active', 4),
(6, 'MacBook Air M2', 'MacBook Air M2 15 inch 256GB', 'MacBook Air M2 chip 8-core CPU, 10-core GPU, 8GB RAM', 2, 'https://images.unsplash.com/photo-1611186871525-9a7ba11f8941?w=600&q=80', 28000000, 'active', 5),
(7, 'ASUS ROG Zephyrus', 'ASUS ROG Zephyrus G14 1TB', 'ASUS ROG Zephyrus G14 AMD Ryzen 9, RTX 4070', 2, 'https://images.unsplash.com/photo-1593640408182-31c228b1d71f?w=600&q=80', 42000000, 'active', 6),
-- Đồng hồ (4 sản phẩm)
(8, 'Rolex Submariner', 'Rolex Submariner Date 41mm', 'Rolex Submariner Date mặt đen, thép không gỉ', 3, 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80', 180000000, 'active', 3),
(9, 'Apple Watch Ultra 2', 'Apple Watch Ultra 2 49mm', 'Apple Watch Ultra 2 titanium case, Alpine Loop', 3, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80', 15000000, 'active', 5),
(10, 'Omega Seamaster', 'Omega Seamaster Diver 300M', 'Omega Seamaster Diver 300M mặt xanh ceramic', 3, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80', 95000000, 'active', 7),
(11, 'Samsung Galaxy Watch 6', 'Samsung Galaxy Watch 6 44mm', 'Samsung Galaxy Watch 6 Classic mặt tròn', 3, 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=600&q=80', 8000000, 'active', 4),
-- Giày dép (4 sản phẩm)
(12, 'Nike Air Jordan 1', 'Nike Air Jordan 1 High OG', 'Nike Air Jordan 1 High OG Chicago colorway', 4, 'https://images.unsplash.com/photo-1556906781-9a412961a5be?w=600&q=80', 6000000, 'active', 5),
(13, 'Adidas Yeezy 350', 'Adidas Yeezy Boost 350 V2', 'Adidas Yeezy 350 V2 Beluga Reflective', 4, 'https://images.unsplash.com/photo-1584735175315-9d5df23be4be?w=600&q=80', 4500000, 'active', 9),
(14, 'Nike Dunk Low', 'Nike Dunk Low Panda', 'Nike Dunk Low Panda Black White', 4, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', 5500000, 'active', 10),
(15, 'New Balance 550', 'New Balance 550 White Green', 'New Balance 550 AM550WGN White Green', 4, 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80', 45000000, 'active', 2),
-- Túi xách (3 sản phẩm)
(16, 'Louis Vuitton Speedy', 'Louis Vuitton Speedy 30', 'Louis Vuitton Speedy 30 Damier Ebene', 5, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', 28000000, 'active', 3),
(17, 'Gucci Marmont', 'Gucci GG Marmont Small', 'Gucci GG Marmont Small Shoulder Bag', 5, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', 120000000, 'active', 11),
(18, 'Chanel Classic Flap', 'Chanel Classic Flap Medium', 'Chanel Classic Flap Medium Black Caviar', 5, 'https://images.unsplash.com/photo-1614179818511-e0e4e2fa8c77?w=600&q=80', 85000000, 'active', 4),
-- Trang sức (3 sản phẩm)
(19, 'Cartier Love', 'Cartier Love Bracelet Yellow Gold', 'Cartier Love Bracelet 18K Yellow Gold Size 17', 6, 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80', 120000000, 'active', 5),
(20, 'Kim cương GIA', 'Nhẫn kim cương GIA 1 carat', 'Nhẫn kim cương 1 carat GIA F VS1 platinum', 6, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', 75000000, 'active', 12),
(21, 'Van Cleef Necklace', 'Van Cleef & Arpels Vintage Alhambra', 'Van Cleef Vintage Alhambra necklace 18K yellow gold', 6, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80', 18000000, 'active', 6),
-- Đồ gia dụng (2 sản phẩm)
(22, 'Robot hút bụi Dyson', 'Dyson 360 Heurist', 'Dyson 360 Heurist robot vacuum cleaner', 7, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 5500000, 'active', 13),
(23, 'Máy lọc không khí Xiaomi', 'Xiaomi Air Purifier 4 Pro', 'Xiaomi Air Purifier 4 Pro HEPA filter', 7, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80', 35000000, 'active', 7),
-- Nghệ thuật & Sưu tầm (1 sản phẩm)
(24, 'Tranh sơn dầu', 'Tranh sơn dầu phong cảnh', 'Tranh sơn dầu phong cảnh Việt Nam 80x120cm', 10, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80', 8500000, 'active', 8)
ON DUPLICATE KEY UPDATE name=VALUES(name), title=VALUES(title), description=VALUES(description), category_id=VALUES(category_id), image=VALUES(image), start_price=VALUES(start_price), status=VALUES(status), seller_id=VALUES(seller_id);

-- Auctions - ACTIVE (24 auctions)
INSERT INTO auction (product_id, seller_id, winner_id, start_price, current_price, bid_increment, start_time, end_time, duration_minutes, status_id) VALUES
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
(24, 8, NULL, 8500000, 9200000, 200000, NOW(), DATE_ADD(NOW(), INTERVAL 45 MINUTE), 45, 1)
ON DUPLICATE KEY UPDATE start_price=VALUES(start_price), current_price=VALUES(current_price), bid_increment=VALUES(bid_increment), start_time=VALUES(start_time), end_time=VALUES(end_time), duration_minutes=VALUES(duration_minutes), status_id=VALUES(status_id);

-- Auction History (bid records for active auctions)
INSERT INTO auction_history (auction_id, user_id, bid_amount, bid_time) VALUES
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

-- Notifications
INSERT INTO notification (user_id, auction_id, title, message, is_read, created_at) VALUES
(2, 1, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá iPhone 15 Pro Max với giá 28,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(2, NULL, 'Cảnh báo bảo mật', 'Phát hiện đăng nhập từ thiết bị lạ từ IP 192.168.1.105', 0, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(3, 8, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Rolex Submariner với giá 195,000,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(4, 4, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá MacBook Pro M3 với giá 48,000,000 VNĐ', 1, DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
(5, 11, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Nike Air Jordan 1 với giá 9,500,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(8, 3, 'Bạn đang có giá cao nhất', 'Bạn đang dẫn đầu phiên đấu giá Xiaomi 14 Pro với giá 13,500,000 VNĐ', 0, DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- Comments
INSERT INTO comment (auction_id, user_id, content, created_at) VALUES
(1, 3, 'Máy còn bảo hành không shop ơi?', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(1, 2, 'Còn đầy đủ phụ kiện không bạn?', DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(1, 4, 'Mình thấy giá này hợp lý rồi đấy', DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
(4, 3, 'Máy còn bảo hành Apple được bao lâu?', DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(8, 2, 'Rolex chính hãng không bạn?', DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(11, 2, 'Size nào vậy bạn?', DATE_SUB(NOW(), INTERVAL 12 MINUTE)),
(15, 4, 'Túi này còn mới không?', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(17, 3, 'Chanel này mua ở cửa hàng nào vậy bạn?', DATE_SUB(NOW(), INTERVAL 80 MINUTE));

-- Bank accounts
INSERT INTO bank_account (bank_name, bank_code, account_number, account_holder) VALUES
('Vietcombank', 'VCB', '1234567890', 'CONG TY TNHH DAU GIA TRUC TUYEN'),
('MB Bank', 'MB', '0987654321', 'CONG TY TNHH DAU GIA TRUC TUYEN'),
('Techcombank', 'TCB', '1122334455', 'CONG TY TNHH DAU GIA TRUC TUYEN');

-- Verify data
SELECT 'Users' as table_name, COUNT(*) as count FROM user
UNION ALL SELECT 'Products', COUNT(*) FROM product
UNION ALL SELECT 'Auctions', COUNT(*) FROM auction
UNION ALL SELECT 'Categories', COUNT(*) FROM product_category
UNION ALL SELECT 'Notifications', COUNT(*) FROM notification;
