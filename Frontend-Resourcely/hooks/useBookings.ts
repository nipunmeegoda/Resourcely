import { useEffect, useState } from 'react';
import { Booking, BookingFilters } from '@/types/booking';
import { fetchBookings } from '@/lib/api';

interface UseBookingsOptions {
  useMock?: boolean;
}

export function useBookings(filters?: BookingFilters, options?: UseBookingsOptions) {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchBookings(filters, { useMock: options?.useMock ?? false });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, options?.useMock]);

  return { data, loading, error };
}
