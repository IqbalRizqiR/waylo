"use client";

import {useTranslations} from "next-intl";
import {AppShell} from "@/components/shell/app-shell";
import {useSession, useLogout} from "@/lib/session/hooks";
import {useRequireSession} from "@/lib/session/use-require-session";
import type {NavItem} from "@/components/shell/pill-nav";
import {useRouter} from "@/i18n/navigation";

export function MentorShell({children}: {children: React.ReactNode}) {
  const t = useTranslations("nav.mentor");
  const tc = useTranslations("common");
  const {session} = useSession();
  const logout = useLogout();
  const router = useRouter();
  useRequireSession("mentor");

  const items: NavItem[] = [
    {href: "/mentor/dashboard", label: t("home")},
    {href: "/mentor/reviews", label: t("reviews")},
    {href: "/mentor/courses", label: t("courses")},
    {href: "/mentor/profile", label: t("profile")},
  ];

  const menu = [
    {label: t("profile"), onSelect: () => router.push("/mentor/profile")},
    {label: tc("account"), onSelect: () => router.push("/mentor/dashboard")},
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
      initials={session?.user.avatarInitials ?? "MN"}
      accountLabel={session?.user.fullName ?? tc("account")}
      menu={menu}
    >
      {children}
    </AppShell>
  );
}
