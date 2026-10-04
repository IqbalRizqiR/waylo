import {setRequestLocale} from "next-intl/server";
import {CreateJobView} from "@/components/company/create-job-view";

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <CreateJobView />;
}
