import { useState } from "react";
import Navbar from "../../components/Navbar";
import BookingForm from "../../components/BookingForm";
import BookingList from "../../components/BookingList";

const UserPage = () => {
  // In a real app, you'd get this from authentication context
  // For now, using mock data - replace with actual auth implementation
  const [user] = useState({
    id: 1,
    role: "Student", // This would come from your auth system
    username: "Student User",
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBookingCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-4xl font-bold text-blue-900 mb-3">
              Welcome, {user.username}
            </h1>
            <div className="w-20 h-1 bg-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-blue-700">
              Role: {user.role} - You can book:{" "}
              {user.role === "Admin"
                ? "All resources (Regular, Lab, Special)"
                : user.role === "Teacher"
                ? "Regular and Lab resources"
                : "Regular resources only"}
            </p>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <div>
              <BookingForm
                userId={user.id}
                userRole={user.role}
                onBookingCreated={handleBookingCreated}
              />
            </div>

            {/* Booking List */}
            <div>
              <BookingList
                userId={user.id}
                userRole={user.role}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
