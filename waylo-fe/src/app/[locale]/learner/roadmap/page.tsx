import {setRequestLocale} from "next-intl/server";
import {RoadmapView} from "@/components/learner/roadmap-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <RoadmapView />;
}