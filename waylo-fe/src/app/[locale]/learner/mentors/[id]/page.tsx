import {setRequestLocale} from "next-intl/server";
import {MentorDetailView} from "@/components/learner/mentor-detail-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  return <MentorDetailView id={id} />;
}
