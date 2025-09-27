import { Routes, Route } from "react-router-dom";
import AdminPage from "./app/admin/page.tsx";
import UserPage from "./app/user/page.tsx";

import BookingFormPage from "./app/bookingForm/page.tsx";
import BookingPage from "./app/booking/page.tsx";
//import Navbar from "./components/Navbar.tsx";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <div>
       
      <Routes>
        <Route path="/" element={<UserPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/bookingForm" element={<BookingFormPage />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;
