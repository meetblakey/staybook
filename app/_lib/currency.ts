import type { ExchangeRateRow } from "@/app/_features/pricing/types";

const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE || "en";
const DEFAULT_CURRENCY = (process.env.BASE_CURRENCY || "USD").toUpperCase();

export function normalizeCurrency(code?: string | null) {
  return (code ?? DEFAULT_CURRENCY).toUpperCase();
}

export function formatCurrency(amount: number | string, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;

  if (Number.isNaN(value)) {
    return "--";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: normalizeCurrency(currency),
    maximumFractionDigits: 2,
  }).format(value);
}

export function convertCurrency({
  amount,
  from,
  to,
  rates,
}: {
  amount: number;
  from: string;
  to: string;
  rates?: ExchangeRateRow[];
}): { amount: number; rate: number } | null {
  const fromCode = normalizeCurrency(from);
  const toCode = normalizeCurrency(to);

  if (fromCode === toCode) {
    return { amount, rate: 1 };
  }

  if (!rates || rates.length === 0) return null;

  const match = rates.find(
    (rate) => normalizeCurrency(rate.base) === fromCode && normalizeCurrency(rate.quote) === toCode,
  );

  if (!match) return null;

  const rate = Number(match.rate);
  return { amount: Math.round(amount * rate * 100) / 100, rate };
}
