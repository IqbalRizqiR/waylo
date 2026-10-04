import {cn} from "@/lib/utils";

export function LoadingState({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col gap-3", className)}
    >
      <span className="sr-only">{label}</span>
      <div className="skeleton h-24 rounded-[var(--radius-card)]" />
      <div className="skeleton h-24 rounded-[var(--radius-card)]" />
      <div className="skeleton h-24 rounded-[var(--radius-card)]" />
    </div>
  );
}