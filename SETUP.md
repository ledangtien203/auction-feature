# Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
JWT_SECRET=your-random-secret-key-here
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=auction_system
```

### 3. Initialize Database

```bash
# Using MySQL CLI
mysql -u root -p < database/schema.sql

# Or in MySQL prompt
source database/schema.sql;
```

### 4. Seed Sample Data (Optional)

```bash
pnpm seed
```

### 5. Start Development

```bash
pnpm dev
```

Access:

- Frontend: http://localhost:5173
- API: http://localhost:4000
- API Health: http://localhost:4000/api/health

---

## 📋 Detailed Setup

### Prerequisites Check

```bash
# Node.js (18+)
node --version

# pnpm (8+)
pnpm --version

# MySQL (8+)
mysql --version
```

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd auction-system
```

### Step 2: Install Dependencies

**Option A: Using pnpm (Recommended)**

```bash
pnpm install
```

**Option B: Using npm**

```bash
npm install
```

**Option C: Using yarn**

```bash
yarn install
```

### Step 3: Database Setup

**Option 1: MySQL CLI**

```bash
mysql -u root -p
mysql> source database/schema.sql;
mysql> exit
```

**Option 2: MySQL Command Line**

```bash
mysql -u root -p < database/schema.sql
```

**Option 3: MySQL GUI (Workbench)**

1. Open MySQL Workbench
2. File > Open SQL Script
3. Select `database/schema.sql`
4. Execute (Ctrl+Shift+Enter)

### Step 4: Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit with your values:

```env
# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=generate-a-random-secret-here

# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=auction_system
```

**Generate JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Verify Setup

**Check API**

```bash
curl http://localhost:4000/api/health
# Should return: {"ok":true}
```

**Check Database**

```bash
pnpm seed
# Should output: ✅ Database seeded successfully
```

### Step 6: Start Development

**All at once:**

```bash
pnpm dev
```

**Separately:**

```bash
# Terminal 1: Backend
pnpm dev:api

# Terminal 2: Frontend
pnpm dev:web
```

---

## 🐛 Troubleshooting

### Port Already in Use

**API Port (4000)**

```bash
# Find process
lsof -i :4000
# Kill process
kill -9 <PID>
# Or change port in .env
```

**Web Port (5173)**

```bash
# Find process
lsof -i :5173
# Kill process
kill -9 <PID>
```

### MySQL Connection Error

**Error: ER_ACCESS_DENIED_FOR_USER**

```bash
# Check credentials in .env
cat .env | grep MYSQL

# Try connecting manually
mysql -h localhost -u root -p
# Enter password when prompted
```

**Error: ER_BAD_DB_ERROR**

```bash
# Database doesn't exist, recreate it
mysql -u root -p < database/schema.sql
```

**Error: ECONNREFUSED**

```bash
# MySQL not running
# On macOS
brew services start mysql

# On Linux
sudo systemctl start mysql

# On Windows
net start MySQL80
```

### Module Not Found

```bash
# Clear node_modules and lock file
rm -rf node_modules
rm pnpm-lock.yaml

# Reinstall
pnpm install
```

### Port 3306 (MySQL) Not Accessible

```bash
# Check if MySQL is listening
netstat -an | grep 3306

# On macOS:
sudo lsof -i :3306

# Restart MySQL
mysql.server restart
```

### pnpm Command Not Found

```bash
# Install pnpm globally
npm install -g pnpm

# Verify
pnpm --version
```

### Still Having Issues?

1. Check `.env` file exists and has correct values
2. Verify MySQL is running: `mysql -u root -p`
3. Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`
4. Review log files for errors
5. Create GitHub issue with:
   - Error message
   - Environment info (OS, Node version, MySQL version)
   - Steps to reproduce

---

## 📱 Available Scripts

```bash
# Development
pnpm dev          # Run API and Web together
pnpm dev:api      # Run API only
pnpm dev:web      # Run Web only

# Building
pnpm build        # Build frontend for production

# Database
pnpm seed         # Load sample data

# Workspace commands
npm -w @auction/api run dev
npm -w @auction/web run build
```

---

## 🔐 Security Notes

1. **Never commit `.env` file**
2. **Keep `JWT_SECRET` safe**
3. **Use strong passwords**
4. **Keep dependencies updated**

---

## ✅ Verification Checklist

- [ ] Node.js installed (18+)
- [ ] pnpm installed (8+)
- [ ] MySQL installed & running
- [ ] `.env` file created with correct values
- [ ] Database schema imported
- [ ] Dependencies installed (`pnpm install`)
- [ ] API starts (`pnpm dev:api`)
- [ ] Web starts (`pnpm dev:web`)
- [ ] Can access http://localhost:5173
- [ ] Can access http://localhost:4000/api/health

---

## 🎉 Next Steps

1. Read [README.md](./README.md) for project overview
2. Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
3. Review [ADR.md](./ADR.md) for architecture decisions
4. Start development!

Happy coding! 🚀
