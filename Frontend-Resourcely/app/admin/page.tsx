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
import { Calendar, Building2, Settings, Users, Clock, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface AdminStats {
  totalBookings: number;
  activeRooms: number;
  availableNow: number;
  pendingApproval: number;
}

const AdminPage = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalBookings: 0,
    activeRooms: 0,
    availableNow: 0,
    pendingApproval: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats - you can replace this with actual API calls
    const loadStats = async () => {
      try {
        // Replace with actual API calls
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();
        
        // Simulated data for now
        setTimeout(() => {
          setStats({
            totalBookings: 127,
            activeRooms: 24,
            availableNow: 18,
            pendingApproval: 5,
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to load stats:', error);
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const refreshStats = () => {
    setLoading(true);
    setTimeout(() => {
      setStats({
        totalBookings: Math.floor(Math.random() * 200) + 50,
        activeRooms: Math.floor(Math.random() * 30) + 15,
        availableNow: Math.floor(Math.random() * 25) + 10,
        pendingApproval: Math.floor(Math.random() * 10) + 1,
      });
      setLoading(false);
    }, 800);
  };
  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      <div className="p-4 md:p-8 bg-blue-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
              Admin Dashboard
            </h1>
            <div className="w-20 h-1 bg-blue-500 mx-auto mb-4"></div>
            <p className="text-base md:text-lg text-blue-700 mb-2">
              Manage bookings, resources, and system settings
            </p>
            <p className="text-sm text-blue-600 opacity-80">
              Welcome back! Today is {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
            {/* Manage Bookings Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-blue-200 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-sky-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  Manage Bookings
                </CardTitle>
                <CardDescription className="text-gray-600">
                  View and manage all room bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-3">
                  <Link href="/admin/bookings">
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      View All Bookings
                    </Button>
                  </Link>
                  <Link href="/admin/approvals">
                    <Button
                      variant="outline"
                      className="border-sky-500 text-sky-600 hover:bg-sky-50 bg-transparent w-full"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Pending Approvals
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Manage Resources Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-blue-200 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  Manage Resources
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Add, edit, and manage hierarchical resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-3">
                  <Link href="/admin/resources">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white w-full">
                      <Building2 className="w-4 h-4 mr-2" />
                      Resource Management
                    </Button>
                  </Link>
                  <Link href="/admin/resources/view">
                    <Button
                      variant="outline"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent w-full"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      View All Resources
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* System Settings Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-blue-200 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  System Settings
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Configure system preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-3">
                  <Link href="/admin/settings">
                    <Button className="bg-gray-600 hover:bg-gray-700 text-white w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      General Settings
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button
                      variant="outline"
                      className="border-gray-500 text-gray-600 hover:bg-gray-50 bg-transparent w-full"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      User Management
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card className="border-blue-200 bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl text-gray-900">
                Quick Statistics
              </CardTitle>
              <Button
                onClick={refreshStats}
                variant="outline"
                size="sm"
                disabled={loading}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-sky-50 rounded-lg border border-sky-200 hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-sky-600 mb-2">
                    {loading ? (
                      <div className="animate-pulse bg-sky-200 h-8 w-12 mx-auto rounded"></div>
                    ) : (
                      stats.totalBookings
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Total Bookings
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {loading ? (
                      <div className="animate-pulse bg-blue-200 h-8 w-12 mx-auto rounded"></div>
                    ) : (
                      stats.activeRooms
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Active Rooms
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {loading ? (
                      <div className="animate-pulse bg-green-200 h-8 w-12 mx-auto rounded"></div>
                    ) : (
                      stats.availableNow
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Available Now
                  </div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200 hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-amber-600 mb-2">
                    {loading ? (
                      <div className="animate-pulse bg-amber-200 h-8 w-12 mx-auto rounded"></div>
                    ) : (
                      stats.pendingApproval
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Pending Approval
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
