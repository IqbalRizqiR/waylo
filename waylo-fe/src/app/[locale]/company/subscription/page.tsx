import {setRequestLocale} from "next-intl/server";
import {CompanySubscriptionView} from "@/components/company/subscription-view";

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <CompanySubscriptionView />;
}
