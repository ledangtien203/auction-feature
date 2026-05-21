export type SyncEventType = 'auctions' | 'users' | 'transactions';

const STORAGE_KEY = 'app-sync-event';
const CHANNEL_NAME = 'app-sync-event';

const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel(CHANNEL_NAME)
  : null;

type SyncHandler = (eventType: SyncEventType) => void;

export function broadcastSyncEvent(type: SyncEventType) {
  const payload = JSON.stringify({ type, ts: Date.now() });

  try {
    localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // ignore storage failures in browsers with restricted storage access
  }

  if (channel) {
    channel.postMessage({ type, ts: Date.now() });
  }
}

export function parseSyncEvent(raw: string | null): SyncEventType | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { type?: string };
    if (parsed?.type === 'auctions' || parsed?.type === 'users' || parsed?.type === 'transactions') {
      return parsed.type;
    }
  } catch {
    return null;
  }
  return null;
}

export function addSyncEventListener(handler: SyncHandler) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    const type = parseSyncEvent(event.newValue);
    if (type) handler(type);
  };

  const onChannelMessage = (event: MessageEvent) => {
    const data = event.data as { type?: string };
    if (!data?.type) return;
    if (data.type === 'auctions' || data.type === 'users' || data.type === 'transactions') {
      handler(data.type);
    }
  };

  window.addEventListener('storage', onStorage);
  if (channel) {
    channel.addEventListener('message', onChannelMessage);
  }

  return () => {
    window.removeEventListener('storage', onStorage);
    if (channel) {
      channel.removeEventListener('message', onChannelMessage);
    }
  };
}
