import {cn} from "@/lib/utils";

const sizeClass = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-lg",
} as const;

export function InitialsAvatar({
  initials,
  className,
  size = "md",
  label,
}: {
  initials: string;
  className?: string;
  size?: keyof typeof sizeClass;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-secondary font-semibold text-primary",
        sizeClass[size],
        className,
      )}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {initials}
    </span>
  );
}