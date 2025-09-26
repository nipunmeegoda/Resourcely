import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Calendar, Building2, Settings, Users, Clock } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      <div className="p-8 bg-blue-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-4xl font-bold text-blue-900 mb-3">
              Admin Dashboard
            </h1>
            <div className="w-20 h-1 bg-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-blue-700">
              Manage bookings, resources, and system settings
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-3 gap-8 mb-10">
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
                  <Button
                    className="bg-sky-500 hover:bg-sky-600 text-white"
                    onClick={() => navigate("/admin/bookings")}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View All Bookings
                  </Button>
                  <Button
                    variant="outline"
                    className="border-sky-500 text-sky-600 hover:bg-sky-50 bg-transparent"
                    onClick={() => navigate("/admin/bookings")}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Pending Approvals
                  </Button>
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
                  Add, edit, and manage room resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-3">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Building2 className="w-4 h-4 mr-2" />
                    View All Rooms
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Add New Room
                  </Button>
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
                  <Button className="bg-gray-600 hover:bg-gray-700 text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    General Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-500 text-gray-600 hover:bg-gray-50 bg-transparent"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card className="border-blue-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 text-center">
                Quick Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-sky-50 rounded-lg border border-sky-200">
                  <div className="text-3xl font-bold text-sky-600 mb-2">-</div>
                  <div className="text-sm text-gray-600 font-medium">
                    Total Bookings
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">-</div>
                  <div className="text-sm text-gray-600 font-medium">
                    Active Rooms
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    -
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Available Now
                  </div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-3xl font-bold text-amber-600 mb-2">
                    -
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
