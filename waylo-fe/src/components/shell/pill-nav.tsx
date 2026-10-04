"use client";

import {Link, usePathname} from "@/i18n/navigation";
import {cn} from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
};

export function PillNav({items}: {items: NavItem[]}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="flex items-center gap-1 overflow-x-auto rounded-[var(--radius-pill)] bg-[var(--surface-alt)] p-1 shadow-[var(--shadow-brand)]"
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center whitespace-nowrap rounded-[var(--radius-pill)] px-5 text-sm font-semibold transition-colors duration-150",
              isActive
                ? "bg-primary text-white"
                : "text-primary hover:bg-secondary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}