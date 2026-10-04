import {setRequestLocale} from "next-intl/server";
import {CareerDetailView} from "@/components/learner/career-detail-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  return <CareerDetailView id={id} />;
}
