import {cn} from "@/lib/utils";
import {Icon} from "@/components/ui/icon";

// Marks views whose figures come from the demo seed dataset, so nothing is
// presented as real production data (antislop R-17, R-36, R-38).
export function DemoBadge({className}: {className?: string}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--chip-border)] bg-secondary px-3 py-1 text-xs font-medium text-primary",
        className,
      )}
      title="Data demo dari seed"
    >
      <Icon name="mingcute:flask-line" className="text-sm" />
      Data demo
    </span>
  );
}