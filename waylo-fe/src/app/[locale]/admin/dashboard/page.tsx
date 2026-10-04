import {setRequestLocale} from "next-intl/server";
import {AdminDashboardView} from "@/components/admin/admin-dashboard-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <AdminDashboardView />;
}
