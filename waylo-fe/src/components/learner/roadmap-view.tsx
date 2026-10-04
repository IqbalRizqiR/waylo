"use client";

import {useTranslations} from "next-intl";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Roadmap, RoadmapModuleStatus} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Chip} from "@/components/ui/chip";
import {PageHeader} from "@/components/shared/page-header";
import {StatCard} from "@/components/shared/stat-card";
import {DataState} from "@/components/shared/data-state";

const STATUS_ICON = {
  completed: "mingcute:check-circle-fill",
  in_progress: "mingcute:play-circle-fill",
  not_started: "mingcute:circle-line",
} as const;

const STATUS_TONE = {
  completed: "text-[var(--success)]",
  in_progress: "text-primary",
  not_started: "text-[var(--muted-foreground)]",
} as const;

export function RoadmapView() {
  const t = useTranslations("learner.roadmap");
  const query = useApiQuery<Roadmap | null>(
    queryKeys.learner.roadmap,
    "/learner/roadmap",
  );

  const updateMutation = useApiMutation({
    invalidateKeys: [queryKeys.learner.roadmap, queryKeys.learner.dashboard],
    mapVariables: ({itemId, status}: {itemId: string; status: RoadmapModuleStatus}) => ({
      path: `/learner/roadmap/items/${itemId}`,
      method: "PATCH",
      body: {status},
    }),
  });

  function nextStatus(current: RoadmapModuleStatus): RoadmapModuleStatus {
    if (current === "not_started") return "in_progress";
    if (current === "in_progress") return "completed";
    return "not_started";
  }

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data === null}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:route-line"
    >
      {(data) =>
        data === null ? null : (
          <div className="flex flex-col gap-8">
            <PageHeader title={t("title")} subtitle={t("subtitle")} />

            <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon="mingcute:list-check-line"
                label={t("stats.total")}
                value={String(data.stats.totalModules)}
              />
              <StatCard
                icon="mingcute:check-circle-line"
                label={t("stats.completed")}
                value={String(data.stats.completed)}
                tone="success"
              />
              <StatCard
                icon="mingcute:play-circle-line"
                label={t("stats.inProgress")}
                value={String(data.stats.inProgress)}
              />
              <StatCard
                icon="mingcute:circle-line"
                label={t("stats.notStarted")}
                value={String(data.stats.notStarted)}
                tone="muted"
              />
            </section>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-black">
                  {data.trackTitle}
                </h2>
                <span className="text-sm text-[var(--text-secondary)]">
                  {t("progressDone", {percent: data.progressPercent})}
                </span>
              </div>
              <Progress
                value={data.progressPercent}
                label={t("title")}
                className="mt-3"
              />
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ol className="flex flex-col gap-4 lg:col-span-2">
                {data.modules.map((module) => (
                  <li key={module.id}>
                    <Card className="flex items-start gap-4 p-5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                        {module.order}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon
                            name={STATUS_ICON[module.status]}
                            className={`text-lg ${STATUS_TONE[module.status]}`}
                          />
                          <h3 className="text-base font-medium text-black">
                            {module.title}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {module.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() =>
                            void updateMutation.mutateAsync({
                              itemId: module.id,
                              status: nextStatus(module.status),
                            })
                          }
                          aria-label={t("toggleStatus")}
                          className="h-8 px-2 text-xs"
                        >
                          <Chip
                            tone={module.status === "completed" ? "success" : "muted"}
                            className="cursor-pointer"
                          >
                            {t(`status.${module.status}`)}
                          </Chip>
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ol>

              <Card className="flex flex-col gap-4 p-6">
                <h2 className="text-xl font-medium text-black">
                  {t("rewardsTitle")}
                </h2>
                <ul className="flex flex-col gap-3">
                  {data.rewards.map((reward) => (
                    <li key={reward.id} className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-[var(--radius-card)] bg-secondary text-primary">
                        <Icon name="mingcute:award-line" className="text-lg" />
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {reward.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )
      }
    </DataState>
  );
}
