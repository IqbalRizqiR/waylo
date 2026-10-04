import {setRequestLocale} from "next-intl/server";
import {CareersView} from "@/components/learner/careers-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <CareersView />;
}