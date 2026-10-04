import * as React from "react";
import {cn} from "@/lib/utils";

type ChipTone = "skill" | "status" | "success" | "muted";

const toneClass: Record<ChipTone, string> = {
  skill: "border-[var(--chip-border)] bg-secondary text-primary",
  status: "bg-gradient-cta border border-primary text-white",
  success: "border-[var(--success)] bg-[#bdffcb] text-[#005f14]",
  muted: "border-border bg-muted text-[var(--text-secondary)]",
};

export function Chip({
  tone = "skill",
  className,
  ...props
}: React.ComponentProps<"span"> & {tone?: ChipTone}) {
  return (
    <span
      data-slot="chip"
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-chip)] border px-3 py-1 text-[13px] font-light",
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}