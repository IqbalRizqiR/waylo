"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {CompanyDashboard} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Chip} from "@/components/ui/chip";
import {InitialsAvatar} from "@/components/ui/avatar";
import {PageHeader} from "@/components/shared/page-header";
import {StatCard} from "@/components/shared/stat-card";
import {DataState} from "@/components/shared/data-state";
import {formatWeekdayDate} from "@/lib/format";

export function CompanyDashboardView() {
  const t = useTranslations("company.dashboard");
  const tc = useTranslations("common");
  const query = useApiQuery<CompanyDashboard>(
    queryKeys.company.dashboard,
    "/company/dashboard",
  );

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(data) => (
        <div className="flex flex-col gap-8">
          <PageHeader
            title={t("greeting", {company: data.companyName})}
            subtitle={t("subheading")}
          />

          <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard
              icon="mingcute:black-board-2-line"
              label={t("activeJobs")}
              value={String(data.activeJobs.total)}
              hint={t("activeJobsHint", {
                premium: data.activeJobs.premium,
                basic: data.activeJobs.basic,
              })}
            />
            <StatCard
              icon="mingcute:user-2-line"
              label={t("applicants")}
              value={t("applicantsValue", {count: data.applicants.total})}
              hint={t("applicantsHint", {count: data.applicants.newThisWeek})}
            />
            <StatCard
              icon="mingcute:user-check-line"
              label={t("hired")}
              value={t("hiredValue", {count: data.hired.total})}
              hint={t("hiredHint", {count: data.hired.thisMonth})}
            />
          </section>

          <Card className="p-6">
            <h2 className="text-xl font-medium text-black">{t("chartTitle")}</h2>
            <ApplicantChart values={data.monthlyApplicants} label={t("chartTitle")} />
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-black">{t("myJobsTitle")}</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/company/jobs">{tc("seeAll")}</Link>
                </Button>
              </div>
              <ul className="flex flex-col gap-4">
                {data.myJobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex flex-col gap-2 rounded-[var(--radius-card)] bg-[var(--surface-alt)] p-4"
                  >
                    <Chip
                      tone={job.isPremium ? "status" : "muted"}
                      className="self-start"
                    >
                      {job.isPremium ? t("premiumRecruitment") : t("basicRecruitment")}
                    </Chip>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-black">{job.title}</span>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {t("applicantCount", {count: job.applicantCount})}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{job.note}</p>
                    <Button variant="outline" size="sm" className="self-start" asChild>
                      <Link href="/company/candidates">{t("manageJob")}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-black">
                  {t("recommendedTitle")}
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/company/candidates">{tc("seeAll")}</Link>
                </Button>
              </div>
              <ul className="flex flex-col gap-4">
                {data.recommendedCandidates.map((candidate) => (
                  <li key={candidate.id} className="flex items-center gap-3">
                    <InitialsAvatar
                      initials={candidate.candidateInitials}
                      size="md"
                      label={candidate.candidateName}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-primary">
                        {t.has(`stages.${candidate.stageLabel}`)
                          ? t(`stages.${candidate.stageLabel}`)
                          : candidate.stageLabel}
                      </span>
                      <p className="truncate text-sm font-medium text-black">
                        {candidate.candidateName}
                      </p>
                      <p className="truncate text-xs text-[var(--muted-foreground)]">
                        {candidate.roleTitle} |{" "}
                        {t.has(candidate.contextLabel)
                          ? t(candidate.contextLabel)
                          : candidate.contextLabel}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/company/candidates/${candidate.id}`}>
                        {t("viewDetail")}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="flex flex-col gap-4 p-6">
              <h2 className="text-xl font-medium text-black">{t("tasksTitle")}</h2>
              <ul className="flex flex-col gap-3">
                {data.tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3 text-sm">
                    <Icon
                      name={
                        task.isDone
                          ? "mingcute:check-circle-fill"
                          : "mingcute:circle-line"
                      }
                      className={
                        task.isDone
                          ? "text-lg text-[var(--success)]"
                          : "text-lg text-[var(--muted-foreground)]"
                      }
                    />
                    <span className="text-[var(--text-secondary)]">{task.label}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="flex flex-col gap-4 p-6">
              <h2 className="text-xl font-medium text-black">{t("calendarTitle")}</h2>
              <ul className="flex flex-col gap-4">
                {data.events.map((event) => (
                  <li key={event.id} className="flex items-start gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-secondary text-primary">
                      <Icon name="mingcute:calendar-line" className="text-xl" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-black">
                        {t.has(`kinds.${event.kindLabel}`)
                          ? t(`kinds.${event.kindLabel}`)
                          : event.kindLabel}
                        : {event.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatWeekdayDate(event.startsAt)}
                      </p>
                    </div>
                    <Chip
                      tone={event.status === "open" ? "success" : "status"}
                      className="shrink-0"
                    >
                      {t(`eventStatus.${event.status}`)}
                    </Chip>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </DataState>
  );
}

function ApplicantChart({values, label}: {values: number[]; label: string}) {
  const t = useTranslations("states");
  if (values.every((n) => n === 0)) {
    return (
      <div className="mt-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          {t("emptyBody")}
        </p>
      </div>
    );
  }
  const max = Math.max(1, ...values);
  return (
    <div
      className="mt-6 flex h-32 items-end gap-2"
      role="img"
      aria-label={label}
    >
      {values.map((value, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-[6px] bg-primary/80"
            style={{height: `${(value / max) * 100}%`, minHeight: value > 0 ? 4 : 0}}
          />
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}
