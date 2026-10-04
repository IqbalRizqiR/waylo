"use client";

import {useTranslations} from "next-intl";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Assessment} from "@waylo/shared";
import {Link} from "@/i18n/navigation";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function AssessmentsView() {
  const t = useTranslations("learner.assessments");
  const query = useApiQuery<Assessment[]>(
    queryKeys.learner.assessments,
    "/learner/assessments",
  );

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:clipboard-line"
    >
      {(data) => (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} subtitle={t("subtitle")} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data.map((assessment) => (
              <Card key={assessment.id} className="flex flex-col gap-4 p-6">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-secondary text-primary">
                    <Icon name="mingcute:clipboard-line" className="text-2xl" />
                  </span>
                  <div>
                    <h2 className="text-lg font-medium text-black">
                      {assessment.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {assessment.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <Icon name="mingcute:time-line" /> {assessment.durationMinutes} menit
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="mingcute:list-check-line" /> {assessment.questionCount} soal
                  </span>
                </div>
                <Button asChild size="sm" className="self-start">
                  <Link href={`/learner/assessments/${assessment.id}`}>
                    {t("start")}
                    <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DataState>
  );
}
