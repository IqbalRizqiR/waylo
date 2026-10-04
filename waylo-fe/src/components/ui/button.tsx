import * as React from "react";
import {Slot} from "@radix-ui/react-slot";
import {cva, type VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-cta text-white shadow-[var(--shadow-brand)] hover:brightness-110",
        solid: "bg-primary text-white hover:bg-[#0018a0]",
        outline:
          "border border-primary bg-surface text-primary hover:bg-secondary",
        subtle: "bg-secondary text-secondary-foreground hover:bg-[#d4dbff]",
        ghost: "text-primary hover:bg-secondary",
        inverse:
          "bg-surface text-primary shadow-[var(--shadow-brand)] hover:bg-[#f2f4ff]",
      },
      size: {
        sm: "h-10 rounded-[var(--radius-pill)] px-5 text-sm",
        md: "h-12 rounded-[var(--radius-pill)] px-7 text-base",
        lg: "h-14 rounded-[var(--radius-pill)] px-9 text-lg",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({variant, size, className}))}
      {...props}
    />
  );
}

export {buttonVariants};