"use client";

import {useTranslations} from "next-intl";
import type {Skill} from "@waylo/shared";
import {cn} from "@/lib/utils";

export function JobSkillPicker({
  catalogue,
  selected,
  onToggle,
}: {
  catalogue: Skill[];
  selected: string[];
  onToggle: (skillId: string) => void;
}) {
  const tc = useTranslations("common");

  if (catalogue.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">{tc("loading")}</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {catalogue.map((skill) => {
        const isSelected = selected.includes(skill.id);
        return (
          <button
            key={skill.id}
            type="button"
            onClick={() => onToggle(skill.id)}
            aria-pressed={isSelected}
            className={cn(
              "rounded-[var(--radius-chip)] border px-4 py-2 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
              isSelected
                ? "border-primary bg-primary text-white"
                : "border-[var(--chip-border)] bg-secondary text-primary hover:bg-[#d4dbff]",
            )}
          >
            {skill.name}
          </button>
        );
      })}
    </div>
  );
}
