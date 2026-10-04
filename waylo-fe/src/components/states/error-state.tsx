"use client";

import {cn} from "@/lib/utils";
import {Icon} from "@/components/ui/icon";
import {Button} from "@/components/ui/button";

export function ErrorState({
  title,
  body,
  retryLabel,
  onRetry,
  className,
}: {
  title: string;
  body: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-[var(--radius-card)] bg-[#ffe4e9] text-destructive">
        <Icon name="mingcute:warning-line" className="text-2xl" />
      </span>
      <h3 className="text-lg font-medium text-black">{title}</h3>
      <p className="max-w-sm text-sm text-[var(--text-secondary)]">{body}</p>
      {onRetry && retryLabel ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}