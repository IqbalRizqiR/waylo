"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {useApiQuery} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {CourseDetail} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";

export function AdminCoursesView() {
  const t = useTranslations("admin.courses");
  const query = useApiQuery<CourseDetail[]>(
    queryKeys.courses.list,
    "/admin/courses",
  );

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(courses) => (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} subtitle={t("subtitle")} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const h5pCount = course.lessons.filter(
                (l) => l.h5pContentPath || l.interactiveConfig,
              ).length;

              return (
                <Card key={course.id} className="flex flex-col justify-between p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Chip tone="skill">
                        {course.skillName ?? "Umum"}
                      </Chip>
                      <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <Icon name="mingcute:time-line" />
                        {course.durationMinutes} menit
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-black">{course.title}</h3>
                    <p className="line-clamp-2 text-xs text-[var(--text-secondary)]">
                      {course.description}
                    </p>

                    <div className="mt-1 flex flex-col gap-1 text-xs text-[var(--muted-foreground)]">
                      <span>{t("authorMentor", {name: course.mentorName ?? "Admin"})}: </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-black">
                          {course.lessons.length} {t("lessons")}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 rounded bg-[#1a73e8]/10 px-2 py-0.5 font-bold text-[#1a73e8]">
                          <span className="rounded bg-[#1a73e8] px-1 text-[9px] text-white">H5P</span>
                          <span>{h5pCount} {t("h5pInteractiveModules")}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/mentor/courses/${course.id}`}>
                        <Icon name="mingcute:play-circle-line" className="mr-1 text-sm" />
                        {t("previewCTA")}
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/mentor/courses/${course.id}/edit`}>
                        <Icon name="mingcute:edit-line" className="mr-1 text-sm" />
                        {t("editCourseCTA")}
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
