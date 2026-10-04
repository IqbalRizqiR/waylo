import {setRequestLocale, getTranslations} from "next-intl/server";
import {AuthLayout} from "@/components/auth/auth-layout";
import {LoginForm} from "@/components/auth/login-form";

export default async function LoginPage({params}: PageProps<"/[locale]/login">) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("login");

  return (
    <AuthLayout
      greeting={{
        title: <span className="text-primary">{t("sideTitle")}</span>,
        body: t("sideBody"),
      }}
      quote={t("quote")}
      aside={
        <p className="text-center text-base text-[var(--muted-foreground)]">
          {t("noAccount")}{" "}
          <a
            href="mailto:admin@waylo.test?subject=Bantuan%20akses%20akun%20Waylo"
            className="font-medium text-primary hover:underline"
          >
            {t("contactAdmin")}
          </a>
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
