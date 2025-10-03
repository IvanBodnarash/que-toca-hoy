import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Global cache between mounts (page session)
const CACHE = new Map(); // key -> { data, ts }
const INFLIGHT = new Map(); // key -> Promise

// Creates stable key (string)
const keyToString = (key) =>
  typeof key === "string" ? key : JSON.stringify(key ?? "");

const defaultCompare = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return Object.is(a, b);
  }
};

/**
 * useCachedQuery(key, fetcher, options?)
 * - SWR behavior: instantly returns cache (if valid), fetches fresh data in the background
 * - Does not "blink": spinner shows only if there is no cache
 *
 * options:
 * - ttl: ms for cache validity (default 60_000)
 * - enabled: boolean (default true) — you can disable the query
 * - select: (data) => any — data transformation before set/cache
 * - compare: (prev, next) => boolean — controls whether to update the state
 * - refetchOnWindowFocus: boolean (default true)
 */

export function useCachedQuery(
  key,
  fetcher,
  {
    ttl = 60_000,
    enabled = true,
    select,
    compare = defaultCompare,
    refetchOnWindowFocus = true,
    keepPreviousData = true,
  } = {}
) {
  const cacheKey = useMemo(() => keyToString(key), [key]);

  const fetcherRef = useRef(fetcher);
  const selectRef = useRef(select);
  const compareRef = useRef(compare);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);
  useEffect(() => {
    selectRef.current = select;
  }, [select]);
  useEffect(() => {
    compareRef.current = compare;
  }, [compare]);

  // First init from cache
  const initFromCache = () => {
    const entry = CACHE.get(cacheKey);
    if (entry && Date.now() - entry.ts < ttl) return entry.data;
    return undefined;
  };

  const [data, setData] = useState(initFromCache);
  const [loadingRaw, setLoadingRaw] = useState(
    () => data === undefined && enabled
  );
  const [error, setError] = useState("");
  const acRef = useRef(null);

  const hasValidCache = useMemo(() => {
    const entry = CACHE.get(cacheKey);
    return !!(entry && Date.now() - entry.ts < ttl);
  }, [cacheKey, ttl]);

  const applyData = useCallback(
    (next) => {
      const processed = selectRef.current ? selectRef.current(next) : next;
      setData((prev) =>
        compareRef.current(prev, processed) ? prev : processed
      );
      CACHE.set(cacheKey, { data: processed, ts: Date.now() });
    },
    [cacheKey]
  );

  const fetchFresh = useCallback(async () => {
    if (!enabled) return;
    if (acRef.current) acRef.current.abort();
    const ac = new AbortController();
    acRef.current = ac;

    try {
      if (!hasValidCache && !keepPreviousData) setData(undefined);
      if (!hasValidCache) setLoadingRaw(true);
      setError("");

      let p = INFLIGHT.get(cacheKey);
      if (!p) {
        p = fetcherRef.current({ signal: ac.signal });
        INFLIGHT.set(cacheKey, p);
      }
      const res = await p;
      if (ac.signal.aborted) return;
      applyData(res);
    } catch (e) {
      if (e?.name !== "AbortError") setError("Failed to load data");
    } finally {
      if (INFLIGHT.get(cacheKey)) INFLIGHT.delete(cacheKey);
      if (!ac.signal.aborted) setLoadingRaw(false);
    }
  }, [cacheKey, enabled, hasValidCache, keepPreviousData, applyData]);

  useEffect(() => {
    if (!enabled) return;
    const entry = CACHE.get(cacheKey);
    if (entry && Date.now() - entry.ts < ttl) {
      setData(entry.data);
      setLoadingRaw(false);
    } else {
      // No valid cache - show loader before first fetch
      if (!keepPreviousData) setData(undefined);
      setLoadingRaw(true);
    }
    // Backgroud initialization launch
    fetchFresh();
    return () => {
      if (acRef.current) acRef.current.abort();
    };
  }, [cacheKey, ttl, enabled, keepPreviousData, fetchFresh]);

  // Refetch on focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;
    const onFocus = () => fetchFresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [enabled, refetchOnWindowFocus, fetchFresh]);

  // Public manual refetch
  const refetch = useCallback(() => fetchFresh(), [fetchFresh]);

  const loading =
    !hasValidCache && loadingRaw && (data === undefined || !keepPreviousData);

  return {
    data,
    loading,
    error,
    hasValidCache,
    isStale: hasValidCache,
    refetch,
  };
}
