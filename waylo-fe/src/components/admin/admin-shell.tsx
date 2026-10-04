"use client";

import {useTranslations} from "next-intl";
import {AppShell} from "@/components/shell/app-shell";
import {useSession, useLogout} from "@/lib/session/hooks";
import {useRequireSession} from "@/lib/session/use-require-session";
import type {NavItem} from "@/components/shell/pill-nav";
import {useRouter} from "@/i18n/navigation";

export function AdminShell({children}: {children: React.ReactNode}) {
  const t = useTranslations("nav.admin");
  const tc = useTranslations("common");
  const {session} = useSession();
  const logout = useLogout();
  const router = useRouter();
  useRequireSession("admin");

  const items: NavItem[] = [
    {href: "/admin/dashboard", label: t("home")},
    {href: "/admin/users", label: t("users")},
    {href: "/admin/skills", label: t("skills")},
    {href: "/admin/careers", label: t("careers")},
    {href: "/admin/courses", label: t("courses")},
    {href: "/admin/assessments", label: t("assessments")},
  ];

  const menu = [
    {label: tc("account"), onSelect: () => router.push("/admin/dashboard")},
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
      initials={session?.user.avatarInitials ?? "AD"}
      accountLabel={session?.user.fullName ?? "Administrator"}
      menu={menu}
    >
      {children}
    </AppShell>
  );
}
