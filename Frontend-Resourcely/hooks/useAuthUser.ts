"use client";

export function useAuthUser() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("auth");
  const auth = raw ? JSON.parse(raw) : null;

  return auth?.user || null;
}
