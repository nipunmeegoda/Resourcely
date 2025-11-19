"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
  roles?: string[];
  onUserLoaded?: (userId: number) => void; // optional callback
};

export default function ProtectedRoute({ children, roles, onUserLoaded }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("auth");
    const auth = raw ? JSON.parse(raw) : null;

    // Not logged in → redirect to login
    if (!auth?.isAuthenticated || !auth?.user) {
      router.replace(`/login?from=${pathname}`);
      return;
    }

    // ⭐ Get current logged-in user ID
    const userId = auth.user.id;

    // Allow passing the user ID upward if needed
    if (onUserLoaded) onUserLoaded(userId);

    // Role-based access check
    if (roles && roles.length > 0) {
      const userRole = String(auth.user.role || "").toLowerCase();
      const allowed = roles.map((r) => r.toLowerCase());

      if (!allowed.includes(userRole)) {
        router.replace("/");
        return;
      }
    }

    setAuthorized(true);
  }, [router, pathname, roles, onUserLoaded]);

  if (!authorized) return null;

  return <>{children}</>;
}
