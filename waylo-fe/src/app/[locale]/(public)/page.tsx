import {setRequestLocale, getTranslations} from "next-intl/server";
import Image from "next/image";
import {Link} from "@/i18n/navigation";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";

export default async function WelcomePage({
  params,
}: PageProps<"/[locale]">) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("welcome");

  return (
    <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
      <div className="flex flex-col gap-6">
        <h1 className="text-5xl font-medium leading-[1.05] tracking-[-0.025em] text-black sm:text-6xl xl:text-7xl">
          {t("headlineLine1")}
          <br />
          <span className="text-primary">{t("headlineLine2")}</span>
        </h1>
        <p className="max-w-xl text-lg font-light text-[var(--text-secondary)] sm:text-xl">
          {t("subheadline")}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <Link href="/register">
              {t("ctaPrimary")}
              <Icon name="mingcute:arrow-right-line" className="text-xl" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">{t("ctaLogin")}</Link>
          </Button>
        </div>
      </div>
      <div className="relative min-h-72 overflow-hidden rounded-[var(--radius-card)] border border-border shadow-[var(--shadow-brand-lg)]">
        <Image
          src="/assets/images/welcome-hero.png"
          alt={t("heroAlt")}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}