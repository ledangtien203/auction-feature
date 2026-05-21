import type { Auction, Bid } from '../types/auction';
import { api } from '../lib/api';
import { parseAuction, parseBid } from '../lib/normalize';

export interface AuctionFilters {
  status?: string;
  category?: string;
  search?: string;
  limit?: number;
}

export const auctionService = {
  async getAuctions(filters: AuctionFilters = {}): Promise<Auction[]> {
    const p = new URLSearchParams();
    if (filters.status) p.set('status', filters.status);
    if (filters.category) p.set('category', filters.category);
    if (filters.search) p.set('search', filters.search);
    if (filters.limit != null) p.set('limit', String(filters.limit));
    const q = p.toString();
    const rows = await api<Record<string, unknown>[]>(`/api/auctions${q ? `?${q}` : ''}`);
    return rows.map(parseAuction);
  },

  async getAuctionById(id: string): Promise<Auction> {
    const row = await api<Record<string, unknown>>(`/api/auctions/${encodeURIComponent(id)}`);
    return parseAuction(row);
  },

  async getFeaturedAuctions(limit = 4): Promise<Auction[]> {
    const rows = await api<Record<string, unknown>[]>(`/api/auctions/featured?limit=${limit}`);
    return rows.map(parseAuction);
  },

  async getTrendingAuctions(limit = 6): Promise<Auction[]> {
    const rows = await api<Record<string, unknown>[]>(`/api/auctions/trending?limit=${limit}`);
    return rows.map(parseAuction);
  },

  async getAuctionBidHistory(auctionId: string): Promise<
    { amount: number; time: string; userLabel: string }[]
  > {
    return api(`/api/auctions/${encodeURIComponent(auctionId)}/bids`);
  },

  async placeBid(auctionId: string, amount: number): Promise<Auction> {
    const res = await api<{ auction: Record<string, unknown> }>(
      `/api/bids/auctions/${encodeURIComponent(auctionId)}`,
      { method: 'POST', body: JSON.stringify({ amount }) }
    );
    return parseAuction(res.auction);
  },

  async getMyBidsWithAuctions(): Promise<{
    bids: Bid[];
    auctions: Record<string, Auction>;
  }> {
    const res = await api<{
      bids: Record<string, unknown>[];
      auctions: Record<string, Record<string, unknown>>;
    }>('/api/bids/me');
    const auctions: Record<string, Auction> = {};
    for (const [k, v] of Object.entries(res.auctions || {})) {
      auctions[k] = parseAuction(v);
    }
    return { bids: res.bids.map(parseBid), auctions };
  },

  async getWonAuctions(): Promise<{
    wonAuctions: (Auction & { winningBid?: Bid; transactionStatus?: string; paymentMethod?: string })[];
  }> {
    return api('/api/bids/won');
  },

  async adminListAuctions(): Promise<Auction[]> {
    const rows = await api<Record<string, unknown>[]>('/api/admin/auctions');
    return rows.map(parseAuction);
  },

  async adminCreateAuction(payload: Partial<Auction> & { endTime?: string }): Promise<Auction> {
    const row = await api<Record<string, unknown>>('/api/admin/auctions', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        image: payload.image,
        category: payload.category,
        startingBid: payload.startingBid,
        minIncrement: payload.minIncrement,
        status: payload.status,
        seller: payload.seller,
        endTime: payload.endTime,
      }),
    });
    return parseAuction(row);
  },

  async adminUpdateAuction(
    id: string,
    payload: Partial<Auction> & { endTime?: string }
  ): Promise<Auction> {
    const row = await api<Record<string, unknown>>(`/api/admin/auctions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return parseAuction(row);
  },

  async adminDeleteAuction(id: string): Promise<void> {
    await api(`/api/admin/auctions/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async updateAuction(id: number, payload: Partial<Auction> & { endTime?: string }): Promise<Auction> {
    const row = await api<Record<string, unknown>>(`/api/admin/auctions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return parseAuction(row);
  },

  async deleteAuction(id: number): Promise<void> {
    await api(`/api/admin/auctions/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async adminNotifyWinner(
    id: string,
    options?: { force?: boolean }
  ): Promise<{
    ok: boolean;
    message: string;
    notificationCreated?: boolean;
    winnerUserId?: number | null;
  }> {
    return api(`/api/admin/auctions/${encodeURIComponent(id)}/notify-winner`, {
      method: 'POST',
      body: JSON.stringify(options ?? {}),
    });
  },

  async adminProcessExpiredAuctions(): Promise<{ processed: number }> {
    const res = await api<{ processed: number }>('/api/admin/auctions/process-expired', {
      method: 'POST',
    });
    return res;
  },
};
