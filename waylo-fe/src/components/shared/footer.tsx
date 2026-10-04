import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";
import {Logo} from "@/components/brand/logo";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <Link href="/" aria-label="Waylo" className="w-fit rounded-md">
              <Logo />
            </Link>
            <p className="max-w-md text-sm text-[var(--text-secondary)]">
              {t("subheadline")}
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("partnerLabel")}
            </span>
            <div className="inline-flex items-center">
              <Image
                src="/assets/images/jhic.webp"
                alt={t("jhicAlt")}
                width={828}
                height={97}
                className="h-8 w-auto max-w-full object-contain sm:h-9 md:h-10"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Waylo. {t("rights")}</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="transition-colors hover:text-primary">
              {t("terms")}
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-primary">
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
