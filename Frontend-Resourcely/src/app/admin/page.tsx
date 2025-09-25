"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../../components/ToastProvider";

interface Booking {
  bookingID: number;
  createdBy: number;
  createdByName: string;
  locationID: number;
  locationName: string;
  locationDetails: string;
  startsAt: string;
  endsAt: string;
  status: "pending" | "approved" | "rejected";
  purpose: string;
  createdAt: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedDateTime?: string;
}

const ResourceManagerPage: React.FC = () => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { addToast } = useToast();

  // Mock resource manager ID - in real app, this would come from authentication
  const resourceManagerId = 1;

  // Fetch pending bookings
  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5130/api/bookings/pending"
      );
      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();
      const pending = data.filter(
        (booking: Booking) => booking.status === "pending"
      );
      setPendingBookings(pending);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      addToast({ type: "error", message: "Failed to fetch pending bookings" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  // Handle approve/reject booking
  const handleBookingAction = async (
    bookingId: number,
    action: "approved" | "rejected"
  ) => {
    try {
      setActionLoading(bookingId);

      const response = await fetch(
        `http://localhost:5130/api/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: action,
            approvedBy: resourceManagerId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} booking`);
      }

      // Remove the booking from pending list
      setPendingBookings((prev) =>
        prev.filter((booking) => booking.bookingID !== bookingId)
      );

      // Close dialog if this booking was selected
      if (selectedBooking?.bookingID === bookingId) {
        setSelectedBooking(null);
      }

      addToast({
        type: "success",
        message: `Booking ${action} successfully!`,
      });
    } catch (error) {
      console.error(`Error ${action} booking:`, error);
      addToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : `Failed to ${action} booking`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge style
  const getStatusBadgeStyle = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Resource Manager Dashboard
          </h1>
          <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
          <p className="text-lg text-gray-700">
            Review and manage pending booking requests for resources
          </p>
        </div>

        {/* Stats Card */}
        <Card className="border border-sky-200 shadow-lg shadow-sky-100/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl font-semibold text-gray-900">
                Pending Requests
              </span>
              <Button
                onClick={fetchPendingBookings}
                variant="outline"
                size="sm"
                disabled={loading}
                className="border-sky-200 hover:bg-sky-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-sky-600">
                {pendingBookings.length}
              </div>
              <div className="text-gray-600">
                {pendingBookings.length === 1
                  ? "booking request"
                  : "booking requests"}{" "}
                awaiting approval
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="border border-sky-200 shadow-lg shadow-sky-100/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
                <span className="ml-3 text-gray-600">Loading bookings...</span>
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-600">
                  No pending booking requests at the moment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        ID
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Location
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Date & Time
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Requested By
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Details
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBookings.map((booking) => (
                      <tr
                        key={booking.bookingID}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-2 text-gray-900 font-medium">
                          #{booking.bookingID}
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-sky-500" />
                            <span className="text-gray-900">
                              {booking.locationName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-gray-900">
                              <Calendar className="w-4 h-4 text-sky-500" />
                              <span className="text-sm">
                                {formatDate(booking.startsAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4 text-sky-500" />
                              <span className="text-sm">
                                {formatTime(booking.startsAt)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-sky-500" />
                            <span className="text-gray-900">
                              {booking.createdByName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-gray-900">
                          {booking.locationDetails}
                        </td>
                        <td className="py-4 px-2">
                          <Badge
                            className={`border ${getStatusBadgeStyle(
                              booking.status
                            )}`}
                          >
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">
                              {booking.status}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setSelectedBooking(booking)}
                              variant="outline"
                              size="sm"
                              className="border-sky-200 hover:bg-sky-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() =>
                                handleBookingAction(
                                  booking.bookingID,
                                  "approved"
                                )
                              }
                              disabled={actionLoading === booking.bookingID}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              {actionLoading === booking.bookingID ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() =>
                                handleBookingAction(
                                  booking.bookingID,
                                  "rejected"
                                )
                              }
                              disabled={actionLoading === booking.bookingID}
                              variant="destructive"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              {actionLoading === booking.bookingID ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <Dialog
            open={!!selectedBooking}
            onOpenChange={() => setSelectedBooking(null)}
          >
            <DialogContent className="sm:max-w-lg bg-white border border-sky-200 shadow-xl">
              <DialogHeader className="border-b border-sky-100 pb-4">
                <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-500" />
                  Booking Request #{selectedBooking.bookingID}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-lg border border-sky-200">
                      <MapPin className="w-4 h-4 text-sky-500" />
                      <span className="text-gray-900">
                        {selectedBooking.locationName}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Date</h4>
                      <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-lg border border-sky-200">
                        <Calendar className="w-4 h-4 text-sky-500" />
                        <span className="text-gray-900">
                          {formatDate(selectedBooking.startsAt)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Time</h4>
                      <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-lg border border-sky-200">
                        <Clock className="w-4 h-4 text-sky-500" />
                        <span className="text-gray-900">
                          {formatTime(selectedBooking.startsAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">
                        Requested By
                      </h4>
                      <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-lg border border-sky-200">
                        <Users className="w-4 h-4 text-sky-500" />
                        <span className="text-gray-900">
                          {selectedBooking.createdByName}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">End Time</h4>
                      <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-lg border border-sky-200">
                        <Clock className="w-4 h-4 text-sky-500" />
                        <span className="text-gray-900">
                          {formatTime(selectedBooking.endsAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Purpose</h4>
                    <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                      <p className="text-gray-900">
                        {selectedBooking.purpose || "No purpose specified"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Request Details
                    </h4>
                    <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-sm text-gray-600">
                      <p>
                        Submitted: {formatDate(selectedBooking.createdAt)} at{" "}
                        {formatTime(selectedBooking.createdAt)}
                      </p>
                      <p>User ID: {selectedBooking.createdBy}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-sky-100">
                  <Button
                    onClick={() =>
                      handleBookingAction(selectedBooking.bookingID, "approved")
                    }
                    disabled={actionLoading === selectedBooking.bookingID}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    {actionLoading === selectedBooking.bookingID ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve Booking
                  </Button>
                  <Button
                    onClick={() =>
                      handleBookingAction(selectedBooking.bookingID, "rejected")
                    }
                    disabled={actionLoading === selectedBooking.bookingID}
                    variant="destructive"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    {actionLoading === selectedBooking.bookingID ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Reject Booking
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ResourceManagerPage;
