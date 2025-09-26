// app/(auth)/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
    children: React.ReactElement;
    roles?: string[];
};

export default function ProtectedRoute({ children, roles }: Props) {
    const location = useLocation();
    const raw = localStorage.getItem("auth");
    const auth = raw ? JSON.parse(raw) : null;

    // not logged in
    if (!auth?.isAuthenticated || !auth?.user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // normalize role checks
    if (roles && roles.length > 0) {
        console.log("ProtectedRoute check:", auth.user.role);
        const userRole = String(auth.user.role || "").toLowerCase();
        const allowed = roles.map(r => r.toLowerCase());

        if (!allowed.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
}
