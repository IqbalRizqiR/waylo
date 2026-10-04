// Locale-aware formatters. No hardcoded "id-ID" or "IDR" in components.

const DEFAULT_LOCALE = "id-ID";
const DEFAULT_CURRENCY = "IDR";

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyRange(
  min: number | null,
  max: number | null,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) {
    return `${formatCurrency(min, currency, locale)} - ${formatCurrency(max, currency, locale)}`;
  }
  return formatCurrency((min ?? max) as number, currency, locale);
}

export function formatLongDate(
  input: string | Date,
  locale: string = DEFAULT_LOCALE,
): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatWeekdayDate(
  input: string | Date,
  locale: string = DEFAULT_LOCALE,
): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
