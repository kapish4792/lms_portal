"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import type { MockUser } from "@/lib/mock/users";

const emptySubscribe = () => () => {};

// Section 3.3.B: dedicated per-role login — a user who isn't authenticated, or
// whose session role doesn't match the route's role segment, is bounced back
// to the login screen rather than shown someone else's dashboard.
export function useRoleGuard(routeRole: string): MockUser | null {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser) {
      router.replace("/auth/login");
      return;
    }

    const matches =
      currentUser.role === routeRole ||
      (routeRole === "admin" && (currentUser.role === "org-admin" || currentUser.role === "super-admin" || currentUser.role === "lms-admin"));

    if (!matches) {
      // Authenticated user on wrong role segment -> guide to their correct dashboard
      router.replace(`/${currentUser.role}/dashboard`);
    }
  }, [currentUser, routeRole, router, hasHydrated]);

  if (!hasHydrated || !currentUser) return null;
  return currentUser;
}
