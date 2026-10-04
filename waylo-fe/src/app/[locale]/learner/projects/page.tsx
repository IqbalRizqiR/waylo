import {setRequestLocale} from "next-intl/server";
import {ProjectsView} from "@/components/learner/projects-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <ProjectsView />;
}
