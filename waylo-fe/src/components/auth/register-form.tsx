"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Link, useRouter} from "@/i18n/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {registerSchema, type RegisterInput, type Role} from "@waylo/shared";
import {apiFetch, ApiRequestError} from "@/lib/api/client";
import {writeSession} from "@/lib/session/storage";
import {notifySessionChange} from "@/lib/session/hooks";
import {AuthInput} from "@/components/auth/auth-field";
import {AuthLabel, AuthSubmit} from "@/components/auth/auth-controls";

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    avatarInitials: string;
  };
};

export function RegisterForm() {
  const t = useTranslations("register");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "learner",
      acceptedTerms: true,
    },
  });

  const passwordError = errors.password
    ? errors.password.message === "auth.password.min"
      ? te("auth.password.min")
      : errors.password.message === "auth.password.max"
        ? te("auth.password.max")
        : te("validation")
    : errors.confirmPassword
      ? te("auth.password.mismatch")
      : null;

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    try {
      const session = await apiFetch<AuthResponse>("/auth/register", {
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
      router.push("/learner/dashboard");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFormError(
          error.code === "email_taken" ? te("auth.emailTaken") : error.message,
        );
      } else {
        setFormError(te("generic"));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" noValidate>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-medium leading-[1.15] tracking-[-0.025em] text-black md:text-2xl xl:text-3xl">
          {t("heading")}
        </h1>
        <p className="text-sm font-light leading-snug tracking-[-0.025em] text-[#757575] md:text-base xl:text-lg">
          {t("subheading")}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:mt-5 md:gap-4 xl:mt-6">
        <div className="flex flex-col gap-1.5">
          <AuthLabel htmlFor="fullName">{t("fullNameLabel")}</AuthLabel>
          <AuthInput
            id="fullName"
            icon="mingcute:user-2-line"
            placeholder={t("fullNamePlaceholder")}
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
          />
          {errors.fullName ? (
            <p id="fullName-error" className="text-xs text-destructive md:text-sm">
              {te("auth.fullName.required")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <AuthLabel htmlFor="email">{t("emailLabel")}</AuthLabel>
          <AuthInput
            id="email"
            type="email"
            icon="mingcute:mail-line"
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
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
            type="password"
            icon="mingcute:lock-line"
            placeholder={t("passwordPlaceholder")}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={passwordError ? "password-error" : undefined}
            {...register("password")}
          />
          {passwordError ? (
            <p id="password-error" className="text-xs text-destructive md:text-sm">
              {passwordError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <AuthLabel htmlFor="confirmPassword">{t("confirmPasswordLabel")}</AuthLabel>
          <AuthInput
            id="confirmPassword"
            type="password"
            icon="mingcute:lock-line"
            placeholder={t("confirmPasswordPlaceholder")}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p id="confirmPassword-error" className="text-xs text-destructive md:text-sm">
              {te("auth.password.mismatch")}
            </p>
          ) : null}
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2.5 text-xs font-light leading-snug tracking-[-0.025em] text-[#757575] md:mt-4 md:gap-3 md:text-sm xl:text-base">
        <input
          type="checkbox"
          className="size-5 shrink-0 rounded accent-[var(--primary)] md:size-6"
          defaultChecked
          {...register("acceptedTerms")}
        />
        <span>
          {t("termsPrefix")}{" "}
          <Link href="/terms" className="font-medium text-primary hover:underline">
            {t("termsLink")}
          </Link>{" "}
          {t("and")}{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            {t("privacyLink")}
          </Link>{" "}
          {t("termsSuffix")}
        </span>
      </label>

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

      <p className="mt-3 text-center text-xs text-[var(--muted-foreground)] md:mt-4 md:text-sm">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}
