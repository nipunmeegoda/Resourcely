import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  MessageSquare,
  Check,
  X,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";

interface Booking {
  id: number;
  userId: string;
  location: string;
  bookingAt: string;
  reason: string;
  capacity: number;
  contact: string;
  createdAt: string;
  status?: "Pending" | "Approved" | "Rejected";
  approvedByAdminId?: string;
  approvedAt?: string;
  adminNote?: string;
}

const AdminBookingsDashboard = () => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const navigate = useNavigate();

  // Fetch bookings based on filter
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoint =
        filter === "all"
          ? "/api/bookings"
          : filter === "pending"
          ? "/api/bookings/pending"
          : `/api/bookings?status=${filter}`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        if (filter === "pending") {
          setPendingBookings(data);
        } else {
          setAllBookings(data);
        }
      } else {
        console.error(
          "Failed to fetch bookings:",
          response.status,
          response.statusText
        );
        alert("Failed to fetch bookings. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [filter, fetchBookings]);

  const handleApprovalAction = async (
    bookingId: number,
    isApproved: boolean,
    adminNote: string = ""
  ) => {
    setProcessingIds((prev) => new Set(prev).add(bookingId));

    try {
      const response = await fetch("/api/bookings/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          isApproved,
          adminId: "admin1", // This should come from actual auth context
          adminNote:
            adminNote || (isApproved ? "Booking approved" : "Booking rejected"),
        }),
      });

      if (response.ok) {
        // Show success notification
        alert(`Booking ${isApproved ? "approved" : "rejected"} successfully!`);

        // Refresh the bookings list
        fetchBookings();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to process booking"}`);
      }
    } catch (error) {
      console.error("Error processing booking:", error);
      alert("An error occurred while processing the booking");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "Approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            Unknown
          </Badge>
        );
    }
  };

  const currentBookings = filter === "pending" ? pendingBookings : allBookings;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Booking Management
              </h1>
              <p className="text-gray-600">
                Review and manage resource booking requests
              </p>
            </div>
          </div>
          <Button
            onClick={fetchBookings}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: "pending", label: "Pending", count: pendingBookings.length },
            { key: "all", label: "All Bookings", count: allBookings.length },
            { key: "approved", label: "Approved", count: 0 },
            { key: "rejected", label: "Rejected", count: 0 },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? "default" : "outline"}
              onClick={() =>
                setFilter(
                  tab.key as "all" | "pending" | "approved" | "rejected"
                )
              }
              className={`${
                filter === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {tab.key === "pending" && pendingBookings.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {pendingBookings.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading bookings...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && currentBookings.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {filter} bookings found
              </h3>
              <p className="text-gray-600">
                {filter === "pending"
                  ? "All bookings have been reviewed"
                  : `No ${filter} bookings to display`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bookings Grid */}
        {!isLoading && currentBookings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentBookings.map((booking) => (
              <Card
                key={booking.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      {booking.location}
                    </CardTitle>
                    {booking.status && getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{formatDate(booking.bookingAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{formatTime(booking.bookingAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{booking.capacity} people</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      User ID: {booking.userId}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Reason:
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {booking.reason}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <p>
                        <strong>Contact:</strong> {booking.contact}
                      </p>
                      <p>
                        <strong>Requested:</strong>{" "}
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons for Pending Bookings */}
                  {(!booking.status || booking.status === "Pending") && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleApprovalAction(booking.id, true)}
                        disabled={processingIds.has(booking.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {processingIds.has(booking.id)
                          ? "Processing..."
                          : "Approve"}
                      </Button>
                      <Button
                        onClick={() => handleApprovalAction(booking.id, false)}
                        disabled={processingIds.has(booking.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {processingIds.has(booking.id)
                          ? "Processing..."
                          : "Reject"}
                      </Button>
                    </div>
                  )}

                  {/* Admin Note for Processed Bookings */}
                  {booking.adminNote && (
                    <div className="text-xs bg-gray-100 p-2 rounded">
                      <strong>Admin Note:</strong> {booking.adminNote}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsDashboard;
