import {setRequestLocale} from "next-intl/server";
import {MentorCoursesView} from "@/components/mentor/mentor-courses-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <MentorCoursesView />;
}
