import {setRequestLocale} from "next-intl/server";
import {CoursesView} from "@/components/learner/courses-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <CoursesView />;
}
