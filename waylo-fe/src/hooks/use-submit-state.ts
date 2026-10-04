"use client";

import {useCallback, useState} from "react";
import {ApiRequestError} from "@/lib/api/client";

// Shared submit-state controller for forms and mutations: tracks pending and
// error, and normalises ApiRequestError into a displayable message.
export function useSubmitState() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(
      action: () => Promise<T>,
      fallbackMessage: string,
    ): Promise<T | null> => {
      setIsPending(true);
      setError(null);
      try {
        return await action();
      } catch (caught) {
        setError(
          caught instanceof ApiRequestError ? caught.message : fallbackMessage,
        );
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return {isPending, error, setError, run};
}
