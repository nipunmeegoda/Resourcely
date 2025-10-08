"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";


interface UserBooking {
  id: number;
  resourceName: string;
  resourceType: string;
  location: string;
  startTime: string;
  endTime: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

const UserBookingStatus: React.FC = () => {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      // This would get bookings for the currently logged-in user
      const response = await fetch("/api/bookings/user"); // Assuming user context from auth

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: {
        variant: "secondary" as const,
        icon: <Clock className="w-3 h-3 mr-1" />,
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      },
      Approved: {
        variant: "default" as const,
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      Rejected: {
        variant: "destructive" as const,
        icon: <XCircle className="w-3 h-3 mr-1" />,
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.icon}
        {status}
      </Badge>
    );
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const formatDate = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleDateString();
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (booking: UserBooking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const getBookingStats = () => {
    const stats = bookings.reduce(
      (acc, booking) => {
        const status = booking.status.toLowerCase() as keyof typeof acc;
        if (status in acc && status !== "total") {
          acc[status]++;
        }
        acc.total++;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, total: 0 }
    );
    return stats;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = getBookingStats();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Booking Status</h1>
        <p className="text-muted-foreground">
          Track the status of your resource bookings
        </p>
      </div>

      {error && (
        <Alert className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Booking Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>
            View and manage your resource booking requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No bookings found. Start by booking a resource to see your
                status here.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.resourceName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.resourceType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatDate(booking.startTime)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(booking.startTime)} -{" "}
                            {formatTime(booking.endTime)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{booking.location}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(booking.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(booking)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View detailed information about your booking request
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Resource Information</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedBooking.resourceName}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {selectedBooking.resourceType}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {selectedBooking.location}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Booking Schedule</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {formatDate(selectedBooking.startTime)}
                  </p>
                  <p>
                    <span className="font-medium">Start Time:</span>{" "}
                    {formatTime(selectedBooking.startTime)}
                  </p>
                  <p>
                    <span className="font-medium">End Time:</span>{" "}
                    {formatTime(selectedBooking.endTime)}
                  </p>
                  <p>
                    <span className="font-medium">Requested:</span>{" "}
                    {formatDateTime(selectedBooking.createdAt)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Status Information</h4>
                <div className="space-y-2">
                  {getStatusBadge(selectedBooking.status)}

                  {selectedBooking.status === "Approved" &&
                    selectedBooking.approvedBy && (
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Approved by:</span>{" "}
                          {selectedBooking.approvedBy}
                        </p>
                        {selectedBooking.approvedAt && (
                          <p>
                            <span className="font-medium">Approved at:</span>{" "}
                            {formatDateTime(selectedBooking.approvedAt)}
                          </p>
                        )}
                      </div>
                    )}

                  {selectedBooking.status === "Rejected" &&
                    selectedBooking.rejectionReason && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">
                          Rejection Reason:
                        </p>
                        <p className="text-sm">
                          {selectedBooking.rejectionReason}
                        </p>
                      </div>
                    )}

                  {selectedBooking.status === "Pending" && (
                    <p className="text-sm text-muted-foreground">
                      Your booking request is waiting for admin approval. You
                      will be notified once a decision is made.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserBookingStatus;
