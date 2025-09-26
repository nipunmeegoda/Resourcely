import React, { useState, useEffect } from "react";
import { getBookings, deleteBooking } from "../services/booking";
import type { Booking } from "../types/booking";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Calendar, MapPin, Clock, Trash2 } from "lucide-react";

interface BookingListProps {
  userId: number;
  userRole: string;
  refreshTrigger?: number;
}

const BookingList: React.FC<BookingListProps> = ({
  userId,
  userRole,
  refreshTrigger,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings(userId);
      setBookings(data);
      setError("");
    } catch (err: any) {
      setError("Failed to fetch bookings");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userId, refreshTrigger]);

  const handleDelete = async (bookingId: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete booking");
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getResourceTypeColor = (resourceType: string) => {
    switch (resourceType?.toLowerCase()) {
      case "lab":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "special":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading bookings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bookings</CardTitle>
        <CardDescription>
          Showing bookings visible to {userRole} users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No bookings found. Create your first booking above.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const { date, time } = formatDateTime(booking.bookingAt);
              const isPast = new Date(booking.bookingAt) < new Date();

              return (
                <div
                  key={booking.id}
                  className={`border rounded-lg p-4 ${
                    isPast ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-lg">
                        {booking.location}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${getResourceTypeColor(
                          booking.resourceType
                        )}`}
                      >
                        {booking.resourceType}
                      </span>
                    </div>
                    {!isPast && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(booking.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{time}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="mb-2">
                      <span className="font-medium">Reason:</span>{" "}
                      {booking.reason}
                    </div>
                    <div className="flex justify-between">
                      <span>
                        <span className="font-medium">Capacity:</span>{" "}
                        {booking.capacity}
                      </span>
                      <span>
                        <span className="font-medium">Contact:</span>{" "}
                        {booking.contact}
                      </span>
                    </div>
                  </div>

                  {isPast && (
                    <div className="mt-2 text-xs text-gray-500">
                      This booking has ended
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingList;
