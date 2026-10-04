import {setRequestLocale} from "next-intl/server";
import {JobsView} from "@/components/company/jobs-view";

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <JobsView />;
}
