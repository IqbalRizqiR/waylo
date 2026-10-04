import {setRequestLocale} from "next-intl/server";
import {LearnerShell} from "@/components/learner/learner-shell";

export default async function LearnerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <LearnerShell>{children}</LearnerShell>;
}