import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Auction, AuctionStatus } from '../types/auction';
import { auctionService } from '../services/auctionService';

interface UseAuctionsOptions {
  status?: AuctionStatus;
  category?: string;
  searchQuery?: string;
  limit?: number;
}

interface UseAuctionsReturn {
  auctions: Auction[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  refetch: () => void;
}

export const useAuctions = (options: UseAuctionsOptions = {}): UseAuctionsReturn => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await auctionService.getAuctions({
        status: options.status,
        category: options.category,
        search: options.searchQuery,
        limit: options.limit,
      });
      setAuctions(list);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch auctions'));
    } finally {
      setLoading(false);
    }
  }, [options.status, options.category, options.searchQuery, options.limit]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const totalCount = useMemo(() => auctions.length, [auctions]);

  return {
    auctions,
    loading,
    error,
    totalCount,
    refetch: fetchAuctions,
  };
};

export const useAuction = (id: string | undefined) => {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setAuction(null);
      setLoading(false);
      return;
    }
    const fetchAuction = async () => {
      try {
        setLoading(true);
        setError(null);
        const found = await auctionService.getAuctionById(id);
        setAuction(found);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch auction'));
        setAuction(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  return { auction, loading, error };
};
