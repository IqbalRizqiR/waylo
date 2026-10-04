"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {Course} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function CoursesView() {
  const t = useTranslations("learner.courses");
  const query = useApiQuery<Course[]>(queryKeys.courses.list, "/courses");

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyIcon="mingcute:book-2-line"
    >
      {(courses) => (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} subtitle={t("subtitle")} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col justify-between p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        <span className="rounded bg-primary px-1 py-0.2 text-[10px] font-bold text-white tracking-wider">H5P</span>
                        <span>{t("h5pInteractive")}</span>
                      </span>
                      {course.skillName ? (
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-primary">
                          {course.skillName}
                        </span>
                      ) : null}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] shrink-0">
                      <Icon name="mingcute:time-line" className="text-sm" />
                      {course.durationMinutes} m
                    </span>
                  </div>

                  <h2 className="text-lg font-medium text-black">{course.title}</h2>
                  <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Icon name="mingcute:play-circle-line" className="text-sm" />
                      {course.lessonCount} {t("interactiveLessons")}
                    </span>
                    {course.mentorName ? (
                      <span>• {t("byMentor", {name: course.mentorName})}</span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-border">
                  {course.isEnrolled ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                        <span>{t("progress")}</span>
                        <span>{course.progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{width: `${course.progressPercent}%`}}
                        />
                      </div>
                    </div>
                  ) : null}

                  <Button asChild size="sm" className="w-full">
                    <Link href={`/learner/courses/${course.id}`}>
                      {course.isEnrolled ? t("continueLearning") : t("viewCourse")}
                      <Icon name="mingcute:arrow-right-line" className="ml-1 text-base" />
                    </Link>
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
