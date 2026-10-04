"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {AggregateSkillGap} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {Progress} from "@/components/ui/progress";
import {PageHeader} from "@/components/shared/page-header";
import {StatCard} from "@/components/shared/stat-card";
import {DataState} from "@/components/shared/data-state";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-blue-50 text-blue-700 border-blue-200",
  intermediate: "bg-teal-50 text-teal-700 border-teal-200",
  advanced: "bg-purple-50 text-purple-700 border-purple-200",
  expert: "bg-amber-50 text-amber-700 border-amber-200",
};

export function SkillGapView() {
  const t = useTranslations("learner.skillGap");
  const query = useApiQuery<AggregateSkillGap>(
    queryKeys.learner.skillGap,
    "/learner/skill-gap",
  );

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => !data.targetCareer}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyAction={
        <Button asChild>
          <Link href="/learner/onboarding">{t("chooseCareerCTA")}</Link>
        </Button>
      }
    >
      {(gap) => {
        const career = gap.targetCareer!;

        return (
          <div className="flex flex-col gap-8">
            <PageHeader
              title={t("title")}
              subtitle={t("subtitle", {career: career.title})}
            />

            {/* Target Career Match Card */}
            <Card className="flex flex-col gap-5 p-6 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {t("targetRoleLabel")}
                  </span>
                  <h2 className="text-2xl font-bold text-black sm:text-3xl">{career.title}</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{career.summary}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-2xl font-bold text-primary">
                    {gap.overallMatchPercent}%
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted-foreground)]">{t("overallMatch")}</span>
                    <p className="text-sm font-semibold text-black">
                      {gap.overallMatchPercent >= 80 ? t("readyToApply") : t("gapClosing")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-border pt-4">
                <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                  <span>{t("progressLabel")}</span>
                  <span>{gap.overallMatchPercent}%</span>
                </div>
                <Progress value={gap.overallMatchPercent} label={t("title")} />
              </div>
            </Card>

            {/* 4 Stats Grid */}
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon="mingcute:list-check-line"
                label={t("statsTotal")}
                value={String(gap.stats.totalRequired)}
              />
              <StatCard
                icon="mingcute:check-circle-line"
                label={t("statsVerified")}
                value={String(gap.stats.verifiedCount)}
                tone="success"
              />
              <StatCard
                icon="mingcute:time-line"
                label={t("statsInProgress")}
                value={String(gap.stats.inProgressCount)}
              />
              <StatCard
                icon="mingcute:alert-line"
                label={t("statsMissing")}
                value={String(gap.stats.missingCount)}
                tone="muted"
              />
            </section>

            {/* Radar Visual vs Requirements Table */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Radar Chart Card (5 cols) */}
              <Card className="flex flex-col gap-4 p-6 lg:col-span-5">
                <div>
                  <h3 className="text-lg font-medium text-black">{t("radarChartTitle")}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t("radarChartSubtitle")}
                  </p>
                </div>

                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={gap.radarData}>
                      <PolarGrid stroke="#e5e7f0" />
                      <PolarAngleAxis dataKey="subject" tick={{fontSize: 11, fill: "#444"}} />
                      <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} />
                      <Radar
                        name={t("legendRequired")}
                        dataKey="required"
                        stroke="#001ec0"
                        fill="#001ec0"
                        fillOpacity={0.2}
                      />
                      <Radar
                        name={t("legendCurrent")}
                        dataKey="current"
                        stroke="#0fc7a7"
                        fill="#0fc7a7"
                        fillOpacity={0.4}
                      />
                      <Legend
                        wrapperStyle={{fontSize: 12, paddingTop: 10}}
                        iconType="circle"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Actionable Skill Breakdown (7 cols) */}
              <Card className="flex flex-col gap-5 p-6 lg:col-span-7">
                <div>
                  <h3 className="text-lg font-medium text-black">{t("breakdownTitle")}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t("breakdownSubtitle")}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-[var(--muted-foreground)]">
                        <th className="pb-3 font-medium">{t("colSkill")}</th>
                        <th className="pb-3 font-medium">{t("colLevel")}</th>
                        <th className="pb-3 font-medium">{t("colStatus")}</th>
                        <th className="pb-3 text-right font-medium">{t("colAction")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {gap.actions.map((act) => (
                        <tr key={act.skillId} className="py-3">
                          <td className="py-3.5 pr-3">
                            <span className="font-medium text-black">{act.skillName}</span>
                            <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                              {act.category}
                            </span>
                          </td>

                          <td className="py-3.5 pr-3">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span
                                className={`rounded-full border px-2 py-0.5 capitalize ${
                                  LEVEL_COLORS[act.requiredLevel] ?? ""
                                }`}
                              >
                                {act.requiredLevel}
                              </span>
                              <span className="text-[var(--muted-foreground)]">vs</span>
                              <span
                                className={`rounded-full border px-2 py-0.5 capitalize ${
                                  act.currentLevel ? LEVEL_COLORS[act.currentLevel] ?? "" : "bg-muted text-[var(--muted-foreground)] border-border"
                                }`}
                              >
                                {act.currentLevel ?? "-"}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 pr-3">
                            {act.gapSeverity === "met" ? (
                              <Chip tone="success" className="text-xs">
                                <Icon name="mingcute:check-circle-line" className="mr-1" />
                                {t("statusMet")}
                              </Chip>
                            ) : act.gapSeverity === "unverified" ? (
                              <Chip tone="status" className="text-xs">
                                <Icon name="mingcute:time-line" className="mr-1" />
                                {t("statusUnverified")}
                              </Chip>
                            ) : (
                              <Chip tone="muted" className="text-xs text-destructive">
                                <Icon name="mingcute:alert-line" className="mr-1" />
                                {t("statusMissing")}
                              </Chip>
                            )}
                          </td>

                          <td className="py-3.5 text-right">
                            {act.recommendedAction === "learn" ? (
                              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                                <Link href="/learner/courses">
                                  {t("actLearn")}
                                  <Icon name="mingcute:arrow-right-line" className="ml-1" />
                                </Link>
                              </Button>
                            ) : act.recommendedAction === "assess" ? (
                              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                                <Link href="/learner/assessments">
                                  {t("actAssess")}
                                  <Icon name="mingcute:badge-line" className="ml-1" />
                                </Link>
                              </Button>
                            ) : (
                              <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                                <Link href="/learner/roadmap">
                                  {t("actPractice")}
                                  <Icon name="mingcute:check-line" className="ml-1" />
                                </Link>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        );
      }}
    </DataState>
  );
}
