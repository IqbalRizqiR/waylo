import * as React from "react";
import {cn} from "@/lib/utils";

export function Input({className, type, ...props}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-14 w-full rounded-[var(--radius-input)] border border-primary bg-surface px-6 text-base text-black placeholder:text-[var(--muted-foreground)]",
        "transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-[invalid=true]:border-destructive",
        className,
      )}
      {...props}
    />
  );
}