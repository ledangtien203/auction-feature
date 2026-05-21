<<<<<<< HEAD
# 🏷️ Auction System - Monorepo

A modern online auction platform built with React, Node.js, Express, and MySQL. This is a monorepo structure using pnpm workspaces for managing backend and frontend packages.

**Original Design:** [Figma - Online Auction Website](https://www.figma.com/design/g2jNwiidSd7IBJAUMkmQGl/Online-Auction-Website)

## 📁 Project Structure

```
packages/
├── api/          # Backend API (Node.js + Express + MySQL)
└── web/          # Frontend (React + Vite + TypeScript)
database/         # Database schema
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- MySQL 8+

### Installation

```bash
# Install dependencies for all packages
pnpm install

# Or install with npm/yarn workspaces
npm install
```

### Setup Environment

```bash
cp .env.example .env
# Edit .env with your MySQL and JWT configuration
```

### Initialize Database

```bash
mysql -u root -p < database/schema.sql
```

### Development

Run both API and web in parallel:

```bash
pnpm dev
```

Or run individually:

```bash
pnpm dev:api    # Start API on http://localhost:4000
pnpm dev:web    # Start Web on http://localhost:5173
```

### Build

```bash
pnpm build      # Build frontend (output: packages/web/dist)
```

### Seed Database (Optional)

```bash
pnpm seed       # Load sample data
```

## 📦 Available Scripts

**Root level:**

- `pnpm dev` - Run API and Web concurrently
- `pnpm dev:api` - Run API only
- `pnpm dev:web` - Run Web only
- `pnpm build` - Build web frontend
- `pnpm seed` - Seed database with sample data

**API level** (`packages/api/`):

- `npm run dev` - Start API development server
- `npm run seed` - Load sample auction data

**Web level** (`packages/web/`):

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🏗️ Architecture

### Backend (`packages/api/src`)

Clean layered architecture:

- **config/** - Configuration management (database, env)
- **middleware/** - Authentication, error handling
- **routes/** - API route definitions
- **services/** - Business logic, database operations
- **utils/** - Helper functions, formatters
- **models/** - Data models (future)
- **controllers/** - Request handlers (future refactoring)

### Frontend (`packages/web/src`)

Component-driven architecture:

- **components/** - Reusable UI components
- **features/** - Feature-specific containers
- **hooks/** - Custom React hooks
- **pages/** - Page components
- **services/** - API client integration
- **types/** - TypeScript type definitions
- **utils/** - Helper utilities, formatters
- **styles/** - Global CSS and Tailwind theming

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user info

### Auctions

- `GET /api/auctions` - List all auctions
- `GET /api/auctions/:id` - Auction details
- `GET /api/auctions/featured` - Featured auctions
- `GET /api/auctions/:id/bids` - Auction bid history

### Bidding

- `GET /api/bids/me` - User's bid history
- `POST /api/bids/auctions/:id` - Place a bid

### Admin

- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management

## 🔐 Environment Variables

```env
# Server
PORT=4000
JWT_SECRET=your-secure-secret-key-here

# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=auction_db
```

## 🛠️ Tech Stack

### Backend

- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JWT
- **Security:** bcryptjs for password hashing
- **Language:** JavaScript (ES modules)

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Routing:** React Router
- **HTTP Client:** Fetch API

## 📋 Database Schema

Main tables:

- `users` - User accounts with role and status
- `auctions` - Auction listings
- `bids` - User bids on auctions
- `transactions` - Transaction records

See `database/schema.sql` for full schema.

## 🤝 Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make your changes**
   - Backend changes in `packages/api/src`
   - Frontend changes in `packages/web/src`

3. **Test locally**

   ```bash
   pnpm dev
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: describe your feature"
   git push origin feature/feature-name
   ```

## 📝 License

Private project - All rights reserved

---

**Built with ❤️**
=======
# auction-feature
>>>>>>> a3a26c68539a1a2675fd3644ed6370afdbf61a87
