# Hướng dẫn đóng góp

Cảm ơn bạn đã quan tâm đóng góp cho dự án Auction System!

## 📋 Mục lục

- [Quy tắc ứng xử](#quy-tắc-ứng-xử)
- [Trước khi bắt đầu](#trước-khi-bắt-đầu)
- [Quy trình đóng góp](#quy-trình-đóng-góp)
- [Cấu trúc commit](#cấu-trúc-commit)
- [Pull Request](#pull-request)
- [Hướng dẫn code](#hướng-dẫn-code)

---

## Quy tắc ứng xử

Chúng tôi cam kết tạo ra một môi trường chào đón cho tất cả mọi người. Vui lòng:

- Sử dụng ngôn ngữ thân thiện và tôn trọng
- Hoan nghênh các ý kiến đóng góp khác nhau
- Chấp nhận phê bình mang tính xây dựng
- Tập trung vào điều tốt nhất cho cộng đồng

## Trước khi bắt đầu

### Yêu cầu hệ thống

- **Node.js**: 18+
- **pnpm**: 8+
- **MySQL**: 8+

### Cài đặt môi trường

```bash
# Clone repository
git clone <repo-url>
cd auction-feature

# Cài đặt dependencies
pnpm install

# Copy và cấu hình .env
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn

# Khởi tạo database
mysql -u root -p < database/schema.sql

# Chạy development
pnpm dev
```

---

## Quy trình đóng góp

### 1. Fork repository

Fork repository về tài khoản của bạn.

### 2. Clone về máy local

```bash
git clone https://github.com/<your-username>/auction-feature.git
cd auction-feature
```

### 3. Tạo branch mới

```bash
# Đối với tính năng mới
git checkout -b feature/ten-tinh-nang

# Đối với sửa lỗi
git checkout -b fix/ten-loi

# Đối với documentation
git checkout -b docs/mo-ta
```

### 4. Làm việc trên branch

```bash
# Chạy development
pnpm dev

# Kiểm tra code
pnpm lint
```

### 5. Commit thay đổi

```bash
git add .
git commit -m "feat: thêm tính năng đăng nhập"
```

### 6. Push lên remote

```bash
git push origin feature/ten-tinh-nang
```

### 7. Tạo Pull Request

Mở Pull Request trên GitHub và điền thông tin theo template.

---

## Cấu trúc commit

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Mô tả |
|------|-------|
| `feat` | Tính năng mới |
| `fix` | Sửa lỗi |
| `docs` | Thay đổi documentation |
| `style` | Thay đổi format, không ảnh hưởng code |
| `refactor` | Refactor code |
| `test` | Thêm test |
| `chore` | Công việc maintenance |

### Ví dụ

```
feat(auth): thêm xác thực JWT

fix(bid): sửa race condition khi đặt giá

docs(readme): cập nhật hướng dẫn cài đặt
```

---

## Pull Request

### Checklist trước khi tạo PR

- [ ] Code tuân thủ coding standards
- [ ] Không có lỗi lint
- [ ] Đã test local
- [ ] Cập nhật documentation nếu cần
- [ ] Commit messages rõ ràng

### Template PR

```markdown
## Mô tả
Mô tả ngắn gọn thay đổi

## Loại thay đổi
- [ ] Tính năng mới (feat)
- [ ] Sửa lỗi (fix)
- [ ] Thay đổi breaking
- [ ] Documentation

## Screenshots (nếu có UI thay đổi)

## Testing
- [ ] Đã test trên local
- [ ] Đã test edge cases

## Checklist
- [ ] Code không có lỗi lint
- [ ] Documentation đã cập nhật
- [ ] Tests đã thêm/chạy thành công
```

---

## Hướng dẫn code

### Backend (packages/api)

#### Cấu trúc route mới

```javascript
import { Router } from 'express';
import { getPool } from '../config/database.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
const pool = getPool();

// GET /api/resource - Lấy danh sách
router.get('/', async (req, res) => {
  try {
    // Implementation
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// POST /api/resource - Tạo mới
router.post('/', authRequired, async (req, res) => {
  try {
    // Implementation
    res.status(201).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

export default router;
```

#### Quy tắc quan trọng

1. **Luôn dùng parameterized queries** để tránh SQL injection
2. **Validate input** trước khi xử lý
3. **Xử lý lỗi** với try-catch và trả message rõ ràng
4. **Dùng transactions** cho các thao tác nhiều bước
5. **Emit Socket.IO events** sau khi thay đổi data

### Frontend (packages/web)

#### Cấu trúc component mới

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  onSubmit: (data: DataType) => void;
}

export function MyComponent({ title, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{title}</h2>
      <Button disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Submit'}
      </Button>
    </div>
  );
}
```

#### Quy tắc quan trọng

1. **TypeScript**: Luôn định nghĩa interfaces cho props
2. **Naming**: Component file viết hoa (`MyComponent.tsx`)
3. **Hooks**: Custom hooks trong thư mục `hooks/`
4. **Services**: API calls trong thư mục `services/`
5. **Types**: Type definitions trong thư mục `types/`

---

## Hỗ trợ

Nếu có câu hỏi, vui lòng tạo Issue hoặc liên hệ qua email.

---

**Cảm ơn đã đóng góp! ❤️**
