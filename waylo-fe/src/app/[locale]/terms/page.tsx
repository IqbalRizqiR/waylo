import {getTranslations, setRequestLocale} from "next-intl/server";
import {Link} from "@/i18n/navigation";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Card} from "@/components/ui/card";
import {PageHeader} from "@/components/shared/page-header";

export default async function TermsPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");
  const tc = await getTranslations("common");

  const sections = [
    {title: t("sections.acceptanceTitle"), body: t("sections.acceptanceBody")},
    {title: t("sections.accountTitle"), body: t("sections.accountBody")},
    {title: t("sections.learnerTitle"), body: t("sections.learnerBody")},
    {title: t("sections.companyTitle"), body: t("sections.companyBody")},
    {title: t("sections.billingTitle"), body: t("sections.billingBody")},
    {title: t("sections.ipTitle"), body: t("sections.ipBody")},
    {title: t("sections.liabilityTitle"), body: t("sections.liabilityBody")},
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
          <Link href="/privacy">{t("title") === "Terms of Service" ? "Privacy Policy" : "Kebijakan Privasi"}</Link>
        </Button>
      </div>
    </div>
  );
}
