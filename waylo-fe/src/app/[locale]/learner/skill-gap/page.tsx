import {setRequestLocale} from "next-intl/server";
import {SkillGapView} from "@/components/learner/skill-gap-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <SkillGapView />;
}
