"use client";

import {useState} from "react";
import {useRouter} from "@/i18n/navigation";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {loginSchema, type LoginInput, type Role} from "@waylo/shared";
import {apiFetch, ApiRequestError} from "@/lib/api/client";
import {writeSession} from "@/lib/session/storage";
import {notifySessionChange} from "@/lib/session/hooks";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {AuthInput} from "@/components/auth/auth-field";
import {AuthLabel, AuthSubmit} from "@/components/auth/auth-controls";

type AuthResponse = {
  accessToken: string;
  user: {id: string; email: string; fullName: string; role: Role; avatarInitials: string};
};

export function LoginForm() {
  const t = useTranslations("login");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {email: "", password: ""},
  });

  function messageFor(code?: string, fallback?: string): string {
    if (code === "invalid_credentials") {
      return te("auth.invalidCredentials");
    } else if (code === "invalid_email") {
      return te("auth.invalidEmail");
    }
    return fallback ?? te("generic");
  }

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    try {
      const session = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      writeSession({
        accessToken: session.accessToken,
        user: {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.fullName,
          role: session.user.role,
          avatarInitials: session.user.avatarInitials,
        },
      });
      notifySessionChange();
      const destination =
        session.user.role === "company_member"
          ? "/company/dashboard"
          : session.user.role === "mentor"
          ? "/mentor/dashboard"
          : session.user.role === "admin"
          ? "/admin/dashboard"
          : "/learner/dashboard";
      router.push(destination);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFormError(messageFor(error.code, error.message));
      } else {
        setFormError(te("generic"));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" noValidate>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-medium leading-[1.15] tracking-[-0.025em] text-black md:text-2xl xl:text-3xl">
          {t("headingLead")}
          <span className="text-primary">{t("headingAccent")}</span>
        </h1>
        <p className="text-sm font-light leading-snug tracking-[-0.025em] text-[#757575] md:text-base xl:text-lg">
          {t("subheading")}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:mt-5 md:gap-4 xl:mt-6 xl:gap-5">
        <div className="flex flex-col gap-1.5">
          <AuthLabel htmlFor="email">{t("emailLabel")}</AuthLabel>
          <AuthInput
            id="email"
            type="email"
            icon="mingcute:user-2-line"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" className="text-xs text-destructive md:text-sm">
              {te("auth.email.invalid")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <AuthLabel htmlFor="password">{t("passwordLabel")}</AuthLabel>
          <AuthInput
            id="password"
            type={showPassword ? "text" : "password"}
            icon="mingcute:lock-line"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                aria-pressed={showPassword}
                className="inline-flex size-8 items-center justify-center rounded-full text-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              >
                <Icon
                  name={showPassword ? "mingcute:eye-close-line" : "mingcute:eye-2-line"}
                  className="text-lg md:text-xl"
                />
              </button>
            }
            {...register("password")}
          />
          {errors.password ? (
            <p id="password-error" className="text-xs text-destructive md:text-sm">
              {te("auth.passwordRequired")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex justify-end md:mt-3">
        <a
          href="mailto:admin@waylo.test?subject=Bantuan%20reset%20kata%20sandi"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline md:text-base"
        >
          {t("forgotPassword")}
        </a>
      </div>

      {formError ? (
        <p
          role="alert"
          className="mt-3 rounded-[var(--radius-card)] bg-[#ffe4e9] px-4 py-2.5 text-xs text-destructive md:text-sm"
        >
          {formError}
        </p>
      ) : null}

      <AuthSubmit type="submit" className="mt-4 md:mt-5 xl:mt-6" disabled={isSubmitting}>
        {isSubmitting ? tc("loading") : t("submit")}
      </AuthSubmit>

      <div className="my-3 flex items-center gap-3 text-xs text-[var(--muted-foreground)] md:my-4 md:gap-4 md:text-sm">
        <span className="h-px flex-1 bg-border" />
        {t("divider")}
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <SocialButton icon="flat-color-icons:google" label={t("google")} />
        <SocialButton icon="thesvg-color:linkedin" label={t("linkedin")} />
      </div>
    </form>
  );
}

function SocialButton({icon, label}: {icon: string; label: string}) {
  const tc = useTranslations("common");
  return (
    <Button type="button" variant="outline" size="sm" className="w-full" disabled>
      <Icon name={icon} className="text-lg" />
      <span className="hidden sm:inline">{label}</span>
      <span className="text-[10px] font-normal text-[var(--muted-foreground)] md:text-xs">
        ({tc("comingSoon")})
      </span>
    </Button>
  );
}
