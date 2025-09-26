import { useState } from "react";
import Navbar from "./Navbar";
import BookingForm from "./BookingForm";
import BookingList from "./BookingList";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

// Test component to demonstrate role-based permissions
const RoleTestPage = () => {
  const [currentRole, setCurrentRole] = useState<
    "Student" | "Teacher" | "Admin"
  >("Student");
  const [userId] = useState(1); // Mock user ID
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBookingCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "Admin":
        return "Can book all resource types (Regular, Lab, Special)";
      case "Teacher":
        return "Can book Regular and Lab resources";
      case "Student":
        return "Can only book Regular resources";
      default:
        return "Can only book Regular resources";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Teacher":
        return "bg-green-100 text-green-800 border-green-200";
      case "Student":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Role Selector */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Role-Based Permissions Test</CardTitle>
              <CardDescription>
                Switch between different user roles to test resource booking
                permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-medium">Current Role:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm border ${getRoleColor(
                    currentRole
                  )}`}
                >
                  {currentRole}
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                {(["Student", "Teacher", "Admin"] as const).map((role) => (
                  <Button
                    key={role}
                    variant={currentRole === role ? "default" : "outline"}
                    onClick={() => setCurrentRole(role)}
                    size="sm"
                  >
                    {role}
                  </Button>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
                <strong>{currentRole}:</strong>{" "}
                {getRoleDescription(currentRole)}
              </div>
            </CardContent>
          </Card>

          {/* Header */}
          <div className="text-center mb-10 bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-4xl font-bold text-blue-900 mb-3">
              Resource Booking - {currentRole} View
            </h1>
            <div className="w-20 h-1 bg-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-blue-700">
              Testing permissions for {currentRole} role
            </p>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <div>
              <BookingForm
                userId={userId}
                userRole={currentRole}
                onBookingCreated={handleBookingCreated}
              />
            </div>

            {/* Booking List */}
            <div>
              <BookingList
                userId={userId}
                userRole={currentRole}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>

          {/* Permission Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Permission Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-bold text-blue-800 mb-2">Student</div>
                  <div className="text-sm text-gray-600">
                    • Regular resources only
                    <br />
                    • Basic room bookings
                    <br />• Limited access
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-bold text-green-800 mb-2">Teacher</div>
                  <div className="text-sm text-gray-600">
                    • Regular + Lab resources
                    <br />
                    • Equipment access
                    <br />• Extended permissions
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="font-bold text-purple-800 mb-2">Admin</div>
                  <div className="text-sm text-gray-600">
                    • All resource types
                    <br />
                    • Special rooms access
                    <br />• Full permissions
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

export default RoleTestPage;
