// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/SignUp";
import "./index.css"; // or App.css if you prefer

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />

      </Routes>
    </Router>
  </React.StrictMode>
);
