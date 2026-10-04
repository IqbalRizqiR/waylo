import {SESSION_STORAGE_KEY, type AuthUser} from "@waylo/shared";

export type StoredSession = {
  accessToken: string;
  user: AuthUser;
};

function decodeRoleFromToken(token: string): AuthUser["role"] | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as {role?: AuthUser["role"]};
    return payload.role ?? null;
  } catch {
    return null;
  }
}

// Storage only. No React, no fetch. Safe to import from anywhere.
export function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    // Self-heal: ensure stored user role matches actual signed JWT token role
    const tokenRole = decodeRoleFromToken(parsed.accessToken);
    if (tokenRole && parsed.user && parsed.user.role !== tokenRole) {
      parsed.user.role = tokenRole;
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return null;
  }
}

// Snapshot reader for useSyncExternalStore. React compares snapshots with
// Object.is, so this must return the SAME reference while the stored value is
// unchanged, otherwise every render creates a new object and the store loops
// forever. The parsed object is cached against its raw string.
let cachedRaw: string | null = null;
let cachedParsed: StoredSession | null = null;

export function readSessionSnapshot(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedParsed;
  }
  cachedRaw = raw;
  if (!raw) {
    cachedParsed = null;
    return null;
  }
  try {
    cachedParsed = JSON.parse(raw) as StoredSession;
    const tokenRole = decodeRoleFromToken(cachedParsed.accessToken);
    if (tokenRole && cachedParsed.user && cachedParsed.user.role !== tokenRole) {
      cachedParsed.user.role = tokenRole;
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cachedParsed));
    }
  } catch {
    cachedParsed = null;
  }
  return cachedParsed;
}

export function writeSession(session: StoredSession): void {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function authHeaders(): Record<string, string> {
  const session = readSession();
  return session ? {Authorization: `Bearer ${session.accessToken}`} : {};
}
