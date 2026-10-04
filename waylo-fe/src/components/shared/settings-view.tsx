"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {useApiMutation} from "@/lib/query/hooks";
import {useSession, useLogout} from "@/lib/session/hooks";
import type {ChangePasswordInput} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Icon} from "@/components/ui/icon";
import {PageHeader} from "@/components/shared/page-header";

export function SettingsView({role}: {role: "learner" | "company"}) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const {session} = useSession();
  const logout = useLogout();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification preferences state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  const changePasswordMutation = useApiMutation<{success: boolean}, ChangePasswordInput>({
    mapVariables: (body) => ({
      path: "/auth/change-password",
      method: "PATCH",
      body,
    }),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    },
    onError: (err) => {
      setPasswordError(err.message || t("changePasswordFailed"));
    },
  });

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordMismatch"));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t("passwordTooShort"));
      return;
    }
    setPasswordError(null);
    void changePasswordMutation.mutateAsync({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }

  function handleSavePreferences() {
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Account Info Card */}
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-lg font-medium text-black">{t("accountInfoTitle")}</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">{t("emailLabel")}</span>
              <p className="font-medium text-black">{session?.user.email ?? "-"}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">{t("roleLabel")}</span>
              <p className="font-medium text-black capitalize">
                {role === "learner" ? t("roleLearner") : t("roleCompany")}
              </p>
            </div>
          </div>

          <div className="mt-auto border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Icon name="mingcute:exit-line" className="mr-1 text-base" />
              {tc("logout")}
            </Button>
          </div>
        </Card>

        {/* Settings Forms */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* Security / Password Card */}
          <Card className="p-6 sm:p-8">
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-medium text-black">{t("securityTitle")}</h2>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {t("securitySubtitle")}
                </p>
              </div>

              {passwordSuccess ? (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-success">
                  <Icon name="mingcute:check-circle-line" className="text-lg" />
                  <span>{t("passwordSuccess")}</span>
                </div>
              ) : null}

              {passwordError ? (
                <p role="alert" className="rounded-xl bg-[#ffe4e9] p-3 text-sm text-destructive">
                  {passwordError}
                </p>
              ) : null}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="currentPassword" className="text-sm font-medium text-primary">
                    {t("currentPasswordLabel")}
                  </label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary hover:opacity-80"
                      aria-label="Toggle password visibility"
                    >
                      <Icon
                        name={showCurrent ? "mingcute:eye-close-line" : "mingcute:eye-2-line"}
                        className="text-lg"
                      />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="newPassword" className="text-sm font-medium text-primary">
                    {t("newPasswordLabel")}
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary hover:opacity-80"
                      aria-label="Toggle password visibility"
                    >
                      <Icon
                        name={showNew ? "mingcute:eye-close-line" : "mingcute:eye-2-line"}
                        className="text-lg"
                      />
                    </button>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {t("passwordMinLength")}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-primary">
                    {t("confirmPasswordLabel")}
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword}
                  size="sm"
                >
                  {changePasswordMutation.isPending ? tc("loading") : t("updatePasswordCTA")}
                </Button>
              </div>
            </form>
          </Card>

          {/* Notification Preferences Card */}
          <Card className="flex flex-col gap-5 p-6 sm:p-8">
            <div>
              <h2 className="text-xl font-medium text-black">{t("notificationsTitle")}</h2>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                {t("notificationsSubtitle")}
              </p>
            </div>

            {prefSaved ? (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-success">
                <Icon name="mingcute:check-circle-line" />
                <span>{t("prefSaved")}</span>
              </div>
            ) : null}

            <div className="flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="mt-1 size-4 rounded accent-primary"
                />
                <div>
                  <span className="text-sm font-medium text-black">
                    {t("emailAlertsLabel")}
                  </span>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t("emailAlertsHint")}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={(e) => setEmailUpdates(e.target.checked)}
                  className="mt-1 size-4 rounded accent-primary"
                />
                <div>
                  <span className="text-sm font-medium text-black">
                    {t("emailUpdatesLabel")}
                  </span>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t("emailUpdatesHint")}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailMarketing}
                  onChange={(e) => setEmailMarketing(e.target.checked)}
                  className="mt-1 size-4 rounded accent-primary"
                />
                <div>
                  <span className="text-sm font-medium text-black">
                    {t("emailMarketingLabel")}
                  </span>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t("emailMarketingHint")}
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={handleSavePreferences}>
                {tc("save")}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
