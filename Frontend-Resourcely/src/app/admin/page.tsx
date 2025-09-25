"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";

interface Booking {
  id: number;
  userId?: string;
  location: string;
  bookingAt: string;
  reason: string;
  capacity: number;
  contact: string;
  createdAt: string;
  status: "Pending" | "Approved" | "Rejected";
}

const AdminPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings/pending");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error("Failed to fetch pending bookings");
      }
    } catch (error) {
      console.error("Error fetching pending bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (
    bookingId: number,
    action: "approve" | "reject"
  ) => {
    try {
      setActionLoading(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // Remove the booking from the pending list
        setBookings((prev) =>
          prev.filter((booking) => booking.id !== bookingId)
        );
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${action} booking`);
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`Failed to ${action} booking. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatBookingDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg font-medium text-gray-600">
              Loading pending bookings...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-black">Admin Dashboard</h1>
          <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
          <p className="text-lg text-gray-700">
            Manage resource booking requests
          </p>
        </div>

        {/* Stats Card */}
        <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600">
                  {bookings.length}
                </div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Bookings */}
        <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
          <CardHeader className="pb-4 border-b border-sky-100">
            <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              Pending Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg font-medium mb-2">
                  No pending requests
                </div>
                <div className="text-sm">
                  All booking requests have been processed
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {bookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className={`p-6 border-b border-sky-50 hover:bg-sky-25 transition-colors ${
                      index === bookings.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Booking Info */}
                      <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Pending
                          </Badge>
                          <span className="text-sm text-gray-500">
                            ID: {booking.id}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-sky-500" />
                            <span className="font-medium text-black">
                              {booking.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-sky-500" />
                            <span className="text-gray-700">
                              {formatBookingDate(booking.bookingAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-sky-500" />
                            <span className="text-gray-700">
                              {booking.capacity} people
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-sky-500" />
                            <span className="text-gray-700">
                              {booking.contact}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                          <FileText className="w-4 h-4" />
                          Purpose
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {booking.reason}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="space-y-3">
                        <div className="text-sm text-gray-500">
                          Requested: {formatDate(booking.createdAt)}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() =>
                              handleApproval(booking.id, "approve")
                            }
                            disabled={actionLoading === booking.id}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {actionLoading === booking.id
                              ? "Processing..."
                              : "Approve"}
                          </Button>

                          <Button
                            onClick={() => handleApproval(booking.id, "reject")}
                            disabled={actionLoading === booking.id}
                            variant="destructive"
                            className="flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            {actionLoading === booking.id
                              ? "Processing..."
                              : "Reject"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
