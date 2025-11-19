'use client';

import { Booking } from '@/types/booking';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { Mail, Users, Package, FileText, Clock } from 'lucide-react';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

const statusColors: Record<Booking['status'], string> = {
  'Approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  const start = parseISO(booking.start);
  const end = parseISO(booking.end);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{booking.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge className={statusColors[booking.status]}>
              {booking.status}
            </Badge>
          </div>

          <Separator />

          {/* Booking Details */}
          <div className="space-y-3 text-sm">
            {/* Date and Time */}
            <div>
              <div className="flex items-center gap-2 font-medium mb-1">
                <Clock className="w-4 h-4" />
                Date & Time
              </div>
              <div className="ml-6 text-muted-foreground">
                <div>{format(start, 'EEEE, MMMM d, yyyy')}</div>
                <div>{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</div>
              </div>
            </div>

            {/* Hall Information */}
            <div>
              <div className="font-medium mb-1">Hall</div>
              <div className="ml-0 text-muted-foreground">
                <div className="font-medium text-foreground">{booking.hallName}</div>
              </div>
            </div>

            {/* Organizer */}
            <div>
              <div className="flex items-center gap-2 font-medium mb-1">
                <Users className="w-4 h-4" />
                Organizer
              </div>
              <div className="ml-6 text-muted-foreground">
                <div className="font-medium text-foreground">{booking.organizer.name}</div>
                {booking.organizer.email && (
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3 h-3" />
                    {booking.organizer.email}
                  </div>
                )}
              </div>
            </div>

            {/* Attendees */}
            {booking.attendees && (
              <div>
                <div className="flex items-center gap-2 font-medium mb-1">
                  <Users className="w-4 h-4" />
                  Expected Attendees
                </div>
                <div className="ml-6 text-muted-foreground">
                  {booking.attendees}
                </div>
              </div>
            )}

            {/* Equipment */}
            {booking.equipment && booking.equipment.length > 0 && (
              <div>
                <div className="flex items-center gap-2 font-medium mb-1">
                  <Package className="w-4 h-4" />
                  Equipment Required
                </div>
                <div className="ml-6 flex flex-wrap gap-2">
                  {booking.equipment.map(item => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div>
                <div className="flex items-center gap-2 font-medium mb-1">
                  <FileText className="w-4 h-4" />
                  Notes
                </div>
                <div className="ml-6 text-muted-foreground italic">
                  {booking.notes}
                </div>
              </div>
            )}

            {/* Created At */}
            <div className="pt-2 text-xs text-muted-foreground">
              Created on {format(parseISO(booking.createdAt), 'PPP')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
