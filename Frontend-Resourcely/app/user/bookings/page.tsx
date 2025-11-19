'use client';

import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { useHalls } from '@/hooks/useHalls';
import { BookingList } from '@/components/user/booking-list';
import { BookingCalendar } from '@/components/user/booking-calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BookingsPage() {
  const { data: bookings, loading } = useBookings(undefined, { useMock: false });
  const { data: halls } = useHalls({ useMock: false });
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
        <p className="text-muted-foreground">
          Manage lecture hall bookings with filters and calendar view
        </p>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
        <TabsList className="mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <BookingList
            bookings={bookings}
            halls={halls}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <BookingCalendar bookings={bookings} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
