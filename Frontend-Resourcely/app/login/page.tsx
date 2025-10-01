"use client";

import api from "@/api/api";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card as LoginCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

// Custom imports
import ForgotPassword from "../../components/ForgotPassword";
import FacebookIcon from "@/components/icons/facebook";
import GoogleIcon from "@/components/icons/google";

export default function LoginPage(): JSX.Element {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const validateEmail = (
    email: string
  ): { isValid: boolean; error: string } => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return { isValid: false, error: "Please enter a valid email address." };
    }
    return { isValid: true, error: "" };
  };

  const validatePassword = (
    password: string
  ): { isValid: boolean; error: string } => {
    if (!password || password.length < 6) {
      return {
        isValid: false,
        error: "Password must be at least 6 characters long.",
      };
    }
    return { isValid: true, error: "" };
  };

  const validateInputs = () => {
    const emailInput = document.getElementById(
      "email"
    ) as HTMLInputElement | null;
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement | null;

    const emailValidation = validateEmail(emailInput?.value || "");
    if (!emailValidation.isValid) {
      setEmailError(true);
      setEmailErrorMessage(emailValidation.error);
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    const passwordValidation = validatePassword(passwordInput?.value || "");
    if (!passwordValidation.isValid) {
      setPasswordError(true);
      setPasswordErrorMessage(passwordValidation.error);
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return emailValidation.isValid && passwordValidation.isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateInputs()) return;

    const form = new FormData(event.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const rememberMe = form.get("remember") === "on";

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
        rememberMe,
      });

      const rawText = await response.text();
      let serverData: { user?: { role?: string }; error?: string };
      try {
        serverData = JSON.parse(rawText);
      } catch {
        serverData = { error: rawText };
      }

      if (!response.ok) {
        console.error("Login error:", serverData.error || "Unknown error");
        return;
      }

      console.log("Login successful:", serverData);

      // Normalize role and persist
      const role = String(serverData.user?.role || "").toLowerCase();
      localStorage.setItem(
        "auth",
        JSON.stringify({
          isAuthenticated: true,
          user: { ...serverData.user, role },
        })
      );

      // Decide target based on role
      const nextPath = role === "admin" ? "/admin/" : "/user/";
      console.log("Navigating to:", nextPath);

      // Navigate using Next.js router
      router.push(nextPath);
    } catch (err) {
      console.error("Login request failed:", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-r from-[#021B35] to-[#043456] p-4">
      <LoginCard className="w-full max-w-md bg-[#04263bae] backdrop-blur-sm border-[#07476eae] shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/Resourcely-Logo.svg"
              alt="Resourcely Logo"
              className="w-20 h-20"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-white">
            Sign in
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                required
                className={cn(
                  "bg-transparent border-white/20 text-white placeholder:text-gray-400",
                  "focus:border-white focus:ring-white/20",
                  emailError && "border-red-400 focus:border-red-400"
                )}
              />
              {emailError && (
                <p className="text-red-400 text-xs mt-1">{emailErrorMessage}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="password"
                  className="text-white text-sm font-medium"
                >
                  Password
                </Label>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleClickOpen}
                  className="text-white text-xs p-0 h-auto hover:underline"
                >
                  Forgot your password?
                </Button>
              </div>
              <Input
                id="password"
                name="password"
                placeholder="••••••"
                type="password"
                autoComplete="current-password"
                required
                className={cn(
                  "bg-transparent border-white/20 text-white placeholder:text-gray-400",
                  "focus:border-white focus:ring-white/20",
                  passwordError && "border-red-400 focus:border-red-400"
                )}
              />
              {passwordError && (
                <p className="text-red-400 text-xs mt-1">
                  {passwordErrorMessage}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                name="remember"
                className="border-white/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              />
              <Label
                htmlFor="remember"
                className="text-white text-sm cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            <ForgotPassword open={open} handleClose={handleClose} />

            <Button
              type="submit"
              className="w-full bg-[#f00b0bb9] hover:bg-[#ff0000ff] text-white"
            >
              Sign in
            </Button>

            <p className="text-center text-white text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-300 hover:underline">
                Sign up
              </Link>
            </p>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#04263bae] px-2 text-gray-300">or</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              <GoogleIcon />
              <span className="ml-2">Sign in with Google</span>
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              <FacebookIcon />
              <span className="ml-2">Sign in with Facebook</span>
            </Button>
          </div>
        </CardContent>
      </LoginCard>
    </div>
  );
}
