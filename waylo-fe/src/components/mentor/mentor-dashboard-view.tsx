"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {MentorDashboard} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {StatCard} from "@/components/shared/stat-card";
import {DataState} from "@/components/shared/data-state";
import {formatCurrency, formatLongDate} from "@/lib/format";

export function MentorDashboardView() {
  const t = useTranslations("mentor.dashboard");
  const tc = useTranslations("common");
  const query = useApiQuery<MentorDashboard>(
    queryKeys.mentor.dashboard,
    "/mentor/dashboard",
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
            title={t("greeting", {name: data.mentorName})}
            subtitle={t("subtitle")}
          />

          {/* 4 Stats Grid */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon="mingcute:calendar-line"
              label={t("upcomingSessions")}
              value={String(data.stats.upcomingSessionsCount)}
            />
            <StatCard
              icon="mingcute:task-line"
              label={t("pendingReviews")}
              value={String(data.stats.pendingReviewsCount)}
            />
            <StatCard
              icon="mingcute:book-2-line"
              label={t("activeCourses")}
              value={String(data.stats.activeCoursesCount)}
            />
            <StatCard
              icon="mingcute:wallet-line"
              label={t("totalEarned")}
              value={formatCurrency(data.stats.totalEarnedAmount)}
              tone="success"
            />
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Upcoming Mentoring Sessions (6 cols) */}
            <Card className="flex flex-col gap-4 p-6 sm:p-7 lg:col-span-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-black">{t("nextSessionsTitle")}</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t("nextSessionsSubtitle")}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {data.nextSessions.length}
                </span>
              </div>

              {data.nextSessions.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {data.nextSessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-border p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-black">{s.topic}</span>
                        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1">
                            <Icon name="mingcute:time-line" />
                            {formatLongDate(s.startsAt)}
                          </span>
                        </div>
                      </div>

                      {s.meetingUrl ? (
                        <Button asChild size="sm">
                          <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer">
                            <Icon name="mingcute:video-line" className="mr-1 text-base" />
                            {t("joinMeeting")}
                          </a>
                        </Button>
                      ) : (
                        <Chip tone="muted">{t("scheduled")}</Chip>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                  {t("noUpcomingSessions")}
                </p>
              )}
            </Card>

            {/* Pending Technical Reviews (6 cols) */}
            <Card className="flex flex-col gap-4 p-6 sm:p-7 lg:col-span-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-black">{t("pendingReviewsTitle")}</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t("pendingReviewsSubtitle")}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/mentor/reviews">{tc("seeAll")}</Link>
                </Button>
              </div>

              {data.pendingReviews.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {data.pendingReviews.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border border-border p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-black">
                            {r.candidateName}
                          </span>
                          <Chip tone={r.type === "candidate_screening" ? "status" : "skill"}>
                            {r.type === "candidate_screening" ? t("typeScreening") : t("typeProject")}
                          </Chip>
                        </div>
                        <p className="truncate text-xs text-[var(--text-secondary)]">{r.title}</p>
                      </div>

                      <Button asChild size="sm" variant="outline" className="shrink-0">
                        <Link href="/mentor/reviews">
                          {t("evaluateCTA")}
                          <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                  {t("noPendingReviews")}
                </p>
              )}
            </Card>
          </div>
        </div>
      )}
    </DataState>
  );
}
