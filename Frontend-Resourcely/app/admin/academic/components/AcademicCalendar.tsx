'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { adminApi } from '@/api/api';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [date, setDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchBookings();
    } finally {
      setRefreshing(false);
    }
  };

  const CustomToolbar: React.FC<any> = (toolbar) => {
    const goToBack = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');
    const goToToday = () => toolbar.onNavigate('TODAY');
    const setView = (v: string) => toolbar.onView(v);

    return (
      <div className="rbc-toolbar flex items-center justify-between mb-2">
        <div className="rbc-btn-group flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="!bg-transparent !border-orange-500 !text-orange-600 hover:!bg-orange-50"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToBack}
            className="!bg-transparent !border-orange-500 !text-orange-600 hover:!bg-orange-50"
          >
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="!bg-transparent !border-orange-500 !text-orange-600 hover:!bg-orange-50"
          >
            Next
          </Button>
        </div>
        <span className="rbc-toolbar-label font-medium">{toolbar.label}</span>
        <div className="rbc-btn-group flex items-center gap-2">
          <Button
            variant={toolbar.view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
            className={toolbar.view === 'month' ? '!bg-orange-500 hover:!bg-orange-600 !text-white' : '!bg-transparent !border-orange-500 !text-orange-600 hover:!bg-orange-50'}
          >
            Month
          </Button>
          <Button
            variant={toolbar.view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
            className={toolbar.view === 'week' ? '!bg-orange-500 hover:!bg-orange-600 !text-white' : '!bg-transparent !border-orange-500 !text-orange-600 hover:!bg-orange-50'}
          >
            Week
          </Button>
          <Button
            variant={toolbar.view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
            className={toolbar.view === 'day' ? '!bg-orange-500 hover:!bg-orange-600 !text-white' : '!bg-transparent !border-orange-500 !text-orange-600 hover:!bg-orange-50'}
          >
            Day
          </Button>
          <Button
            variant={toolbar.view === 'agenda' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('agenda')}
            className={toolbar.view === 'agenda' ? '!bg-orange-500 hover:!bg-orange-600 !text-white' : '!bg-transparent !border-orange-500 !text-orange-600 hover:!bg-orange-50'}
          >
            Agenda
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh"
            aria-label="Refresh"
            className="!bg-transparent !border-orange-500 !text-orange-600 hover:!bg-orange-50"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };

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
        components={{ toolbar: CustomToolbar }}
        style={{ height: '100%' }}
        selectable
        onSelectSlot={handleSelectSlot}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
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
