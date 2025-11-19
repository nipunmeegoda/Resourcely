'use client';

import { useState, useMemo } from 'react';
import { Booking, BookingFilters, BookingStatus } from '@/types/booking';
import { BookingCard } from './booking-card';
import { BookingDetailsModal } from './booking-details-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface Hall {
  id: string;
  name: string;
  capacity?: number;
  location?: string;
}

interface BookingListProps {
  bookings: Booking[];
  halls: Hall[];
  loading?: boolean;
  onFilterChange?: (filters: BookingFilters) => void;
}

const statuses: BookingStatus[] = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

export function BookingList({ bookings, halls, loading = false, onFilterChange }: BookingListProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filters, setFilters] = useState<BookingFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.organizer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHall = !filters.hallId || booking.hallId === filters.hallId;
      const matchesStatus = !filters.status || booking.status === filters.status;
      return matchesSearch && matchesHall && matchesStatus;
    });
  }, [bookings, searchTerm, filters]);

  const handleFilterChange = (key: keyof BookingFilters, value: string | BookingStatus | undefined) => {
    const newFilters = { ...filters, [key]: value };
    if (!value) delete newFilters[key];
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select
            value={filters.hallId || 'all'}
            onValueChange={(value) => handleFilterChange('hallId', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Halls" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Halls</SelectItem>
              {halls.map(hall => (
                <SelectItem key={hall.id} value={hall.id}>
                  {hall.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : (value as BookingStatus))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filters.hallId || filters.status || searchTerm) && (
            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="text-sm text-muted-foreground">
          Showing {filtered.length} of {bookings.length} bookings
        </div>

        {/* List */}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length > 0 ? (
            filtered.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => setSelectedBooking(booking)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No bookings found
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </>
  );
}
