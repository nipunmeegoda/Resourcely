import { Routes, Route } from "react-router-dom";
import AdminPage from "./app/admin/page.tsx";
import UserPage from "./app/user/page.tsx";
import RoomBookingPage from "./app/booking/page.tsx";
import Navbar from "./components/Navbar.tsx";
function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/booking" element={<RoomBookingPage />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;
