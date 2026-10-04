import {setRequestLocale} from "next-intl/server";
import {JobDetailView} from "@/components/company/job-detail-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  return <JobDetailView id={id} />;
}
