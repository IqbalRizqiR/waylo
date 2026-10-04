"use client";

import {useTranslations} from "next-intl";
import type {Skill} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Chip} from "@/components/ui/chip";

export function JobPreview({
  title,
  location,
  workMode,
  employmentType,
  description,
  skillIds,
  catalogue,
}: {
  title: string;
  location: string;
  workMode: string;
  employmentType: string;
  description: string;
  skillIds: string[];
  catalogue: Skill[];
}) {
  const t = useTranslations("company.createJob");

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="text-xl font-medium text-black">{t("previewTitle")}</h2>
      <h3 className="text-2xl font-medium text-primary">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)]">
        {location} | {t(`workMode.${workMode}`)} | {t(`employmentType.${employmentType}`)}
      </p>
      <p className="text-[var(--text-secondary)]">{description}</p>
      <div className="flex flex-wrap gap-2">
        {skillIds.map((id) => (
          <Chip key={id} tone="skill">
            {catalogue.find((s) => s.id === id)?.name ?? id}
          </Chip>
        ))}
      </div>
    </Card>
  );
}
