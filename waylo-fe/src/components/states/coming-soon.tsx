import {getTranslations, setRequestLocale} from "next-intl/server";
import {EmptyState} from "@/components/states/empty-state";

export async function ComingSoonPage({
  locale,
  icon = "mingcute:time-line",
}: {
  locale: string;
  icon?: string;
}) {
  setRequestLocale(locale);
  const t = await getTranslations("states");
  const c = await getTranslations("common");
  return (
    <EmptyState
      title={c("comingSoon")}
      body={t("emptyBody")}
      icon={icon}
    />
  );
}