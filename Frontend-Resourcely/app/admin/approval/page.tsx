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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Phone,
  AlertCircle,
  Shield,
  FileText,
  ClockIcon,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { adminApi, type Booking } from "@/api/api";

// Using the existing Booking interface from API

interface BookingCounts {
  pending: number;
  approved: number;
  rejected: number;
}

export default function BookingApprovalDashboard() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [approvedBookings, setApprovedBookings] = useState<Booking[]>([]);
  const [rejectedBookings, setRejectedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [bookingCounts, setBookingCounts] = useState<BookingCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    bookingId: number | null;
  }>({
    open: false,
    bookingId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pendingResponse, approvedResponse, rejectedResponse] =
        await Promise.all([
          adminApi.getPendingBookings(),
          adminApi.getApprovedBookings(),
          adminApi.getRejectedBookings(),
        ]);

      setPendingBookings(pendingResponse.data);
      setApprovedBookings(approvedResponse.data);
      setRejectedBookings(rejectedResponse.data);

      setBookingCounts({
        pending: pendingResponse.data.length,
        approved: approvedResponse.data.length,
        rejected: rejectedResponse.data.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch bookings";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (bookingId: number) => {
    try {
      setActionLoading(bookingId);

      await adminApi.approveBooking(bookingId);

      toast.success("Booking approved successfully!");
      setPendingBookings((prev) =>
        prev.filter((booking) => booking.id !== bookingId)
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to approve booking"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const rejectBooking = async () => {
    if (!rejectDialog.bookingId || !rejectionReason.trim()) return;

    try {
      setActionLoading(rejectDialog.bookingId);

      await adminApi.rejectBooking(rejectDialog.bookingId, rejectionReason);

      toast.success("Booking rejected successfully!");
      setPendingBookings((prev) =>
        prev.filter((booking) => booking.id !== rejectDialog.bookingId)
      );
      setRejectDialog({ open: false, bookingId: null });
      setRejectionReason("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reject booking"
      );
      setRejectDialog({ open: false, bookingId: null });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-black">
              Booking Approvals
            </h1>
            <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
          </div>
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-sky-500 mx-auto" />
              <p className="text-gray-600">Loading booking requests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-black text-balance">
            Booking Approvals
          </h1>
          <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Review and manage pending booking requests
          </p>
        </div>

        {/* Stats and Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-100 rounded-lg">
                    <Shield className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Requests
                    </p>
                    <p className="text-2xl font-bold text-black">
                      {pendingBookings.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={fetchAllBookings}
            variant="outline"
            className="border-sky-200 hover:border-sky-400 hover:bg-sky-50 text-sky-600 hover:text-sky-700 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Main Content - Tabbed Interface */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-sky-200 shadow-lg shadow-sky-100/50">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-800 data-[state=active]:border-sky-400 text-gray-600 hover:text-sky-700"
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-400 text-gray-600 hover:text-green-700"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Approved ({approvedBookings.length})
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800 data-[state=active]:border-red-400 text-gray-600 hover:text-red-700"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Rejected ({rejectedBookings.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Bookings Tab */}
          <TabsContent value="pending" className="mt-6">
            {error ? (
              <Card className="border border-red-200 shadow-lg shadow-red-100/50 bg-white">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-700 mb-2">
                    Error Loading Bookings
                  </h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button
                    onClick={fetchAllBookings}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : pendingBookings.length === 0 ? (
              <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No pending booking requests at the moment.
                  </p>
                  <Button
                    onClick={fetchAllBookings}
                    variant="outline"
                    className="border-sky-200 hover:border-sky-400 hover:bg-sky-50 text-sky-600 hover:text-sky-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white"
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Booking Info */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-sky-500" />
                                {booking.resourceName}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {booking.resourceLocation}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-800 border-amber-200"
                            >
                              Pending Review
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-sky-500" />
                              <span className="font-medium">User ID:</span>
                              <span className="text-gray-600">
                                {booking.userId}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-sky-500" />
                              <span className="font-medium">Date & Time:</span>
                              <span className="text-gray-600">
                                {formatDateTime(booking.bookingAt)} -{" "}
                                {formatDateTime(booking.endAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-sky-500" />
                              <span className="font-medium">
                                Expected Attendees:
                              </span>
                              <span className="text-gray-600">
                                {booking.capacity} people
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-sky-500" />
                              <span className="font-medium">Contact:</span>
                              <span className="text-gray-600">
                                {booking.contact}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Purpose */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-black flex items-center gap-2">
                            <FileText className="h-4 w-4 text-sky-500" />
                            Purpose
                          </h4>
                          <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {booking.reason}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                          <h4 className="font-medium text-black">Actions</h4>
                          <div className="space-y-2">
                            <Button
                              onClick={() => approveBooking(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              {actionLoading === booking.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                setRejectDialog({
                                  open: true,
                                  bookingId: booking.id,
                                })
                              }
                              disabled={actionLoading === booking.id}
                              className="w-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>

                          <div className="text-xs text-gray-500 pt-2 border-t border-sky-100">
                            Submitted: {formatDateTime(booking.createdAt)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Approved Bookings Tab */}
          <TabsContent value="approved" className="mt-6">
            {approvedBookings.length === 0 ? (
              <Card className="border border-green-200 shadow-lg shadow-green-100/50 bg-white">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ThumbsUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">
                    No Approved Bookings
                  </h3>
                  <p className="text-gray-600">
                    No approved booking requests yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="border border-green-200 shadow-lg shadow-green-100/50 bg-white"
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Booking Info */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-500" />
                                {booking.resourceName}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {booking.resourceLocation}
                              </p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              ✓ Approved
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-green-500" />
                              <span className="font-medium">User ID:</span>
                              <span className="text-gray-600">
                                {booking.userId}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-green-500" />
                              <span className="font-medium">Date & Time:</span>
                              <span className="text-gray-600">
                                {formatDateTime(booking.bookingAt)} -{" "}
                                {formatDateTime(booking.endAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-green-500" />
                              <span className="font-medium">
                                Expected Attendees:
                              </span>
                              <span className="text-gray-600">
                                {booking.capacity} people
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Purpose & Status */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-black flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-500" />
                            Purpose
                          </h4>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {booking.reason}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 pt-2 border-t border-green-100">
                            Approved:{" "}
                            {formatDateTime(
                              booking.updatedAt || booking.createdAt
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rejected Bookings Tab */}
          <TabsContent value="rejected" className="mt-6">
            {rejectedBookings.length === 0 ? (
              <Card className="border border-red-200 shadow-lg shadow-red-100/50 bg-white">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ThumbsDown className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">
                    No Rejected Bookings
                  </h3>
                  <p className="text-gray-600">
                    No rejected booking requests yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rejectedBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="border border-red-200 shadow-lg shadow-red-100/50 bg-white"
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Booking Info */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-red-500" />
                                {booking.resourceName}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {booking.resourceLocation}
                              </p>
                            </div>
                            <Badge
                              variant="destructive"
                              className="bg-red-100 text-red-800 border-red-200"
                            >
                              ✗ Rejected
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-red-500" />
                              <span className="font-medium">User ID:</span>
                              <span className="text-gray-600">
                                {booking.userId}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-red-500" />
                              <span className="font-medium">Date & Time:</span>
                              <span className="text-gray-600">
                                {formatDateTime(booking.bookingAt)} -{" "}
                                {formatDateTime(booking.endAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Purpose & Rejection Reason */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-black flex items-center gap-2">
                            <FileText className="h-4 w-4 text-red-500" />
                            Original Purpose
                          </h4>
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {booking.reason}
                            </p>
                          </div>

                          {booking.rejectionReason && (
                            <>
                              <h4 className="font-medium text-black flex items-center gap-2 mt-4">
                                <XCircle className="h-4 w-4 text-red-500" />
                                Rejection Reason
                              </h4>
                              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-sm text-red-700 leading-relaxed">
                                  {booking.rejectionReason}
                                </p>
                              </div>
                            </>
                          )}

                          <div className="text-xs text-gray-500 pt-2 border-t border-red-100">
                            Rejected:{" "}
                            {formatDateTime(
                              booking.updatedAt || booking.createdAt
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Rejection Dialog */}
        <Dialog
          open={rejectDialog.open}
          onOpenChange={(open) =>
            !open && setRejectDialog({ open: false, bookingId: null })
          }
        >
          <DialogContent className="sm:max-w-md bg-white border border-sky-200 shadow-xl">
            <DialogHeader className="border-b border-sky-100 pb-4">
              <DialogTitle className="text-xl font-semibold text-black flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Reject Booking Request
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Please provide a reason for rejecting this booking request. This
                will be sent to the user.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                <Label
                  htmlFor="rejection-reason"
                  className="text-sm font-medium text-black"
                >
                  Rejection Reason *
                </Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="e.g., Resource not available, conflicting schedule, insufficient justification..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 resize-none"
                />
              </div>
            </div>
            <DialogFooter className="pt-6 border-t border-sky-100">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialog({ open: false, bookingId: null });
                  setRejectionReason("");
                }}
                className="border-sky-200 hover:border-sky-400 hover:bg-sky-50 text-sky-600 hover:text-sky-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={rejectBooking}
                disabled={actionLoading !== null || !rejectionReason.trim()}
                className="shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {actionLoading !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Booking
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
