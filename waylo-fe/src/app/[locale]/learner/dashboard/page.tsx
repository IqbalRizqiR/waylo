import {setRequestLocale} from "next-intl/server";
import {LearnerDashboardView} from "@/components/learner/learner-dashboard-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <LearnerDashboardView />;
}