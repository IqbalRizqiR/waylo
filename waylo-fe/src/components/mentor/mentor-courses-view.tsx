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

export function MentorCoursesView() {
  const t = useTranslations("mentor.courses");
  const query = useApiQuery<Course[]>(queryKeys.courses.list, "/courses");

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
      emptyAction={
        <Button asChild>
          <Link href="/mentor/courses/new">
            <Icon name="mingcute:add-circle-line" className="mr-1.5 text-base" />
            {t("createCourseCTA")}
          </Link>
        </Button>
      }
    >
      {(courses) => (
        <div className="flex flex-col gap-8">
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            actions={
              <Button asChild>
                <Link href="/mentor/courses/new">
                  <Icon name="mingcute:add-circle-line" className="mr-1.5 text-base" />
                  {t("createCourseCTA")}
                </Link>
              </Button>
            }
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col justify-between p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        <span className="rounded bg-primary px-1 py-0.2 text-[10px] font-bold text-white tracking-wider">H5P</span>
                        <span>Interactive</span>
                      </span>
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-primary">
                        {course.skillName ?? "Umum"}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] shrink-0">
                      <Icon name="mingcute:time-line" />
                      {course.durationMinutes} menit
                    </span>
                  </div>

                  <h2 className="text-lg font-medium text-black">{course.title}</h2>
                  <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-[var(--muted-foreground)]">
                  <span>{course.lessonCount} modul pembelajaran</span>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/mentor/courses/${course.id}`}>
                      {t("previewCourse")} →
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
