"use client";

import {useCallback, useSyncExternalStore} from "react";
import {apiFetch} from "@/lib/api/client";
import {
  clearSession,
  readSession,
  readSessionSnapshot,
  type StoredSession,
} from "@/lib/session/storage";

// The session lives in localStorage (an external store). useSyncExternalStore
// gives React a stable server snapshot (null) and a cached client snapshot, so
// there is no hydration mismatch, no setState-in-effect, and no render loop.
// The snapshot must be reference-stable, which readSessionSnapshot guarantees.

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// Module-level constant so its identity is stable across renders, as React
// requires for getServerSnapshot.
const getServerSnapshot = (): StoredSession | null => null;

function emitChange(): void {
  for (const listener of listeners) listener();
}

// Called by auth flows after writeSession/clearSession so every subscribed
// component re-reads the snapshot.
export function notifySessionChange(): void {
  emitChange();
}

export function useSession(): {session: StoredSession | null} {
  const session = useSyncExternalStore(
    subscribe,
    readSessionSnapshot,
    getServerSnapshot,
  );
  return {session};
}

export function useLogout(): () => void {
  return useCallback(() => {
    const current = readSession();
    void apiFetch("/auth/logout", {
      method: "POST",
      headers: current ? {Authorization: `Bearer ${current.accessToken}`} : {},
    }).catch(() => undefined);
    clearSession();
    notifySessionChange();
  }, []);
}
