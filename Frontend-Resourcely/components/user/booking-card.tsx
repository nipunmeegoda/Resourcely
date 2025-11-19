'use client';

import { Booking } from '@/types/booking';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Users, MapPin, Package } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  onClick?: () => void;
}

const statusColors: Record<Booking['status'], string> = {
  'Approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const start = parseISO(booking.start);
  const end = parseISO(booking.end);

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header with title and status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm flex-1 line-clamp-2">{booking.title}</h3>
          <Badge className={statusColors[booking.status]}>
            {booking.status}
          </Badge>
        </div>

        {/* Time and location */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {booking.hallName}
          </div>
        </div>

        {/* Organizer */}
        <div className="text-xs">
          <span className="text-muted-foreground">Organizer: </span>
          <span className="font-medium">{booking.organizer.name}</span>
        </div>

        {/* Attendees and equipment */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {booking.attendees && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {booking.attendees}
            </div>
          )}
          {booking.equipment && booking.equipment.length > 0 && (
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {booking.equipment.length} items
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
