// app/(auth)/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
  roles?: string[];
};

export default function ProtectedRoute({ children, roles }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("auth");
    const auth = raw ? JSON.parse(raw) : null;

    // Not logged in → go to login
    if (!auth?.isAuthenticated || !auth?.user) {
      router.replace(`/login?from=${pathname}`);
      return;
    }

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
  }, [router, pathname, roles]);

  if (!authorized) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
