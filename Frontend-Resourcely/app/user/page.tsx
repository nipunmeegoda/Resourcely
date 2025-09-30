"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Clock,
  BookOpen,
  User,
  RefreshCw,
  Plus,
  Eye,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import ProtectedRoute from "@/app/(auth)/ProtectedRoute";
import { userApi } from "@/api/api";

interface UserStats {
  upcomingBookings: number;
  totalBookings: number;
  availableRooms: number;
  favoriteRooms: number;
}

interface RecentBooking {
  id: string;
  roomName: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
}

const UserPage = () => {
  const [stats, setStats] = useState<UserStats>({
    upcomingBookings: 0,
    totalBookings: 0,
    availableRooms: 0,
    favoriteRooms: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [statsResponse, bookingsResponse] = await Promise.all([
          userApi.getStats(),
          userApi.getRecentBookings(),
        ]);

        setStats(statsResponse.data as UserStats);
        // Transform the API response to match RecentBooking interface
        const transformedBookings = (bookingsResponse.data as any[]).map(
          (booking: any) => ({
            id: booking.id,
            roomName: booking.roomName,
            date: booking.date,
            time: booking.time,
            status: booking.status,
          })
        );
        setRecentBookings(transformedBookings);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load user data:", error);
        // Fallback to simulated data if API fails
        setStats({
          upcomingBookings: 0,
          totalBookings: 0,
          availableRooms: 0,
          favoriteRooms: 0,
        });
        setRecentBookings([]);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [statsResponse, bookingsResponse] = await Promise.all([
        userApi.getStats(),
        userApi.getRecentBookings(),
      ]);

      setStats(statsResponse.data as UserStats);
      // Transform the API response to match RecentBooking interface
      const transformedBookings = (bookingsResponse.data as any[]).map(
        (booking: any) => ({
          id: booking.id,
          roomName: booking.roomName,
          date: booking.date,
          time: booking.time,
          status: booking.status,
        })
      );
      setRecentBookings(transformedBookings);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      <div className="p-4 md:p-8 bg-blue-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
              Welcome Back!
            </h1>
            <div className="w-20 h-1 bg-blue-500 mx-auto mb-4"></div>
            <p className="text-base md:text-lg text-blue-700 mb-2">
              Manage your bookings and discover available spaces
            </p>
            <p className="text-sm text-blue-600 opacity-80">
              Today is{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
            {/* Make a Booking Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-blue-200 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-sky-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  Make a Booking
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Book a room or resource instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-3">
                  <Link href="/user/booking">
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      New Booking
                    </Button>
                  </Link>
                  <Link href="/user/booking/quick">
                    <Button
                      variant="outline"
                      className="border-sky-500 text-sky-600 hover:bg-sky-50 bg-transparent w-full"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Quick Book
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* My Bookings Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-blue-200 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  My Bookings
                </CardTitle>
                <CardDescription className="text-gray-600">
                  View and manage your reservations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-3">
                  <Link href="/user/bookings">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      View All Bookings
                    </Button>
                  </Link>
                  <Link href="/user/bookings/upcoming">
                    <Button
                      variant="outline"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent w-full"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Upcoming
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Browse Rooms Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-blue-200 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  Browse Rooms
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Explore available spaces and facilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-3">
                  <Link href="/user/rooms">
                    <Button className="bg-green-500 hover:bg-green-600 text-white w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Browse All Rooms
                    </Button>
                  </Link>
                  <Link href="/user/rooms/favorites">
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent w-full"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      My Favorites
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Quick Stats */}
            <Card className="border-blue-200 bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl text-gray-900">
                  Your Statistics
                </CardTitle>
                <Button
                  onClick={refreshData}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-sky-50 rounded-lg border border-sky-200 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-sky-600 mb-2">
                      {loading ? (
                        <div className="animate-pulse bg-sky-200 h-8 w-12 mx-auto rounded"></div>
                      ) : (
                        stats.upcomingBookings
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Upcoming
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {loading ? (
                        <div className="animate-pulse bg-blue-200 h-8 w-12 mx-auto rounded"></div>
                      ) : (
                        stats.totalBookings
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Total Bookings
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {loading ? (
                        <div className="animate-pulse bg-green-200 h-8 w-12 mx-auto rounded"></div>
                      ) : (
                        stats.availableRooms
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Available Now
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {loading ? (
                        <div className="animate-pulse bg-purple-200 h-8 w-12 mx-auto rounded"></div>
                      ) : (
                        stats.favoriteRooms
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Favorites
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="border-blue-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">
                  Recent Bookings
                </CardTitle>
                <CardDescription>Your latest room reservations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    // Loading skeletons
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))
                  ) : recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {booking.roomName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.date).toLocaleDateString()} •{" "}
                            {booking.time}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent bookings found</p>
                      <Link href="/user/booking">
                        <Button className="mt-4 bg-blue-500 hover:bg-blue-600">
                          Make Your First Booking
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {recentBookings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link href="/user/bookings">
                      <Button
                        variant="outline"
                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        View All Bookings
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
