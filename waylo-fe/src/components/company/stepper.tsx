"use client";

import {useTranslations} from "next-intl";
import {cn} from "@/lib/utils";
import {Icon} from "@/components/ui/icon";

export function Stepper({
  step,
  labelKeys,
}: {
  step: number;
  labelKeys: string[];
}) {
  const t = useTranslations("company.createJob");

  return (
    <ol className="flex flex-wrap items-center gap-4">
      {labelKeys.map((key, index) => {
        const number = index + 1;
        const state = number === step ? "current" : number < step ? "done" : "todo";
        return (
          <li key={key} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                state === "current" && "bg-primary text-white",
                state === "done" && "bg-[var(--success)] text-white",
                state === "todo" && "bg-muted text-[var(--muted-foreground)]",
              )}
            >
              {state === "done" ? <Icon name="mingcute:check-line" /> : number}
            </span>
            <span
              className={cn(
                "text-sm",
                state === "todo"
                  ? "text-[var(--muted-foreground)]"
                  : "font-medium text-black",
              )}
            >
              {t(key)}
            </span>
            {number < labelKeys.length ? (
              <span className="hidden h-px w-10 bg-border sm:inline-block" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
