"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {Logo} from "@/components/brand/logo";
import {Icon} from "@/components/ui/icon";
import {InitialsAvatar} from "@/components/ui/avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {PillNav, type NavItem} from "./pill-nav";

export type AccountMenuItem = {
  label: string;
  onSelect: () => void;
};

export function AppShell({
  items,
  initials,
  accountLabel,
  menu,
  children,
}: {
  items: NavItem[];
  initials: string;
  accountLabel?: string;
  menu: AccountMenuItem[];
  children: React.ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-[var(--surface-alt)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/" aria-label="Waylo" className="shrink-0 rounded-md">
            <Logo />
          </Link>
          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <PillNav items={items} />
          </div>
          <div className="flex shrink-0 items-center gap-2 text-primary">
            <button
              type="button"
              aria-label={t("search")}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              <Icon name="mingcute:search-line" className="text-xl" />
            </button>
            <button
              type="button"
              aria-label={t("notifications")}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              <Icon name="mingcute:notification-line" className="text-xl" />
            </button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                aria-label={accountLabel ?? t("account")}
              >
                <InitialsAvatar
                  initials={initials}
                  size="sm"
                  label={accountLabel ?? t("account")}
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 min-w-48 rounded-[var(--radius-card)] border border-border bg-surface p-1 shadow-[var(--shadow-brand-lg)]"
                >
                  {menu.map((item) => (
                    <DropdownMenu.Item
                      key={item.label}
                      onSelect={item.onSelect}
                      className="cursor-pointer rounded-[10px] px-3 py-2 text-sm text-[var(--text-secondary)] outline-none data-[highlighted]:bg-secondary data-[highlighted]:text-primary"
                    >
                      {item.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-6xl justify-center px-5 pb-3 lg:hidden">
          <PillNav items={items} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}