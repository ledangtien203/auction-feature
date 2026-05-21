# Architecture Decision Records (ADR)

## Mục lục

- [ADR-001: Monorepo Structure](#adr-001-monorepo-structure)
- [ADR-002: Database Schema Design](#adr-002-database-schema-design)
- [ADR-003: Authentication Strategy](#adr-003-authentication-strategy)
- [ADR-004: Real-time Updates with Socket.IO](#adr-004-real-time-updates-with-socketio)
- [ADR-005: Frontend State Management](#adr-005-frontend-state-management)
- [ADR-006: API Design Principles](#adr-006-api-design-principles)

---

## ADR-001: Monorepo Structure

### Status: Accepted

### Context

Chúng ta cần quản lý cả backend (API) và frontend (Web) trong một repository. Việc này giúp:
- Chia sẻ code và types giữa frontend và backend
- Đồng bộ dependencies
- Dễ dàng setup CI/CD
- Quản lý versioning thống nhất

### Decision

Sử dụng **pnpm workspaces** để tạo monorepo với cấu trúc:

```
auction-feature/
├── packages/
│   ├── api/           # Backend (Node.js + Express)
│   └── web/           # Frontend (React + Vite)
├── database/          # Database schema
├── package.json       # Root workspace config
└── pnpm-workspace.yaml
```

### Consequences

**Tích cực:**
- Quản lý dependencies tập trung
- TypeScript types có thể share giữa packages
- Build process đồng nhất

**Tiêu cực:**
- Cần cài đặt workspace tools
- Có thể phức tạp hơn cho người mới

---

## ADR-002: Database Schema Design

### Status: Accepted

### Context

Cần thiết kế database cho hệ thống đấu giá với:
- Quản lý users với roles (user/admin)
- Quản lý auctions với nhiều trạng thái
- Lịch sử bids
- Thanh toán và giao dịch
- Notifications real-time
- Chatbot knowledge base

### Decision

Sử dụng **MySQL 8** với các bảng chính:

| Bảng | Mục đích |
|------|----------|
| `users` | Tài khoản người dùng + admin |
| `categories` | Danh mục sản phẩm |
| `auctions` | Phiên đấu giá |
| `auction_images` | Nhiều ảnh/auction |
| `bids` | Lịch sử đặt giá |
| `transactions` | Giao dịch thanh toán |
| `notifications` | Thông báo |
| `auction_watchlist` | Theo dõi auctions |
| `chatbot_knowledge` | Knowledge base cho AI |
| `admin_activity_logs` | Audit log |

### Consequences

**Tích cực:**
- Schema rõ ràng, dễ maintain
- Indexes cho performance
- Foreign keys đảm bảo referential integrity
- Views cho báo cáo

**Tiêu cực:**
- Cần migrations khi thay đổi schema
- Một số queries phức tạp (v_auction_current_leader)

---

## ADR-003: Authentication Strategy

### Status: Accepted

### Context

Cần xác thực người dùng và bảo vệ các API endpoints.

### Decision

Sử dụng **JWT (JSON Web Tokens)** với:

```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "id", "email", "role", "exp" }
Signature: HMAC SHA256
```

**Password hashing:** bcryptjs với salt rounds = 10

### Implementation

```javascript
// Token generation
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Middleware verification
const authRequired = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Verify and attach user to req
};
```

### Consequences

**Tích cực:**
- Stateless, scalable
- Token có thể share giữa services
- JWT decode nhanh ở client

**Tiêu cực:**
- Token không thể revoke dễ dàng (cần blacklist)
- Payload có giới hạn kích thước

---

## ADR-004: Real-time Updates with Socket.IO

### Status: Accepted

### Context

Người dùng cần thấy:
- Bid updates tức thì khi có người đặt giá
- Thông báo khi bị outbid
- Auction ending soon alerts

### Decision

Sử dụng **Socket.IO** với room-based architecture:

```
User connects → joins auction room → receives bid updates
```

**Events:**
- `join-auction` - Tham gia phòng auction
- `leave-auction` - Rời phòng
- `new-bid` - Có bid mới
- `auction-ending-soon` - Auction sắp kết thúc
- `bid-update` - Cập nhật bid (server → client)

### Consequences

**Tích cực:**
- Real-time updates
- Efficient với rooms
- Fallback cho browsers cũ

**Tiêu cực:**
- Cần keep-alive connections
- Server state management phức tạp hơn

---

## ADR-005: Frontend State Management

### Status: Accepted

### Context

Cần quản lý state cho:
- Authentication state
- Auction listings
- User's bids
- Notifications
- Real-time updates

### Decision

Sử dụng **React Context + Custom Hooks**:

```
src/
├── hooks/
│   ├── useAuth.ts      # Auth state & methods
│   ├── useAuctions.ts # Auction data fetching
│   └── useCountdown.ts # Timer logic
├── services/           # API calls
└── lib/
    └── api.ts          # Axios/fetch instance
```

### Consequences

**Tích cực:**
- Simple, no extra dependencies
- Type-safe với TypeScript
- Easy to understand

**Tiêu cực:**
- Có thể cần refactor nếu app phức tạp
- Context re-renders có thể ảnh hưởng performance

---

## ADR-006: API Design Principles

### Status: Accepted

### Context

Cần design API nhất quán cho hệ thống.

### Decision

**RESTful conventions:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/auctions | List all |
| GET | /api/auctions/:id | Get one |
| POST | /api/auctions | Create |
| PUT | /api/auctions/:id | Update |
| DELETE | /api/auctions/:id | Delete |

**Response format:**

```json
// Success
{ "data": {...} }

// Error
{ "message": "Error description", "code": "ERROR_CODE" }

// List
{ "data": [...], "total": 100, "page": 1 }
```

**Status codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

### Consequences

**Tích cực:**
- RESTful, predictable
- Easy to document
- Standard HTTP semantics

**Tiêu cực:**
- Một số operations không fit REST (real-time, bulk operations)

---

## Lịch sử thay đổi

| Date | Version | Description |
|------|---------|-------------|
| 2026-05-20 | 1.0 | Initial ADRs |

---

*Document maintained by: Development Team*
