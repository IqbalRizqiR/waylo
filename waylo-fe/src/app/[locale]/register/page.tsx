import {setRequestLocale, getTranslations} from "next-intl/server";
import {AuthLayout} from "@/components/auth/auth-layout";
import {RegisterForm} from "@/components/auth/register-form";

export default async function RegisterPage({
  params,
}: PageProps<"/[locale]/register">) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("register");

  return (
    <AuthLayout
      greeting={{
        title: (
          <>
            <span className="text-primary">{t("sideTitleLead")}</span>
            {t("sideTitleAccent")}
          </>
        ),
        body: t("sideBody"),
      }}
      quote={t("quote")}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
