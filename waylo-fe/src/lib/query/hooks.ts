"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {apiFetch} from "@/lib/api/client";
import {authHeaders} from "@/lib/session/storage";

// A read that always carries the current session's bearer token.
export function useApiQuery<T>(
  queryKey: readonly unknown[],
  path: string,
  options?: Partial<UseQueryOptions<T>>,
) {
  return useQuery<T>({
    queryKey,
    queryFn: () => apiFetch<T>(path, {headers: authHeaders()}),
    ...options,
  });
}

type MutationVariables = {
  path: string;
  method?: "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

// A write that carries the bearer token and invalidates the given keys on
// success. Callers pass the query keys to refresh, not raw literals.
export function useApiMutation<TData, TVariables = MutationVariables>(
  options: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn"> & {
    invalidateKeys?: readonly (readonly unknown[])[];
    mapVariables?: (variables: TVariables) => MutationVariables;
  } = {},
) {
  const queryClient = useQueryClient();
  const {invalidateKeys, mapVariables, onSuccess, ...rest} = options;

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const payload = mapVariables
        ? mapVariables(variables)
        : (variables as unknown as MutationVariables);
      return apiFetch<TData>(payload.path, {
        method: payload.method ?? "POST",
        headers: authHeaders(),
        body: payload.body === undefined ? undefined : JSON.stringify(payload.body),
      });
    },
    onSuccess: async (data, variables, context, meta) => {
      if (invalidateKeys) {
        await Promise.all(
          invalidateKeys.map((key) =>
            queryClient.invalidateQueries({queryKey: key}),
          ),
        );
      }
      await onSuccess?.(data, variables, context, meta);
    },
    ...rest,
  });
}
