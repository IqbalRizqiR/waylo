"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Job} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {formatCurrencyRange} from "@/lib/format";

const STATUS_LABEL_KEY: Record<string, string> = {
  draft: "draft",
  preview: "preview",
  published: "published",
  archived: "archived",
};

export function JobsView() {
  const t = useTranslations("company.jobs");
  const query = useApiQuery<Job[]>(queryKeys.company.jobs, "/jobs");

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:black-board-2-line"
      emptyAction={
        <Button asChild>
          <Link href="/company/jobs/new">{t("createJob")}</Link>
        </Button>
      }
    >
      {(data) => (
        <div className="flex flex-col gap-8">
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            actions={
              <Button asChild>
                <Link href="/company/jobs/new">{t("createJob")}</Link>
              </Button>
            }
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data.map((job) => (
              <Card key={job.id} className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-medium text-black">
                      {job.title}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {job.location} | {t(`workMode.${job.workMode}`)}
                    </p>
                  </div>
                  <Chip tone={job.status === "published" ? "success" : "muted"}>
                    {t(`status.${STATUS_LABEL_KEY[job.status] ?? job.status}`)}
                  </Chip>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Chip key={skill.skillId} tone="skill">
                      {skill.name}
                    </Chip>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <Icon name="mingcute:wallet-line" />
                    {formatCurrencyRange(job.salaryMin, job.salaryMax) ??
                      t("salaryUnspecified")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="mingcute:briefcase-line" />
                    {t("experienceRange", {
                      min: job.experienceMinYears ?? 0,
                      max: job.experienceMaxYears ?? 0,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/company/jobs/${job.id}`}>
                      {t("viewDetail")}
                      <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/company/candidates">{t("viewApplicants")}</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DataState>
  );
}
