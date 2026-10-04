import {setRequestLocale} from "next-intl/server";
import {AdminCoursesView} from "@/components/admin/admin-courses-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <AdminCoursesView />;
}
