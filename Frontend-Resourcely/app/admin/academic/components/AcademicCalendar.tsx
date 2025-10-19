'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { adminApi } from '@/api/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { NewBookingDialog } from './NewBookingDialog';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './AcademicCalendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface MyEvent {
  id: number;
  title: string;
  resource: string;
  start: Date;
  end: Date;
}

const AcademicCalendar: React.FC = () => {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [slotInfo, setSlotInfo] = useState<{ start: Date; end: Date } | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await adminApi.getApprovedBookings();
      const bookings = response.data.map((booking: any) => ({
        id: booking.id,
        title: `${booking.reason} (${booking.resourceName})`,
        start: new Date(booking.bookingAt),
        end: new Date(booking.endAt),
        resource: booking.resourceName,
      }));
      setEvents(bookings);
    } catch (error) {
      toast.error('Failed to load bookings.');
      console.error(error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBookings().finally(() => setLoading(false));
  }, [fetchBookings]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSlotInfo({ start, end });
    setIsDialogOpen(true);
  };

  const handleBookingCreated = (newBooking: any) => {
    const newEvent: MyEvent = {
      id: newBooking.id,
      title: `${newBooking.reason} (${newBooking.resource?.name || 'N/A'})`,
      start: new Date(newBooking.bookingAt),
      end: new Date(newBooking.endAt),
      resource: newBooking.resource?.name || 'N/A',
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Calendar...</span>
      </div>
    );
  }

  return (
    <div className="h-[70vh] p-4 bg-card rounded-lg">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        selectable
        onSelectSlot={handleSelectSlot}
      />
      {slotInfo && (
        <NewBookingDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onBookingCreated={handleBookingCreated}
          start={slotInfo.start}
          end={slotInfo.end}
        />
      )}
    </div>
  );
};

export default AcademicCalendar;
