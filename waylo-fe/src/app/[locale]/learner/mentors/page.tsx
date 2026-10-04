import {setRequestLocale} from "next-intl/server";
import {MentorsView} from "@/components/learner/mentors-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <MentorsView />;
}