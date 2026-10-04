import {cn} from "@/lib/utils";
import {Icon} from "@/components/ui/icon";

export function EmptyState({
  title,
  body,
  icon = "mingcute:inbox-line",
  className,
  action,
}: {
  title: string;
  body: string;
  icon?: string;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-[var(--radius-card)] bg-secondary text-primary">
        <Icon name={icon} className="text-2xl" />
      </span>
      <h3 className="text-lg font-medium text-black">{title}</h3>
      <p className="max-w-sm text-sm text-[var(--text-secondary)]">{body}</p>
      {action}
    </div>
  );
}