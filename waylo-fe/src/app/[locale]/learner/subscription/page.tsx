import {setRequestLocale} from "next-intl/server";
import {LearnerSubscriptionView} from "@/components/learner/subscription-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <LearnerSubscriptionView />;
}
