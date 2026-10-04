import {cn} from "@/lib/utils";

export type AuthLabelProps = React.ComponentProps<"label">;

export function AuthLabel({className, ...props}: AuthLabelProps) {
  return (
    <label
      className={cn("text-sm font-medium leading-tight text-primary md:text-base xl:text-lg", className)}
      {...props}
    />
  );
}

export type AuthSubmitProps = React.ComponentProps<"button">;

export function AuthSubmit({className, children, ...props}: AuthSubmitProps) {
  return (
    <button
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-full border-[0.82px] border-primary bg-[linear-gradient(180deg,#2F59FE_41%,#2F22D1_100%)] text-base font-normal text-white transition-[filter] duration-150",
        "md:h-14 md:text-lg xl:h-16 xl:text-xl",
        "hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
