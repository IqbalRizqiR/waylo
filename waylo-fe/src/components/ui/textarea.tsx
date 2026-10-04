import {cn} from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full rounded-[var(--radius-card)] border border-primary bg-surface px-5 py-4 text-base text-black placeholder:text-[var(--muted-foreground)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
