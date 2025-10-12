"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {  ArrowRight, } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthAndRedirect = () => {
      const authData = localStorage.getItem("auth");

      if (authData) {
        try {
          const parsedAuthData = JSON.parse(authData);

          if (parsedAuthData.isAuthenticated && parsedAuthData.user) {
            const userRole = parsedAuthData.user.role?.toLowerCase();

            // Redirect based on role
            if (userRole === "admin") {
              router.push("/admin/");
            } else if (userRole === "user") {
              router.push("/user/");
            }
          }
        } catch (error) {
          console.error("Failed to parse auth data:", error);
          // If auth data is corrupted, clear it
          localStorage.removeItem("auth");
        }
      }
    };

    checkAuthAndRedirect();
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center gap-2 mb-8">
            <Image
              src="/Resourcely-Logo.svg"
              alt="Resourcely Logo"
              width={120}
              height={120}
              className="w-30 h-30"
            />
            <span className="text-3xl font-bold tracking-tight text-foreground">
              Resourcely
            </span>
          </div>

          <Badge
            variant="secondary"
            className="mb-6 px-4 py-1.5 text-sm font-medium"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
            Trusted by 500+ organizations
          </Badge>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-balance mb-6 text-foreground">
            Effortless room booking for modern organizations
          </h1>

          <p className="text-lg lg:text-xl text-muted-foreground text-balance mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform how your organization manages meeting rooms and shared
            spaces. Book instantly, reduce conflicts, and maximize resource
            utilization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={"/signup"}>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base"
              >
                Sign Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={"/login"}>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base bg-transparent"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
