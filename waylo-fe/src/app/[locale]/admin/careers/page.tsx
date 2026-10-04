import {setRequestLocale} from "next-intl/server";
import {AdminCareersView} from "@/components/admin/admin-careers-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <AdminCareersView />;
}
