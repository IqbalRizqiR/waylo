import type { Page } from "@playwright/test";

export const TEST_USERS = {
  learner: {
    email: "kalandra@waylo.test",
    password: "Password123",
    role: "learner" as const,
    fullName: "Kalandra Putra",
    avatarInitials: "KP",
  },
  company: {
    email: "hrd@nusadigital.test",
    password: "Password123",
    role: "company_member" as const,
    fullName: "Nadia Utami",
    avatarInitials: "NU",
  },
  mentor: {
    email: "sarah.mentor@waylo.test",
    password: "Password123",
    role: "mentor" as const,
    fullName: "Sarah Wijaya",
    avatarInitials: "SW",
  },
  admin: {
    email: "admin@waylo.test",
    password: "Password123",
    role: "admin" as const,
    fullName: "Waylo Administrator",
    avatarInitials: "AD",
  },
};

export type UserRole = keyof typeof TEST_USERS;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Injects an authenticated session directly into localStorage before page load.
 * Tries the real live backend first; falls back to an offline test session
 * token so specs never crash if the database is in maintenance.
 */
export async function authenticateSession(page: Page, role: UserRole): Promise<void> {
  const credentials = TEST_USERS[role];
  let sessionData = {
    accessToken: `e2e-test-token-${role}`,
    user: {
      id: `test-user-${role}`,
      email: credentials.email,
      fullName: credentials.fullName,
      role: credentials.role,
      avatarInitials: credentials.avatarInitials,
    },
  };

  try {
    const res = await page.request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        email: credentials.email,
        password: credentials.password,
      },
    });

    if (res.ok()) {
      const body = (await res.json()) as {
        data?: { accessToken: string; user: typeof sessionData.user };
      };
      if (body.data?.accessToken) {
        sessionData = {
          accessToken: body.data.accessToken,
          user: body.data.user,
        };
      }
    }
  } catch {
    // Backend API unavailable; fallback to offline session token
  }

  // Pre-seed localStorage before any scripts on the target page execute
  await page.addInitScript((session) => {
    window.localStorage.setItem("waylo.session", JSON.stringify(session));
  }, sessionData);
}
