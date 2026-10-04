import {cn} from "@/lib/utils";
import {Card} from "@/components/ui/card";
import {Icon} from "@/components/ui/icon";

type Tone = "primary" | "success" | "muted";

const TONE_CLASS: Record<Tone, string> = {
  primary: "text-primary",
  success: "text-[var(--success)]",
  muted: "text-[var(--muted-foreground)]",
};

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "primary",
  className,
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col gap-3 p-6", className)}>
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-[var(--radius-card)] bg-secondary text-primary">
          <Icon name={icon} className="text-2xl" />
        </span>
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
      <p className={cn("text-3xl font-medium", TONE_CLASS[tone])}>{value}</p>
      {hint ? (
        <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>
      ) : null}
    </Card>
  );
}
