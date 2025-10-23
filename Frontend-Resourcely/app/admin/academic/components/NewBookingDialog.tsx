'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi, usersApi, batchApi, type Resource } from '@/api/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import CascadingResourceSelector from '@/components/CascadingResourceSelector';

interface NewBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (newBooking: any) => void;
  start: Date;
  end: Date;
}

export const NewBookingDialog: React.FC<NewBookingDialogProps> = ({ isOpen, onClose, onBookingCreated, start, end }) => {
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedLecturer, setSelectedLecturer] = useState<string | undefined>();
  const [selectedBatch, setSelectedBatch] = useState<string | undefined>();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [reason, setReason] = useState('');
  const [capacity, setCapacity] = useState<number>(0);

  // Replace datetime-local with separate date and time controls
  const pad = (n: number) => String(n).padStart(2, '0');
  const toParts = (d: Date) => ({
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  });
  const startParts = toParts(start);
  const endParts = toParts(end);

  const [date, setDate] = useState<string>(startParts.date);
  const [time, setTime] = useState<string>(startParts.time);
  const [endTime, setEndTime] = useState<string>(endParts.time);

  useEffect(() => {
    // when dialog opens or slot changes, reset date/time inputs
    if (isOpen) {
      const s = toParts(start);
      const e = toParts(end);
      setDate(s.date);
      setTime(s.time);
      setEndTime(e.time);
    }
  }, [isOpen, start, end]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [lecturersRes, batchesRes] = await Promise.all([
            usersApi.getAllRoleLecturer(),
            batchApi.getAll(),
          ]);
          setLecturers(lecturersRes.data || []);
          setBatches(batchesRes.data || []);
        } catch (error) {
          toast.error('Failed to load data for the booking form.');
          console.error(error);
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [isOpen]);

  const handleResourceSelect = (resource: Resource | null) => {
    setSelectedResource(resource);
  };

  const handleSubmit = async () => {
    if (!selectedResource || !selectedLecturer) {
      toast.error('Please fill in resource and lecturer.');
      return;
    }
    if (!date || !time || !endTime) {
      toast.error('Please select date, start time and end time.');
      return;
    }

    const startDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(`${date}T${endTime}:00`);
    if (!(endDate.getTime() > startDate.getTime())) {
      toast.error('End time must be after start time.');
      return;
    }

    setIsLoading(true);
    try {
      const bookingRequest = {
        resourceId: selectedResource.id,
        userId: Number(selectedLecturer),
        bookingAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        reason: reason || 'Academic Booking',
        capacity: capacity || 0,
        contact: 'Admin',
      };

      const res = await adminApi.createApprovedBooking(bookingRequest as any);
      toast.success('Booking created successfully!');
      onBookingCreated(res.data);
      onClose();
    } catch (error) {
      toast.error('Failed to create booking.');
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle>Create New Academic Booking</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="resource" className="text-left">
                  Resource
                </Label>
                <CascadingResourceSelector onResourceSelect={handleResourceSelect} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lecturer" className="text-right">
                  Lecturer
                </Label>
                <Select onValueChange={setSelectedLecturer} value={selectedLecturer}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map((lecturer) => (
                      <SelectItem key={lecturer.id} value={String(lecturer.id)}>
                        {lecturer.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="batch" className="text-right">
                  Batch
                </Label>
                <Select onValueChange={setSelectedBatch} value={selectedBatch}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a batch (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={String(batch.id)}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Date and Time fields replacing datetime-local */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">Start Time</Label>
                <Input id="startTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">End Time</Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Reason
                </Label>
                <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Capacity
                </Label>
                <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="col-span-3" />
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
