"use client";

import {useTranslations} from "next-intl";
import {AppShell} from "@/components/shell/app-shell";
import {useSession, useLogout} from "@/lib/session/hooks";
import {useRequireSession} from "@/lib/session/use-require-session";
import type {NavItem} from "@/components/shell/pill-nav";
import {useRouter} from "@/i18n/navigation";

export function LearnerShell({children}: {children: React.ReactNode}) {
  const t = useTranslations("nav.learner");
  const tc = useTranslations("common");
  const {session} = useSession();
  const logout = useLogout();
  const router = useRouter();
  useRequireSession("learner");

  const items: NavItem[] = [
    {href: "/learner/dashboard", label: t("home")},
    {href: "/learner/roadmap", label: t("roadmap")},
    {href: "/learner/skill-gap", label: t("skillGap")},
    {href: "/learner/courses", label: t("courses")},
    {href: "/learner/projects", label: t("projects")},
    {href: "/learner/assessments", label: t("assessments")},
    {href: "/learner/mentors", label: t("mentors")},
    {href: "/learner/certificates", label: t("certificates")},
    {href: "/learner/careers", label: t("careers")},
    {href: "/learner/subscription", label: t("subscription")},
    {href: "/learner/profile", label: t("profile")},
  ];

  const menu = [
    {label: t("profile"), onSelect: () => router.push("/learner/profile")},
    {label: tc("settings"), onSelect: () => router.push("/learner/settings")},
    {label: tc("account"), onSelect: () => router.push("/learner/dashboard")},
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
      initials={session?.user.avatarInitials ?? "KA"}
      accountLabel={session?.user.fullName ?? tc("account")}
      menu={menu}
    >
      {children}
    </AppShell>
  );
}