import {setRequestLocale} from "next-intl/server";
import {CertificateDetailView} from "@/components/learner/certificate-detail-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  return <CertificateDetailView id={id} />;
}
