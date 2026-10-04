import {setRequestLocale} from "next-intl/server";
import {AssessmentQuizView} from "@/components/learner/assessment-quiz-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  return <AssessmentQuizView id={id} />;
}
