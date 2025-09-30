"use client";

import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthGuard>
      <Navbar />
      {children}
    </AuthGuard>
  );
}