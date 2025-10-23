"use client";

import * as React from "react";
import { adminApi } from "@/api/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type EditableBooking = {
  id: number;
  resourceId: number;
  bookingAt: string; // ISO
  endAt: string; // ISO
  reason: string;
  capacity: number;
  contact: string;
};

type Props = {
  booking: EditableBooking;
  trigger?: React.ReactNode;
  onUpdated?: (updated: EditableBooking) => void;
};

function toLocalDateTimeParts(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export default function EditBookingDialog({ booking, trigger, onUpdated }: Props) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const start = toLocalDateTimeParts(booking.bookingAt);
  const end = toLocalDateTimeParts(booking.endAt);

  const [date, setDate] = React.useState<string>(start.date);
  const [time, setTime] = React.useState<string>(start.time);
  const [endTime, setEndTime] = React.useState<string>(end.time);
  const [reason, setReason] = React.useState<string>(booking.reason);
  const [capacity, setCapacity] = React.useState<number>(booking.capacity);
  const [contact, setContact] = React.useState<string>(booking.contact);

  const reset = () => {
    setDate(start.date);
    setTime(start.time);
    setEndTime(end.time);
    setReason(booking.reason);
    setCapacity(booking.capacity);
    setContact(booking.contact);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !endTime || !reason.trim() || !contact.trim() || capacity <= 0) {
      toast.error("All fields are required and capacity must be positive.");
      return;
    }
    // Quick end-after-start check
    const startMs = new Date(`${date}T${time}:00`).getTime();
    const endMs = new Date(`${date}T${endTime}:00`).getTime();
    if (!(endMs > startMs)) {
      toast.error("End time must be after start time.");
      return;
    }

    setSaving(true);
    try {
      const res = await adminApi.updateBooking(booking.id, {
        date,
        time,
        endTime,
        reason: reason.trim(),
        capacity,
        contact: contact.trim(),
      });
      const updated = res.data as any;
      toast.success("Booking updated");
      setOpen(false);
      onUpdated?.({
        id: updated.id,
        resourceId: updated.resourceId,
        bookingAt: updated.bookingAt,
        endAt: updated.endAt,
        reason: updated.reason,
        capacity: updated.capacity,
        contact: updated.contact,
      });
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to update booking";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Edit</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={saving} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time">Start Time *</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={saving} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end">End Time *</Label>
            <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={saving} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason *</Label>
            <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} disabled={saving} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="capacity">Capacity *</Label>
            <Input id="capacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} disabled={saving} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact">Contact *</Label>
            <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} disabled={saving} required />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
