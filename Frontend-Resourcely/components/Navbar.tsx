"use client";

import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LogOut,
  User,
  Calendar,
  Building2,
  Settings,
  BookOpen,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import NavLink from "@/components/NavLink";
import Image from "next/image";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/default-avatar.png",
  });
  const role = (userRole || "").toLowerCase();

  useEffect(() => {
    // Check authentication status and fetch user data from API
    const checkAuthStatus = async () => {
      const authData = localStorage.getItem("auth");

      if (authData) {
        try {
          const parsedAuthData = JSON.parse(authData);

          if (parsedAuthData.isAuthenticated && parsedAuthData.user) {
            const userData = parsedAuthData.user;
            setUserProfile({
              name: userData.username || userData.name || "User",
              email: userData.email,
              avatar: userData.avatar || "/default-avatar.png",
            });
            setUserRole(userData.role || "");
            setIsLoggedIn(true);

            // Optionally verify with backend by making an API call
            // You can add a verify endpoint in your AuthController later
            // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            // const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            //   method: 'GET',
            //   headers: {
            //     'Authorization': `Bearer ${userData.token}`, // if you implement JWT
            //     'Content-Type': 'application/json',
            //   },
            // });

            // if (!response.ok) {
            //   localStorage.removeItem('auth');
            //   setIsLoggedIn(false);
            // }
          } else {
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Failed to parse stored auth data:", error);
          localStorage.removeItem("auth");
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("auth");
    setIsLoggedIn(false);

    // Redirect to home page
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={"/"}>
            <div className="flex items-center gap-2">
              <Image
                src="/Resourcely-Logo.svg"
                alt="Resourcely Logo"
                width={40}
                height={40}
                className="w-10"
              />
              <span className="text-xl font-bold text-foreground">
                Resourcely
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn && role === "admin" ? (
                // Admin Navigation
                <div className="flex flex-row gap-x-6">
                  <NavLink href="/admin/" icon={Settings} label="Dashboard"/>
                  <NavLink href="/admin/resources" icon={Building2} label="Resources"/>
                  <NavLink href="/user/booking" icon={Calendar} label="Bookings"/>
                  <NavLink href="/admin/approval" icon={Clock} label="Approvals"/>
                  <NavLink href="/admin/users" icon={Users} label="Users"/>
                  <NavLink href="/admin/academic" icon={BookOpen} label="Academic"/>
                </div>
            ) : isLoggedIn && role === "user" ? (
                // User Navigation
                <div className="flex flex-row gap-x-6">
                  <NavLink href="/user/" icon={User} label="Dashboard"/>
                  <NavLink href="/user/booking" icon={Calendar} label="Book Room"/>
                  <NavLink href="/user/bookings" icon={BookOpen} label="My Bookings"/>
                  <NavLink href="/user/rooms" icon={MapPin} label="Browse Rooms"/>
                </div>
            ) : (
                // Public/Guest Navigation
                <div className="flex flex-row items-center gap-4">
                  <NavLink href="#about" label="About"/>
                  <NavLink href="#contact" label="Contact"/>
                </div>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* User Avatar */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {userProfile.name}
                  </span>
                </div>
                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {isLoggedIn && userRole === "admin" ? (
                // Admin Mobile Navigation
                  <div className="flex flex-row gap-x-6">
                    <NavLink href="/admin/" icon={Settings} label="Dashboard"/>
                    <NavLink href="/admin/resources" icon={Building2} label="Resources"/>
                    <NavLink href="/user/booking" icon={Calendar} label="Bookings"/>
                    <NavLink href="/admin/approval" icon={Clock} label="Approvals"/>
                    <NavLink href="/admin/users" icon={Users} label="Users"/>
                  </div>
              ) : isLoggedIn && userRole.toLowerCase() === "user" ? (
                  // User Mobile Navigation
                  <div className="flex flex-row gap-x-6">
                    <NavLink href="/user/" icon={User} label="Dashboard"/>
                    <NavLink href="/user/booking" icon={Calendar} label="Book Room"/>
                    <NavLink href="/user/bookings" icon={BookOpen} label="My Bookings"/>
                    <NavLink href="/user/rooms" icon={MapPin} label="Browse Rooms"/>
                  </div>
              ) : (
                  // Public/Guest Mobile Navigation
                  <div className="flex items-center flex-row gap-4">
                    <NavLink href="#about" label="About"/>
                    <NavLink href="#contact" label="Contact"/>
                  </div>
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-2 px-2 py-1">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {userProfile.name}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="w-full">
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
