import {setRequestLocale} from "next-intl/server";
import {OnboardingWizard} from "@/components/learner/onboarding-wizard";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <OnboardingWizard />;
}
