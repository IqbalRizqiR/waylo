import {setRequestLocale} from "next-intl/server";
import {CompanyShell} from "@/components/company/company-shell";

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <CompanyShell>{children}</CompanyShell>;
}