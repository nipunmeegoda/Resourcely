'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi, usersApi, batchApi, resourcesApi } from '@/api/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedLecturer, setSelectedLecturer] = useState<string | undefined>();
  const [selectedBatch, setSelectedBatch] = useState<string | undefined>();
  const [selectedResource, setSelectedResource] = useState<string | undefined>();
  const [reason, setReason] = useState('');
  const [capacity, setCapacity] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [lecturersRes, batchesRes, resourcesRes] = await Promise.all([
            usersApi.getAllRoleLecturer(),
            batchApi.getAll(),
            resourcesApi.getByBlock(1), // This might need to be more dynamic
          ]);
          setLecturers(lecturersRes.data || []);
          setBatches(batchesRes.data || []);
          setResources(resourcesRes.data || []);
        } catch (error) {
          toast.error('Failed to load data for the booking form.');
          console.error(error);
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedResource || !selectedLecturer || !start || !end) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const bookingRequest = {
        resourceId: Number(selectedResource),
        userId: Number(selectedLecturer),
        bookingAt: start.toISOString(),
        endAt: end.toISOString(),
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Academic Booking</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resource" className="text-right">
                Resource
              </Label>
              <Select onValueChange={setSelectedResource} value={selectedResource}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={String(resource.id)}>
                      {resource.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <DialogFooter>
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
