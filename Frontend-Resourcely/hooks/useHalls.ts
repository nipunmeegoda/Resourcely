import { useEffect, useState } from 'react';
import { Hall } from '@/types/booking';
import { fetchHalls } from '@/lib/api';

interface UseHallsOptions {
  useMock?: boolean;
}

export function useHalls(options?: UseHallsOptions) {
  const [data, setData] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchHalls({ useMock: options?.useMock ?? false });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    })();
  }, [options?.useMock]);

  return { data, loading, error };
}
