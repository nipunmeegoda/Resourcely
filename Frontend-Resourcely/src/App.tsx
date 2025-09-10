import { Routes, Route } from "react-router-dom";
import AdminPage from "./app/admin/page.tsx";
import UserPage from "./app/user/page.tsx";
function App() {

    return (
        <Routes>
            <Route path="/" element={<UserPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
    );

}

export default App
