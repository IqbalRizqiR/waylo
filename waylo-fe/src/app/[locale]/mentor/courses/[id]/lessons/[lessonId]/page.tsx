import {setRequestLocale} from "next-intl/server";
import {LessonView} from "@/components/learner/lesson-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string; id: string; lessonId: string}>;
}) {
  const {locale, id, lessonId} = await params;
  setRequestLocale(locale);
  return (
    <LessonView
      courseId={id}
      lessonId={lessonId}
      basePath="/mentor/courses"
      isMentorPreview={true}
    />
  );
}
