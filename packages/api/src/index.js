import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import auctionRoutes from './routes/auctions.js';
import bidRoutes from './routes/bids.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';
import watchlistRoutes from './routes/watchlist.js';
import uploadRoutes from './routes/upload.js';
import { config, validateConfig } from './config/env.js';
import { finalizeExpiredAuctions } from './services/auctionFinalize.js';
import { notifyEndingAuctions } from './services/notificationScheduler.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

const PORT = config.port;

validateConfig();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.json({
    message: 'Auction API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      auctions: '/api/auctions',
      bids: '/api/bids',
      admin: '/api/admin',
      ai: '/api/ai',
      notifications: '/api/notifications',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/uploads', express.static('packages/api/public/uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Lỗi máy chủ' });
});

// Socket.IO real-time functionality
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join auction room
  socket.on('join-auction', (auctionId) => {
    socket.join(`auction-${auctionId}`);
    console.log(`User ${socket.id} joined auction ${auctionId}`);
  });

  // Leave auction room
  socket.on('leave-auction', (auctionId) => {
    socket.leave(`auction-${auctionId}`);
    console.log(`User ${socket.id} left auction ${auctionId}`);
  });

  // Join user-specific room for personal notifications
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${socket.id} joined user room ${userId}`);
  });

  // Handle new bid
  socket.on('new-bid', (data) => {
    const { auctionId, bid } = data;
    // Broadcast to all users in this auction room
    io.to(`auction-${auctionId}`).emit('bid-update', bid);
    // Also broadcast to admin dashboard
    io.emit('auction-activity', { type: 'new-bid', auctionId, bid });
  });

  // Handle auction ending soon
  socket.on('auction-ending-soon', (auctionId) => {
    io.to(`auction-${auctionId}`).emit('auction-ending-soon', auctionId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available globally for routes
global.io = io;

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`WebSocket server ready`);
});

// Tự kết thúc phiên hết giờ mỗi phút
setInterval(() => {
  finalizeExpiredAuctions().catch((err) => console.error('finalizeExpiredAuctions', err));
  notifyEndingAuctions().catch((err) => console.error('notifyEndingAuctions', err));
}, 60_000);
finalizeExpiredAuctions().catch((err) => console.error('finalizeExpiredAuctions', err));
notifyEndingAuctions().catch((err) => console.error('notifyEndingAuctions', err));
