import {setRequestLocale} from "next-intl/server";
import {MentorReviewsView} from "@/components/mentor/mentor-reviews-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <MentorReviewsView />;
}
