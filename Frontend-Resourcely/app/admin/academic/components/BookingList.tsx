
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { adminApi, bookingsApi } from "@/api/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pencil, Trash2, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type ApprovedBooking = {
  id: number;
  userId: number;
  resourceName: string;
  resourceLocation: string;
  bookingAt: string;
  endAt: string;
  reason: string;
  capacity: number;
};

type SortOrder = "desc" | "asc";

// Function to parse the resource location string
const parseLocation = (location: string) => {
  const parts = location.split(" > ");
  return {
    building: parts[0] || "N/A",
    floor: parts[1] || "N/A",
    block: parts[2] || "N/A",
  };
};

// Function to format dates and times
const formatDate = (dateTimeString: string) => new Date(dateTimeString).toLocaleDateString();
const formatTime = (dateTimeString:string) => new Date(dateTimeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function BookingList() {
  const [bookings, setBookings] = useState<ApprovedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Record<number, boolean>>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getApprovedBookings();
      setBookings(res.data || []);
    } catch (error) {
      console.error("Failed to load approved bookings:", error);
      toast.error("Failed to load approved bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const dateA = new Date(a.bookingAt).getTime();
      const dateB = new Date(b.bookingAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [bookings, sortOrder]);

  const handleDelete = async (bookingId: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    setDeleting((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await bookingsApi.remove(bookingId);
      toast.success("Booking deleted successfully.");
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (error: any) {
      console.error("Failed to delete booking:", error);
      const errorMessage = error?.response?.data?.message || "Failed to delete booking.";
      toast.error(errorMessage);
    } finally {
      setDeleting((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleEdit = (bookingId: number) => {
    toast.info(`Edit functionality for booking ID ${bookingId} is not yet implemented.`);
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            All Approved Bookings
        </CardTitle>
        <div className="flex items-center gap-2">
            <Select value={sortOrder} onValueChange={(v: SortOrder) => setSortOrder(v)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by date" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadBookings} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBookings.length > 0 ? (
                sortedBookings.map((booking) => {
                  const location = parseLocation(booking.resourceLocation);
                  const isBusy = deleting[booking.id];
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>User {booking.userId}</TableCell>
                      <TableCell>{location.building}</TableCell>
                      <TableCell>{location.floor}</TableCell>
                      <TableCell>{location.block}</TableCell>
                      <TableCell>{formatDate(booking.bookingAt)}</TableCell>
                      <TableCell>{formatTime(booking.bookingAt)}</TableCell>
                      <TableCell>{formatTime(booking.endAt)}</TableCell>
                      <TableCell>{booking.reason}</TableCell>
                      <TableCell>{booking.capacity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(booking.id)}
                            disabled={isBusy}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(booking.id)}
                            disabled={isBusy}
                            className="text-red-600 hover:text-red-700"
                          >
                            {isBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center h-24">
                    No approved bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
