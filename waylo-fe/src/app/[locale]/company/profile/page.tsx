import {setRequestLocale} from "next-intl/server";
import {CompanyProfileView} from "@/components/company/company-profile-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <CompanyProfileView />;
}
