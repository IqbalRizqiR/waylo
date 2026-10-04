import {Icon} from "@/components/ui/icon";
import {cn} from "@/lib/utils";

export type AuthInputProps = React.ComponentProps<"input"> & {
  icon: string;
  trailing?: React.ReactNode;
};

export function AuthInput({
  icon,
  trailing,
  className,
  id,
  ...props
}: AuthInputProps) {
  return (
    <div className="relative">
      <Icon
        name={icon}
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-primary md:left-4 md:text-xl xl:left-5 xl:text-[22px]"
      />
      <input
        id={id}
        className={cn(
          "h-12 w-full rounded-full border border-primary bg-white pl-11 text-sm text-black caret-primary outline-none transition-shadow md:h-14 md:pl-12 md:text-base xl:h-16 xl:pl-14 xl:text-lg",
          "placeholder:text-[var(--muted-foreground)]",
          "focus-visible:shadow-[0_0_0_3px_rgba(0,30,192,0.12)]",
          trailing ? "pr-11 md:pr-12 xl:pr-14" : "pr-4 md:pr-5",
          className,
        )}
        {...props}
      />
      {trailing ? (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 md:right-3 xl:right-4">{trailing}</span>
      ) : null}
    </div>
  );
}
