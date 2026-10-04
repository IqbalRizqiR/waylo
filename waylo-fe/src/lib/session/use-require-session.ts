"use client";

import {useEffect} from "react";
import {useRouter} from "@/i18n/navigation";
import {readSession} from "@/lib/session/storage";
import type {Role} from "@waylo/shared";

// Client-side session guard with role authorization.
// 1. If unauthenticated -> redirects to /login.
// 2. If authenticated but role mismatch -> redirects user to their role's dashboard.
export function useRequireSession(allowedRoles?: Role | Role[]) {
  const router = useRouter();
  const session = readSession();

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

    if (allowedRoles) {
      const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const userRole = session.user.role;

      // Admin has access to all roles for moderation; otherwise role must match
      const hasAccess = userRole === "admin" || allowed.includes(userRole);

      if (!hasAccess) {
        const fallbackDestination =
          userRole === "company_member"
            ? "/company/dashboard"
            : userRole === "mentor"
            ? "/mentor/dashboard"
            : "/learner/dashboard";

        router.replace(fallbackDestination);
      }
    }
  }, [session, allowedRoles, router]);

  return session;
}
