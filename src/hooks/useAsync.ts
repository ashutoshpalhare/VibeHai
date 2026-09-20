import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
  setData: (updater: (prev: T | undefined) => T | undefined) => void;
}

/**
 * Small data-fetching hook with race-condition protection, skeleton-friendly
 * `loading` and an escape hatch for retries.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
  options: { enabled?: boolean; keepPrevious?: boolean } = {},
): AsyncState<T> {
  const { enabled = true, keepPrevious = false } = options;
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [nonce, setNonce] = useState(0);
  const requestId = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setError(undefined);
    fnRef
      .current()
      .then((result) => {
        if (id !== requestId.current) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (id !== requestId.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
        if (!keepPrevious) setData(undefined);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, enabled]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data,
    loading,
    error,
    refetch,
    setData: (updater) => setData((prev) => updater(prev)),
  };
}

export function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
