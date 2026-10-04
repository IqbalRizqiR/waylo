import {defineRouting} from "next-intl/routing";
import {DEFAULT_LOCALE, LOCALES} from "@waylo/shared";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];