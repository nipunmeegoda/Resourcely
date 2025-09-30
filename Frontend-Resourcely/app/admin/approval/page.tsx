"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,

  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";


interface PendingBooking {
  id: number;
  userId: string;
  userName: string;
  resourceId: number;
  resourceName: string;
  resourceType: string;
  resourceLocation: string;
  bookingAt: string;
  endAt: string;
  reason: string;
  capacity: number;
  contact: string;
  status: string;
  createdAt: string;
}

export default function BookingApprovalDashboard() {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    bookingId: number | null;
  }>({
    open: false,
    bookingId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");



  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      // Simulate API call with mock data
      const mockData: PendingBooking[] = [
        {
          id: 1,
          userId: "user123",
          userName: "John Doe",
          resourceId: 1,
          resourceName: "Conference Room A",
          resourceType: "Meeting Room",
          resourceLocation: "Building 1, Floor 2",
          bookingAt: new Date().toISOString(),
          endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          reason: "Team meeting for project planning",
          capacity: 8,
          contact: "john.doe@company.com",
          status: "pending",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          userId: "user456",
          userName: "Jane Smith",
          resourceId: 2,
          resourceName: "Projector Room B",
          resourceType: "Equipment Room",
          resourceLocation: "Building 2, Floor 1",
          bookingAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
          reason: "Client presentation",
          capacity: 15,
          contact: "jane.smith@company.com",
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      ];
      setPendingBookings(mockData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (bookingId: number) => {
    try {
      setActionLoading(bookingId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Booking approved successfully!");
      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve booking");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectBooking = async () => {
    if (!rejectDialog.bookingId) return;

    try {
      setActionLoading(rejectDialog.bookingId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Booking rejected successfully!");
      setPendingBookings(prev => prev.filter(booking => booking.id !== rejectDialog.bookingId));
      setRejectDialog({ open: false, bookingId: null });
      setRejectionReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject booking");
      setRejectDialog({ open: false, bookingId: null });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Approval Dashboard</h1>
          <p className="text-gray-600 mt-1">Review and manage pending booking requests</p>
        </div>
        <Button onClick={fetchPendingBookings} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Pending Booking Requests
            <Badge variant="secondary" className="ml-2">
              {pendingBookings.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No pending booking requests at the moment.</p>
              <Button onClick={fetchPendingBookings} variant="outline">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.userName}</div>
                          <div className="text-sm text-gray-500">ID: {booking.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.resourceName}</div>
                          <div className="text-sm text-gray-500">{booking.resourceType}</div>
                          <div className="text-sm text-gray-500">{booking.resourceLocation}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{formatDateTime(booking.bookingAt)}</div>
                          <div className="text-sm text-gray-500">to {formatDateTime(booking.endAt)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] text-sm break-words">
                          {booking.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{booking.capacity} people</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] text-sm break-words">
                          {booking.contact}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(booking.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveBooking(booking.id)}
                            disabled={actionLoading === booking.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {actionLoading === booking.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setRejectDialog({
                                open: true,
                                bookingId: booking.id,
                              })
                            }
                            disabled={actionLoading === booking.id}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => 
        !open && setRejectDialog({ open: false, bookingId: null })
      }>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Booking Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="e.g., Resource not available, insufficient justification, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, bookingId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={rejectBooking}
              disabled={actionLoading !== null}
            >
              {actionLoading !== null ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                "Reject Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


