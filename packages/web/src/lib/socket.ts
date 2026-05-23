import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:4000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
});

// Track joined rooms to avoid duplicate emits
const joinedRooms = new Set<string>();

export function joinAuction(auctionId: string | number) {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('join-auction', auctionId);
}

export function leaveAuction(auctionId: string | number) {
  socket.emit('leave-auction', auctionId);
}

export function joinUser(userId: string | number) {
  const roomKey = `user-${userId}`;
  if (joinedRooms.has(roomKey)) return; // Already joined
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('join-user', userId);
  joinedRooms.add(roomKey);
}

export function onBidUpdate(callback: (data: {
  auctionId: number;
  auction?: Record<string, unknown>;
  newBid?: Record<string, unknown>;
}) => void): () => void {
  socket.on('bid-update', callback);
  return () => { socket.off('bid-update', callback); };
}

export function onUserNotification(
  callback: (data: { userId: number; auctionId: number; type: string }) => void
): () => void {
  socket.on('user-notification', callback);
  return () => { socket.off('user-notification', callback); };
}

export function onAuctionEndingSoon(callback: (auctionId: number) => void): () => void {
  socket.on('auction-ending-soon', callback);
  return () => { socket.off('auction-ending-soon', callback); };
}
