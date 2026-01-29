import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions<T> {
  /** Function to fetch data for a given page */
  fetchData: (page: number) => Promise<{ items: T[]; totalPages: number; total: number }>;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Threshold in pixels before hitting the bottom to trigger loading (default: 200) */
  threshold?: number;
  /** Enable/disable infinite scroll (default: true) */
  enabled?: boolean;
}

interface UseInfiniteScrollResult<T> {
  /** All loaded items */
  items: T[];
  /** Whether data is currently being loaded */
  loading: boolean;
  /** Whether initial load is in progress */
  initialLoading: boolean;
  /** Whether more items are being loaded */
  loadingMore: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Total number of items */
  total: number;
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Ref to attach to the scrollable container */
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  /** Ref to attach to the sentinel element at the bottom */
  sentinelRef: React.RefObject<HTMLDivElement>;
  /** Function to reload data from the beginning */
  reload: () => void;
  /** Function to manually load more items */
  loadMore: () => void;
  /** Set items directly (for optimistic updates) */
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

/**
 * Custom hook for implementing infinite scroll with automatic loading
 * when the user scrolls near the bottom of the container.
 */
export function useInfiniteScroll<T>({
  fetchData,
  initialPage = 1,
  threshold = 200,
  enabled = true,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (!enabled) return;

    setInitialLoading(true);
    setLoading(true);
    setError(null);
    loadingRef.current = true;

    try {
      const result = await fetchData(initialPage);
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setCurrentPage(initialPage);
      setHasMore(initialPage < result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setItems([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, [fetchData, initialPage, enabled]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (!enabled || loadingRef.current || !hasMore) return;

    const nextPage = currentPage + 1;
    setLoadingMore(true);
    setLoading(true);
    loadingRef.current = true;

    try {
      const result = await fetchData(nextPage);
      setItems(prev => [...prev, ...result.items]);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setCurrentPage(nextPage);
      setHasMore(nextPage < result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [fetchData, currentPage, hasMore, enabled]);

  // Reload from the beginning
  const reload = useCallback(() => {
    setItems([]);
    setCurrentPage(initialPage);
    setHasMore(true);
    loadInitialData();
  }, [loadInitialData, initialPage]);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          loadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore, threshold, enabled]);

  return {
    items,
    loading,
    initialLoading,
    loadingMore,
    error,
    hasMore,
    total,
    currentPage,
    totalPages,
    scrollContainerRef,
    sentinelRef,
    reload,
    loadMore,
    setItems,
  };
}

/**
 * Loading spinner component for infinite scroll
 */
export function InfiniteScrollLoader({ loading }: { loading: boolean }) {
  if (!loading) return null;

  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
    </div>
  );
}

/**
 * Sentinel component for intersection observer
 */
export function InfiniteScrollSentinel({
  sentinelRef,
  hasMore,
  loading,
  itemsCount,
  total,
  isRTL = false,
}: {
  sentinelRef: React.RefObject<HTMLDivElement>;
  hasMore: boolean;
  loading: boolean;
  itemsCount: number;
  total: number;
  isRTL?: boolean;
}) {
  return (
    <div ref={sentinelRef} className="py-4 text-center">
      {loading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <span className="ml-2 text-gray-400 text-sm">
            {isRTL ? 'جاري التحميل...' : 'Loading more...'}
          </span>
        </div>
      )}
      {!loading && !hasMore && itemsCount > 0 && (
        <p className="text-gray-500 text-sm">
          {isRTL 
            ? `تم عرض ${itemsCount} من ${total} عنصر` 
            : `Showing ${itemsCount} of ${total} items`}
        </p>
      )}
    </div>
  );
}
