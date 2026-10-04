import * as React from "react";
import {cn} from "@/lib/utils";

export function Card({className, ...props}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-card text-card-foreground shadow-[var(--shadow-brand)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({className, ...props}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 p-5", className)}
      {...props}
    />
  );
}

export function CardTitle({className, ...props}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-xl font-medium text-black", className)}
      {...props}
    />
  );
}

export function CardDescription({className, ...props}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-base text-[var(--text-secondary)]", className)}
      {...props}
    />
  );
}

export function CardContent({className, ...props}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-5 pt-0", className)}
      {...props}
    />
  );
}

export function CardFooter({className, ...props}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-5 pt-0", className)}
      {...props}
    />
  );
}