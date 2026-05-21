# 📂 Project Structure Overview

## Root Directory Structure

```
d:\New folder\
├── 📁 packages/              # Monorepo packages
│   ├── api/                  # Backend API
│   └── web/                  # Frontend Web
├── 📁 database/              # Database files
│   └── schema.sql            # MySQL schema
├── 📁 guidelines/            # Project guidelines
├── 📁 node_modules/          # Dependencies (auto-generated)
├── 📁 dist/                  # Build output (auto-generated)
├── 📄 package.json           # Root workspace config
├── 📄 pnpm-workspace.yaml    # pnpm workspace config
├── 📄 README.md              # Project documentation
├── 📄 SETUP.md               # Setup instructions
├── 📄 CONTRIBUTING.md        # Development guide
├── 📄 ADR.md                 # Architecture decisions
├── 📄 .env                   # Environment variables (local, don't commit)
├── 📄 .env.example           # Environment template
├── 📄 .gitignore             # Git ignore rules
├── 📄 .eslintrc              # ESLint config
├── 📄 .prettierrc            # Prettier config
├── 📄 vite.config.ts         # [Deprecated - use packages/web/vite.config.ts]
├── 📄 postcss.config.mjs     # [Moved to packages/web/]
├── 📄 index.html             # [Moved to packages/web/]
└── 📄 tailwind.config.js     # [Deprecated - check packages/web/]
```

## Backend Structure (packages/api)

```
packages/api/
├── src/
│   ├── 📁 config/            # Configuration
│   │   ├── database.js       # MySQL connection pool
│   │   └── env.js            # Environment config
│   ├── 📁 middleware/        # Express middleware
│   │   └── auth.js           # JWT authentication
│   ├── 📁 routes/            # API route definitions
│   │   ├── auth.js           # /api/auth/*
│   │   ├── auctions.js       # /api/auctions/*
│   │   ├── bids.js           # /api/bids/*
│   │   └── admin.js          # /api/admin/*
│   ├── 📁 services/          # Business logic [empty - to be added]
│   ├── 📁 controllers/       # Controllers [empty - for future refactoring]
│   ├── 📁 models/            # Data models [empty - for future use]
│   ├── 📁 utils/             # Utilities
│   │   └── rows.js           # Row mapping functions
│   ├── 📁 scripts/           # Utility scripts
│   │   └── seed.js           # Database seeding
│   ├── 📁 seed/              # Seed data
│   │   └── auctions.seed.json
│   └── index.js              # Entry point
├── package.json              # Backend dependencies
├── .env.example              # Environment template
└── README.md                 # Backend-specific docs [optional]
```

## Frontend Structure (packages/web)

```
packages/web/
├── src/
│   ├── 📁 components/        # Reusable UI components
│   │   ├── ui/               # Radix UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ... (40+ UI components)
│   │   ├── figma/            # Figma-specific components
│   │   │   └── ImageWithFallback.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── Layout.tsx
│   │   ├── AuctionCard.tsx
│   │   └── CountdownTimer.tsx
│   ├── 📁 features/          # Feature containers [empty - to be filled]
│   ├── 📁 hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useAuctions.ts
│   │   ├── useCountdown.ts
│   │   └── useLocalStorage.ts
│   ├── 📁 pages/             # Page components
│   │   ├── Home.tsx
│   │   ├── Auctions.tsx
│   │   ├── AuctionDetail.tsx
│   │   ├── MyBids.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── admin/
│   │       ├── AdminAuctions.tsx
│   │       ├── AdminSettings.tsx
│   │       └── AdminTransactions.tsx
│   ├── 📁 services/          # API client layer
│   │   ├── authService.ts
│   │   ├── auctionService.ts
│   │   ├── transactionService.ts
│   │   └── userService.ts
│   ├── 📁 types/             # TypeScript types
│   │   ├── user.ts
│   │   ├── auction.ts
│   │   ├── transaction.ts
│   │   └── admin.ts
│   ├── 📁 utils/             # Utilities
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── 📁 lib/               # Library utilities
│   │   ├── api.ts            # API client
│   │   └── normalize.ts      # Data normalization
│   ├── 📁 styles/            # Global styles
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   ├── theme.css
│   │   └── fonts.css
│   ├── 📁 constants/         # Constants
│   │   └── index.ts
│   ├── 📁 data/              # Mock/static data
│   │   ├── admin-data.ts
│   │   └── auctions.ts
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── routes.ts             # Route definitions
├── public/                   # Static assets
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── tsconfig.node.json        # TypeScript config (Node)
├── postcss.config.mjs        # PostCSS config
├── package.json              # Frontend dependencies
├── index.html                # HTML template
└── default_shadcn_theme.css  # Default theme
```

## Database Structure

```
database/
└── schema.sql                # MySQL schema with tables:
                              # - users
                              # - auctions
                              # - bids
                              # - transactions
```

## Key Configuration Files

### Root Level
- `package.json` - Monorepo workspace, shared scripts
- `pnpm-workspace.yaml` - Workspace configuration
- `.env.example` - Environment template
- `.env` - Local environment (git-ignored)
- `.gitignore` - Git ignore patterns
- `.eslintrc` - ESLint configuration
- `.prettierrc` - Code formatter config
- `README.md` - Main documentation
- `SETUP.md` - Setup guide
- `CONTRIBUTING.md` - Development guide
- `ADR.md` - Architecture decisions

### Backend (packages/api)
- `package.json` - Dependencies: express, mysql2, jwt, bcryptjs
- `src/index.js` - Express app setup

### Frontend (packages/web)
- `package.json` - Dependencies: react, vite, tailwind
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `index.html` - HTML entry point

## Workflow

### Adding a New Backend Route
1. Create file in `packages/api/src/routes/`
2. Import and use in `packages/api/src/index.js`
3. Use `getPool()` from `config/database.js`
4. Add middleware if needed

### Adding a New Frontend Page
1. Create file in `packages/web/src/pages/`
2. Add route in `packages/web/src/routes.ts`
3. Use custom hooks from `src/hooks/`
4. Add TypeScript types in `src/types/`

### Adding Dependencies
```bash
# Backend
npm -w @auction/api install express

# Frontend
npm -w @auction/web install react-query

# Root (devDependencies)
npm install -D concurrently
```

## Important Patterns

### Backend Data Flow
1. Route receives request
2. Route calls getPool() to query database
3. Data mapped using utils/rows.js mappers
4. Response sent to client

### Frontend Data Flow
1. Component renders
2. useAuth/useAuctions hook fetches data
3. Data displayed in component
4. User interaction calls service (authService, auctionService, etc.)

## Git Workflow

```
main branch
├── feature/auth-rbac
├── feature/admin-dashboard
├── fix/bid-race-condition
└── docs/api-documentation
```

Each feature is PR'd and reviewed before merging.

---

**Last Updated:** May 14, 2026
**Version:** 1.0.0 (Monorepo Restructure)
