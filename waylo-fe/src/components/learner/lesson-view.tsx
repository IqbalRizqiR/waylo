"use client";

import {useTranslations} from "next-intl";
import {Link, useRouter} from "@/i18n/navigation";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {CourseDetail} from "@waylo/shared";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {H5PPlayer} from "./h5p-player";

export function LessonView({
  courseId,
  lessonId,
  basePath = "/learner/courses",
  isMentorPreview = false,
}: {
  courseId: string;
  lessonId: string;
  basePath?: string;
  isMentorPreview?: boolean;
}) {
  const t = useTranslations("learner.learning");
  const tc = useTranslations("common");
  const router = useRouter();

  const query = useApiQuery<CourseDetail>(
    queryKeys.courses.detail(courseId),
    `/courses/${courseId}`,
  );

  const progressMutation = useApiMutation({
    invalidateKeys: [
      queryKeys.courses.detail(courseId),
      queryKeys.courses.list,
      queryKeys.learner.dashboard,
    ],
    mapVariables: (vars: {status: string}) => ({
      path: `/courses/${courseId}/lessons/${lessonId}/progress`,
      method: "PATCH",
      body: vars,
    }),
  });

  return (
    <DataState
      query={query}
      data={query.data}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(course) => {
        const lesson = course.lessons.find((l) => l.id === lessonId);
        if (!lesson) {
          return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-lg text-[var(--muted-foreground)]">
                {t("lessonNotFound")}
              </p>
              <Button asChild variant="outline">
                <Link href={`${basePath}/${courseId}`}>
                  {tc("back")}
                </Link>
              </Button>
            </div>
          );
        }

        async function handleComplete() {
          if (!isMentorPreview) {
            await progressMutation.mutateAsync({status: "completed"});
          }
          router.push(`${basePath}/${courseId}`);
        }

        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Button asChild variant="ghost" size="sm">
                <Link href={`${basePath}/${courseId}`}>
                  <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
                  {course.title}
                </Link>
              </Button>
              <span className="text-sm text-[var(--muted-foreground)]">
                {t("lessonProgress", {
                  order: lesson.order,
                  total: course.lessons.length,
                })}
              </span>
            </div>

            <PageHeader title={lesson.title} subtitle={course.title} />

            <H5PPlayer
              contentPath={lesson.h5pContentPath}
              interactiveConfig={lesson.interactiveConfig}
              lessonTitle={lesson.title}
              onComplete={handleComplete}
            />
          </div>
        );
      }}
    </DataState>
  );
}
