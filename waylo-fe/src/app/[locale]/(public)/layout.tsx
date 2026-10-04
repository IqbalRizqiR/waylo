import {setRequestLocale} from "next-intl/server";
import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";
import {Logo} from "@/components/brand/logo";
import {Button} from "@/components/ui/button";
import {Footer} from "@/components/shared/footer";

export default async function PublicLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("welcome");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-[var(--surface-alt)]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" aria-label="Waylo" className="rounded-md">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">{t("ctaLogin")}</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/register">{t("ctaRegister")}</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}