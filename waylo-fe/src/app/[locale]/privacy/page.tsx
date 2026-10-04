import {getTranslations, setRequestLocale} from "next-intl/server";
import {Link} from "@/i18n/navigation";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Card} from "@/components/ui/card";
import {PageHeader} from "@/components/shared/page-header";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");
  const tc = await getTranslations("common");

  const sections = [
    {title: t("sections.lawTitle"), body: t("sections.lawBody")},
    {title: t("sections.dataCollectedTitle"), body: t("sections.dataCollectedBody")},
    {title: t("sections.purposeTitle"), body: t("sections.purposeBody")},
    {title: t("sections.talentPoolTitle"), body: t("sections.talentPoolBody")},
    {title: t("sections.securityTitle"), body: t("sections.securityBody")},
    {title: t("sections.rightsTitle"), body: t("sections.rightsBody")},
    {title: t("sections.contactTitle"), body: t("sections.contactBody")},
  ];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-12 sm:py-16">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <Icon name="mingcute:arrow-left-line" className="mr-1 text-base" />
            {tc("back")}
          </Link>
        </Button>
      </div>

      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-secondary/30 p-4 text-xs font-medium text-primary">
        <Icon name="mingcute:shield-check-line" className="text-lg shrink-0" />
        <span>Kepatuhan Penuh UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</span>
      </div>

      <p className="text-xs font-medium text-[var(--muted-foreground)]">
        {t("lastUpdated")}
      </p>

      <div className="flex flex-col gap-6">
        {sections.map((section, idx) => (
          <Card key={idx} className="flex flex-col gap-3 p-6 sm:p-8">
            <h2 className="text-lg font-medium text-black sm:text-xl">
              {section.title}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
              {section.body}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-6 text-sm text-[var(--muted-foreground)]">
        <span>Waylo Career &amp; Talent Platform</span>
        <Button asChild variant="outline" size="sm">
          <Link href="/terms">{t("title") === "Privacy Policy" ? "Terms of Service" : "Syarat & Ketentuan"}</Link>
        </Button>
      </div>
    </div>
  );
}
