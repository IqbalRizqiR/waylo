import {DemoBadge} from "@/components/brand/demo-badge";

export function PageHeader({
  title,
  subtitle,
  showDemoBadge = true,
  actions,
}: {
  title: string;
  subtitle?: string;
  showDemoBadge?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-4xl font-medium text-black">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-lg text-[var(--muted-foreground)]">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {showDemoBadge ? <DemoBadge /> : null}
        {actions}
      </div>
    </header>
  );
}
