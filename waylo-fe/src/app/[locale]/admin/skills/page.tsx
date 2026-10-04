import {setRequestLocale} from "next-intl/server";
import {AdminSkillsView} from "@/components/admin/admin-skills-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <AdminSkillsView />;
}
