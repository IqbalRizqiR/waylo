import {setRequestLocale} from "next-intl/server";
import {ProjectDetailView} from "@/components/learner/project-detail-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  return <ProjectDetailView id={id} />;
}
