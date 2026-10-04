"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {CourseDetail} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {H5PPlayer} from "./h5p-player";

export function CourseDetailView({
  id,
  basePath = "/learner/courses",
  mode = "learner",
}: {
  id: string;
  basePath?: string;
  mode?: "learner" | "mentor";
}) {
  const t = useTranslations("learner.courses");
  const tm = useTranslations("mentor.courses");
  const tc = useTranslations("common");
  const query = useApiQuery<CourseDetail>(
    queryKeys.courses.detail(id),
    `/courses/${id}`,
  );

  const enrollMutation = useApiMutation<unknown, Record<string, never>>({
    invalidateKeys: [queryKeys.courses.detail(id), queryKeys.courses.list],
    mapVariables: () => ({
      path: `/courses/${id}/enroll`,
      method: "POST",
    }),
  });

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(course) => (
        <div className="flex flex-col gap-8">
          <div>
            <Button asChild variant="ghost" size="sm">
              <Link href={basePath}>
                <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
                {tc("back")}
              </Link>
            </Button>
          </div>

          <PageHeader
            title={course.title}
            subtitle={course.description}
            actions={
              mode === "mentor" ? (
                <Button asChild size="sm">
                  <Link href={`/mentor/courses/${course.id}/edit`}>
                    <Icon name="mingcute:edit-line" className="mr-1.5 text-base" />
                    {tm("editCourseCTA")}
                  </Link>
                </Button>
              ) : undefined
            }
          />

          {/* Meta card */}
          <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 font-semibold text-primary text-xs">
                <span className="rounded bg-[#1a73e8] px-1.5 py-0.5 text-[10px] font-bold text-white tracking-wider">H5P</span>
                <span>{t("h5pInteractive")}</span>
              </span>

              {course.skillName ? (
                <span className="rounded-full bg-secondary px-3 py-1 font-medium text-primary">
                  {course.skillName}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <Icon name="mingcute:time-line" className="text-base text-primary" />
                {course.durationMinutes} menit
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="mingcute:book-2-line" className="text-base text-primary" />
                {course.lessons.length} modul pembelajaran
              </span>
              {course.mentorName ? (
                <span className="flex items-center gap-1.5">
                  <Icon name="mingcute:user-2-line" className="text-base text-primary" />
                  {course.mentorName}
                </span>
              ) : null}
            </div>

            {mode === "mentor" ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary border border-primary/20 px-3.5 py-1.5 text-xs font-semibold text-primary">
                  <Icon name="mingcute:user-star-line" className="text-base" />
                  <span>{tm("previewModeBadge")}</span>
                </span>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/mentor/courses/${course.id}/edit`}>
                    <Icon name="mingcute:edit-line" className="mr-1 text-base" />
                    {tm("editCourseCTA")}
                  </Link>
                </Button>
              </div>
            ) : !course.isEnrolled ? (
              <Button
                onClick={() => void enrollMutation.mutateAsync({})}
                disabled={enrollMutation.isPending}
                size="lg"
              >
                <Icon name="mingcute:add-circle-line" className="mr-2 text-xl" />
                {t("enrollNow")}
              </Button>
            ) : (
              <span className="flex items-center gap-1 text-sm font-medium text-success">
                <Icon name="mingcute:check-circle-line" className="text-lg" />
                {t("enrolled")} ({course.progressPercent}%)
              </span>
            )}
          </Card>

          {/* Interactive H5P Showcase Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#1a73e8] px-2 py-0.5 text-xs font-bold text-white tracking-wider">H5P</span>
                <h2 className="text-xl font-medium text-black">{t("h5pPreviewTitle")}</h2>
              </div>
              <span className="text-xs text-[var(--muted-foreground)] hidden sm:inline">
                {t("h5pPreviewHint")}
              </span>
            </div>

            <H5PPlayer
              lessonTitle={course.lessons[0]?.title ?? course.title}
              contentPath={course.lessons[0]?.h5pContentPath}
              interactiveConfig={course.lessons[0]?.interactiveConfig}
            />
          </div>

          {/* Lessons list */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium text-black">{t("lessonsTitle")}</h2>

            <div className="flex flex-col gap-3">
              {course.lessons.map((lesson, idx) => (
                <Card
                  key={lesson.id}
                  className="flex items-center justify-between p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-black">{lesson.title}</h3>
                        <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                          H5P
                        </span>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {lesson.durationMinutes} menit • H5P Course Presentation
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {lesson.status === "completed" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-success">
                        <Icon name="mingcute:check-circle-line" className="text-base" />
                        {t("lessonCompleted")}
                      </span>
                    ) : null}

                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`${basePath}/${course.id}/lessons/${lesson.id}`}
                      >
                        {mode === "mentor"
                          ? tm("previewLesson")
                          : lesson.status === "completed"
                          ? t("reviewLesson")
                          : t("startLesson")}
                        <Icon name="mingcute:play-circle-line" className="ml-1 text-base" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </DataState>
  );
}
