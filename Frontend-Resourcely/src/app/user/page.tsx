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
import { Calendar, Users, Mail, MapPin, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const UserPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // For demo purposes, using a hardcoded user ID. In a real app, this would come from authentication
  const userId = "1";

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error("Failed to fetch user bookings");
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Approved
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg font-medium text-gray-600">
              Loading your bookings...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-black">My Bookings</h1>
          <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
          <p className="text-lg text-gray-700">
            View the status of your resource booking requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {bookings.filter((b) => b.status === "Pending").length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter((b) => b.status === "Approved").length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {bookings.filter((b) => b.status === "Rejected").length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* New Booking Button */}
        <div className="text-center">
          <Button
            onClick={() => navigate("/booking")}
            className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 text-lg"
          >
            Make New Booking
          </Button>
        </div>

        {/* Bookings List */}
        <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
          <CardHeader className="pb-4 border-b border-sky-100">
            <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              Your Booking History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg font-medium mb-2">No bookings yet</div>
                <div className="text-sm mb-4">
                  Start by making your first booking request
                </div>
                <Button
                  onClick={() => navigate("/booking")}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  Make Your First Booking
                </Button>
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Booking Info */}
                      <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(booking.status)}
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

                      {/* Reason & Status */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                            <FileText className="w-4 h-4" />
                            Purpose
                          </div>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {booking.reason}
                          </p>
                        </div>

                        <div className="text-sm text-gray-500">
                          Requested: {formatDate(booking.createdAt)}
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

export default UserPage;
