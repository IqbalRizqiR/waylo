import {setRequestLocale} from "next-intl/server";
import {CourseDetailView} from "@/components/learner/course-detail-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  return (
    <CourseDetailView
      id={id}
      basePath="/mentor/courses"
      mode="mentor"
    />
  );
}
