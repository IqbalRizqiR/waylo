"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Project} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function ProjectsView() {
  const t = useTranslations("learner.projects");
  const query = useApiQuery<Project[]>(queryKeys.projects.list, "/projects");

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:code-line"
    >
      {(projects) => (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} subtitle={t("subtitle")} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const sub = project.mySubmission;

              return (
                <Card key={project.id} className="flex flex-col justify-between p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      {project.skillName ? (
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                          {project.skillName}
                        </span>
                      ) : <span />}

                      <span className="rounded-full border border-border bg-white px-2.5 py-0.5 text-xs font-semibold capitalize text-[var(--muted-foreground)]">
                        {t(`difficulty.${project.difficulty}`)}
                      </span>
                    </div>

                    <h2 className="text-lg font-medium text-black">{project.title}</h2>
                    <p className="line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4">
                    {sub ? (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--muted-foreground)]">{t("submissionStatus")}</span>
                        <Chip
                          tone={
                            sub.status === "approved"
                              ? "success"
                              : sub.status === "rejected"
                              ? "muted"
                              : "status"
                          }
                          className="capitalize"
                        >
                          {t(`status.${sub.status}`)}
                        </Chip>
                      </div>
                    ) : null}

                    <Button asChild size="sm" variant={sub ? "outline" : "primary"} className="w-full">
                      <Link href={`/learner/projects/${project.id}`}>
                        {sub ? t("viewSubmission") : t("startProject")}
                        <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </DataState>
  );
}
