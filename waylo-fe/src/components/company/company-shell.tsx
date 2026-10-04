"use client";

import {useTranslations} from "next-intl";
import {AppShell} from "@/components/shell/app-shell";
import {useSession, useLogout} from "@/lib/session/hooks";
import {useRequireSession} from "@/lib/session/use-require-session";
import type {NavItem} from "@/components/shell/pill-nav";
import {useRouter} from "@/i18n/navigation";

export function CompanyShell({children}: {children: React.ReactNode}) {
  const t = useTranslations("nav.company");
  const tc = useTranslations("common");
  const {session} = useSession();
  const logout = useLogout();
  const router = useRouter();
  useRequireSession("company_member");

  const items: NavItem[] = [
    {href: "/company/dashboard", label: t("home")},
    {href: "/company/jobs", label: t("jobs")},
    {href: "/company/candidates", label: t("candidates")},
    {href: "/company/mentor-partners", label: t("mentorPartners")},
    {href: "/company/subscription", label: t("subscription")},
    {href: "/company/profile", label: t("profile")},
  ];

  const menu = [
    {label: t("profile"), onSelect: () => router.push("/company/profile")},
    {label: tc("settings"), onSelect: () => router.push("/company/settings")},
    {label: tc("account"), onSelect: () => router.push("/company/dashboard")},
    {
      label: tc("logout"),
      onSelect: () => {
        logout();
        router.push("/login");
      },
    },
  ];

  return (
    <AppShell
      items={items}
      initials={session?.user.avatarInitials ?? "ND"}
      accountLabel={session?.user.fullName ?? tc("account")}
      menu={menu}
    >
      {children}
    </AppShell>
  );
}