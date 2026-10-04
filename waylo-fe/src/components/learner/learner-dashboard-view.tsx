"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {LearnerDashboard} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Chip} from "@/components/ui/chip";
import {PageHeader} from "@/components/shared/page-header";
import {StatCard} from "@/components/shared/stat-card";
import {DataState} from "@/components/shared/data-state";
import {formatWeekdayDate} from "@/lib/format";

export function LearnerDashboardView() {
  const t = useTranslations("learner.dashboard");
  const query = useApiQuery<LearnerDashboard>(
    queryKeys.learner.dashboard,
    "/learner/dashboard",
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
            title={t("greeting", {name: data.greetingName})}
            subtitle={t("subheading")}
          />

          {data.progressPercent === 0 ? (
            <Card className="flex flex-col gap-3 border-primary/30 bg-secondary/20 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl text-white">
                  <Icon name="mingcute:compass-line" />
                </span>
                <div>
                  <h2 className="text-base font-medium text-black">
                    {t("onboardingPromptTitle")}
                  </h2>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                    {t("onboardingPromptSubtitle")}
                  </p>
                </div>
              </div>
              <Button asChild size="sm" className="shrink-0 self-start sm:self-center">
                <Link href="/learner/onboarding">
                  {t("onboardingPromptCTA")}
                  <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                </Link>
              </Button>
            </Card>
          ) : null}

          <section
            aria-label={t("progressTitle")}
            className="grid grid-cols-1 gap-5 sm:grid-cols-3"
          >
            <StatCard
              icon="mingcute:chart-pie-2-line"
              label={t("progressLabel")}
              value={`${data.progressPercent}%`}
              hint={t("progressHint")}
            />
            <StatCard
              icon="mingcute:certificate-line"
              label={t("certificateLabel")}
              value={t("certificateValue", {count: data.certificateCount})}
              hint={t("certificateHint")}
            />
            <StatCard
              icon="mingcute:time-line"
              label={t("hoursLabel")}
              value={t("hoursValue", {count: data.learningHours})}
              hint={t("hoursHint")}
            />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-xl font-medium text-black">
                {t("currentTrackTitle")}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {data.currentTrack.careerTitle}
              </p>
              <p className="mt-4 text-2xl font-medium text-primary">
                {data.currentTrack.title}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Progress
                  value={data.currentTrack.progressPercent}
                  label={t("progressTitle")}
                  className="flex-1"
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  {t("progressDone", {percent: data.currentTrack.progressPercent})}
                </span>
              </div>
              {data.nextLessonTitle ? (
                <p className="mt-4 text-sm text-[var(--text-secondary)]">
                  {t("nextLesson", {title: data.nextLessonTitle})}
                </p>
              ) : null}
            </Card>

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
                    <span
                      className={
                        task.isDone
                          ? "text-[var(--muted-foreground)] line-through"
                          : "text-[var(--text-secondary)]"
                      }
                    >
                      {task.label}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-black">
                  {t("recommendationsTitle")}
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/learner/roadmap">{t("seeAll")}</Link>
                </Button>
              </div>
              <ul className="flex flex-col gap-3">
                {data.recommendations.map((rec) => (
                  <li
                    key={rec.id}
                    className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] bg-[var(--surface-alt)] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-black">
                        {rec.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {t(`kinds.${rec.kind}`)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--text-secondary)]">
                      {rec.durationLabel}
                    </span>
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
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black">{event.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatWeekdayDate(event.startsAt)}
                      </p>
                    </div>
                    <Chip
                      tone={event.status === "open" ? "success" : "status"}
                      className="ml-auto"
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
