"use client";

import {useTranslations} from "next-intl";
import type {ApplicationStage} from "@waylo/shared";
import {APPLICATION_STAGE_LABEL_KEY} from "@waylo/shared";
import {Chip} from "@/components/ui/chip";

// Renders a pipeline stage from the shared label-key map, so the same stage
// never shows two different names across screens.
export function StageBadge({stage}: {stage: ApplicationStage}) {
  const t = useTranslations("company.stages");
  const key = APPLICATION_STAGE_LABEL_KEY[stage];
  return (
    <Chip tone={stage === "hired" ? "success" : "muted"}>
      {t.has(key) ? t(key) : stage}
    </Chip>
  );
}
