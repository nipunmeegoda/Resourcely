"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/about",
    "/contact",
    "/pricing",
    "/features"
  ];

  useEffect(() => {
    const checkAuthentication = () => {
      // If it's a public route, allow access
      if (publicRoutes.includes(pathname)) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // For protected routes, check authentication
      const authData = localStorage.getItem("auth");
      
      if (!authData) {
        // Not authenticated, redirect to login
        router.replace(`/login?from=${pathname}`);
        return;
      }

      try {
        const parsedAuthData = JSON.parse(authData);
        
        if (!parsedAuthData.isAuthenticated || !parsedAuthData.user) {
          // Invalid auth data, redirect to login
          localStorage.removeItem("auth");
          router.replace(`/login?from=${pathname}`);
          return;
        }

        // Check role-based access
        const userRole = parsedAuthData.user.role?.toLowerCase();
        
        // Admin routes - only admin can access
        if (pathname.startsWith("/admin")) {
          if (userRole !== "admin") {
            router.replace("/user/"); // Redirect non-admin to user dashboard
            return;
          }
        }
        
        // User routes - only authenticated users can access
        if (pathname.startsWith("/user")) {
          if (userRole !== "user" && userRole !== "admin") {
            router.replace("/login");
            return;
          }
        }

        // User is authenticated and authorized
        setIsAuthorized(true);
        
      } catch (error) {
        console.error("Failed to parse auth data:", error);
        localStorage.removeItem("auth");
        router.replace(`/login?from=${pathname}`);
        return;
      }
      
      setIsChecking(false);
    };

    checkAuthentication();
  }, [pathname, router]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}