"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,

  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import GoogleIcon from "@/components/icons/google";
import FacebookIcon from "@/components/icons/facebook";

interface FormData {
  name: string;
  email: string;
  password: string;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateName = (name: string): { isValid: boolean; error: string } => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { isValid: false, error: "Name is required." };
    }

    if (trimmedName.length < 2) {
      return {
        isValid: false,
        error: "Name must be at least 2 characters long.",
      };
    }

    if (trimmedName.length > 50) {
      return { isValid: false, error: "Name cannot exceed 50 characters." };
    }

    if (/\s{2,}/.test(name)) {
      return {
        isValid: false,
        error: "Name cannot contain multiple spaces in a row.",
      };
    }

    if (/^\s|\s$/.test(name)) {
      return {
        isValid: false,
        error: "Name cannot have leading or trailing spaces.",
      };
    }

    if (/[0-9]/.test(trimmedName)) {
      return { isValid: false, error: "Name cannot contain numbers." };
    }

    // Check for emoji and other non-printable characters
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    if (emojiRegex.test(trimmedName)) {
      return {
        isValid: false,
        error: "Name cannot contain emojis or special symbols.",
      };
    }

    return { isValid: true, error: "" };
  };

  const validateEmail = (
    email: string
  ): { isValid: boolean; error: string } => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return { isValid: false, error: "Email is required." };
    }

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return {
        isValid: false,
        error: "Please enter a valid email address (e.g., user@example.com).",
      };
    }

    // Check for multiple @ symbols or consecutive dots
    if ((trimmedEmail.match(/@/g) || []).length > 1) {
      return {
        isValid: false,
        error: "Email cannot contain multiple @ symbols.",
      };
    }

    if (trimmedEmail.includes("..")) {
      return {
        isValid: false,
        error: "Email cannot contain consecutive dots.",
      };
    }

    // Check length (typical max is 254 chars for the entire address)
    if (trimmedEmail.length > 254) {
      return {
        isValid: false,
        error: "Email is too long (max 254 characters).",
      };
    }

    // Check domain part
    const domainPart = trimmedEmail.split("@")[1];
    if (domainPart.length < 2 || !domainPart.includes(".")) {
      return { isValid: false, error: "Please enter a valid domain name." };
    }

    return { isValid: true, error: "" };
  };

  const validatePassword = (
    password: string,
    email: string,
    name: string
  ): { isValid: boolean; error: string } => {
    if (!password) {
      return { isValid: false, error: "Password is required." };
    }

    // Check length - updated to 6 characters to match test expectations
    if (password.length < 6) {
      return {
        isValid: false,
        error: "Password must be at least 6 characters.",
      };
    }

    if (password.length > 128) {
      return {
        isValid: false,
        error: "Password cannot exceed 128 characters.",
      };
    }

    // Check complexity
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase) {
      return {
        isValid: false,
        error: "Password must contain at least one uppercase letter.",
      };
    }

    if (!hasLowercase) {
      return {
        isValid: false,
        error: "Password must contain at least one lowercase letter.",
      };
    }

    if (!hasNumber) {
      return {
        isValid: false,
        error: "Password must contain at least one number.",
      };
    }

    if (!hasSpecialChar) {
      return {
        isValid: false,
        error:
          "Password must contain at least one special character (!@#$%^&*).",
      };
    }

    // Check for personal info in password
    const emailUsername = email ? email.split("@")[0] : "";
    if (
      emailUsername &&
      password.toLowerCase().includes(emailUsername.toLowerCase())
    ) {
      return {
        isValid: false,
        error: "Password cannot contain your email address.",
      };
    }

    if (name) {
      const nameParts = name.toLowerCase().split(/\s+/);
      for (const part of nameParts) {
        if (part.length > 2 && password.toLowerCase().includes(part)) {
          return {
            isValid: false,
            error: "Password cannot contain your name.",
          };
        }
      }
    }

    return { isValid: true, error: "" };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (name === "name") {
      setNameError(false);
      setNameErrorMessage("");
    } else if (name === "email") {
      setEmailError(false);
      setEmailErrorMessage("");
    } else if (name === "password") {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }
  };

  const validateInputs = (): boolean => {
    let isValid = true;

    // Validate name
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      setNameError(true);
      setNameErrorMessage(nameValidation.error);
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setEmailError(true);
      setEmailErrorMessage(emailValidation.error);
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    // Validate password
    const passwordValidation = validatePassword(
      formData.password,
      formData.email,
      formData.name
    );

    if (!passwordValidation.isValid) {
      setPasswordError(true);
      setPasswordErrorMessage(passwordValidation.error);
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    //for backend forntend
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.name, // assuming "name" field is used as username
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result || "Registration failed.");
        return;
      }

      toast.success("Registration successful! You can now log in.");
      // Optionally redirect to login page
      // window.location.href = '/login';
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-r from-[#021B35] to-[#043456] p-4">
      <Card className="w-full max-w-md bg-[#04263bae] backdrop-blur-sm border border-[#07476eae] shadow-[0_4px_30px_rgba(0,0,0,0.38)] scale-90 transform-gpu">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center items-center">
            <img
              src="/Resourcely-Logo.svg"
              alt="Resourcely Logo"
              className="w-[90px] h-[90px]"
            />
          </div>

          <CardTitle className="text-4xl font-bold text-center text-white">
            Sign up
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Janidu Pabasara"
                autoComplete="name"
                required
                className="bg-transparent border-white/20 text-white placeholder:text-white/60 focus:border-white"
              />
              {nameError && (
                <p className="text-xs text-red-400 mt-1">{nameErrorMessage}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="janidu@example.com"
                autoComplete="email"
                required
                className="bg-transparent border-white/20 text-white placeholder:text-white/60 focus:border-white"
              />
              {emailError && (
                <p className="text-xs text-red-400 mt-1">{emailErrorMessage}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className="bg-transparent border-white/20 text-white placeholder:text-white/60 focus:border-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/60 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-400 mt-1">
                  {passwordErrorMessage}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#f00b0bb9] hover:bg-[#ff0000ff] text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </Button>

            <p className="text-center text-white text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white underline hover:no-underline"
              >
                Sign in
              </Link>
            </p>
          </form>

          <div className="relative my-6">
            <Separator className="bg-white/20" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#04263bae] px-2 text-white text-sm">
              or
            </span>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <GoogleIcon />
              Sign up with Google
            </Button>
            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <FacebookIcon />
              Sign up with Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
