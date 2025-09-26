// App.tsx
import { Routes, Route } from "react-router-dom";
import AdminPage from "./app/admin/page.tsx";
import BookingFormPage from "./app/user/(main)/bookingForm/page.tsx";
import BookingPage from "./app/user/(main)/booking/page.tsx";
import LoginPage from "./app/(auth)/LoginPage.tsx";
import SignUp from "./app/(auth)/SignUp.tsx";
import HomePage from "./app/home/homePage.tsx";
import ProtectedRoute from "./app/(auth)/ProtectedRoute.tsx";
import UserPage from "./app/user/page.tsx";

export default function App() {
  return (
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Role-based access */}
          <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
          />
          <Route
              path="/booking"
              element={
                <ProtectedRoute roles={["User", "Admin"]}>
                  <BookingPage />
                </ProtectedRoute>
              }
          />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute roles={["User"]}>
                        <UserPage />
                    </ProtectedRoute>
                }
            />
          <Route
              path="/bookingForm"
              element={
                <ProtectedRoute roles={["User", "Admin"]}>
                  <BookingFormPage />
                </ProtectedRoute>
              }
          />

          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
  );
}
