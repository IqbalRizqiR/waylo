"use client";

import {useTranslations} from "next-intl";
import {LoadingState} from "@/components/states/loading-state";
import {ErrorState} from "@/components/states/error-state";
import {EmptyState} from "@/components/states/empty-state";

type QueryLike = {
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
};

type DataStateProps<T> = {
  query: QueryLike;
  data: T | undefined;
  isEmpty?: (data: T) => boolean;
  emptyTitle: string;
  emptyBody: string;
  emptyIcon?: string;
  emptyAction?: React.ReactNode;
  children: (data: T) => React.ReactNode;
};

// One place that renders loading, error, empty, and success for a query.
// Views pass their data and render only the success branch (antislop R-27).
export function DataState<T>({
  query,
  data,
  isEmpty,
  emptyTitle,
  emptyBody,
  emptyIcon,
  emptyAction,
  children,
}: DataStateProps<T>) {
  const t = useTranslations("states");
  const tc = useTranslations("common");

  if (query.isLoading) {
    return <LoadingState label={t("loadingLabel")} />;
  }

  if (query.isError || data === undefined) {
    return (
      <ErrorState
        title={t("errorTitle")}
        body={t("errorBody")}
        retryLabel={tc("retry")}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (isEmpty?.(data)) {
    return (
      <EmptyState
        title={emptyTitle}
        body={emptyBody}
        icon={emptyIcon}
        action={emptyAction}
      />
    );
  }

  return <>{children(data)}</>;
}
