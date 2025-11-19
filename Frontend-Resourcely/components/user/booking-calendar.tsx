'use client';

import { useState, useMemo } from 'react';
import { Booking } from '@/types/booking';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, getDaysInMonth, startOfMonth, addDays, parseISO, isSameDay, isAfter, isBefore } from 'date-fns';
import { BookingDetailsModal } from './booking-details-modal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingCalendarProps {
  bookings: Booking[];
}

const statusColors: Record<Booking['status'], string> = {
  'Approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const monthStart = startOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfWeek = monthStart.getDay();

  const days = useMemo(() => {
    const result: (Date | null)[] = Array(firstDayOfWeek).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    return result;
  }, [currentDate, daysInMonth, firstDayOfWeek]);

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.start);
      return isSameDay(bookingDate, date);
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <>
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-muted rounded-md"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-muted rounded-md"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="p-2" />;
            }

            const dayBookings = getBookingsForDate(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-24 p-2 border rounded-md ${
                  isToday ? 'bg-accent/50 border-primary' : 'border-border'
                }`}
              >
                <div className={`text-xs font-semibold mb-1 ${
                  isToday ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayBookings.slice(0, 2).map(booking => (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="cursor-pointer"
                    >
                      <Badge
                        className={`text-xs truncate w-full justify-start ${statusColors[booking.status]}`}
                        variant="secondary"
                      >
                        {booking.title}
                      </Badge>
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </>
  );
}
