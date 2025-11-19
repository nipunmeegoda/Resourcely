'use client';

import { Booking } from '@/types/booking';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isToday as checkIsToday, isTomorrow } from 'date-fns';
import { BookingDetailsModal } from './booking-details-modal';
import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DashboardSectionProps {
  title: string;
  bookings: Booking[];
  icon?: React.ReactNode;
}

const statusColors: Record<Booking['status'], string> = {
  'Approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export function DashboardSection({ title, bookings, icon }: DashboardSectionProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map(booking => {
              const start = parseISO(booking.start);
              return (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm line-clamp-1">{booking.title}</h3>
                    <Badge className={statusColors[booking.status]}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(start, 'HH:mm')}
                    </div>
                    <div>{booking.hallName}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No bookings
          </div>
        )}
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
