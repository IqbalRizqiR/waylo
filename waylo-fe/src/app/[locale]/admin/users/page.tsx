import {setRequestLocale} from "next-intl/server";
import {AdminUsersView} from "@/components/admin/admin-users-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <AdminUsersView />;
}
