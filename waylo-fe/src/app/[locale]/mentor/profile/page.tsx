import {setRequestLocale} from "next-intl/server";
import {MentorProfileView} from "@/components/mentor/mentor-profile-view";

export default async function Page({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <MentorProfileView />;
}
