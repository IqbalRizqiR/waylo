import {setRequestLocale} from "next-intl/server";
import {MentorEditCourseView} from "@/components/mentor/mentor-edit-course-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  return <MentorEditCourseView id={id} />;
}
