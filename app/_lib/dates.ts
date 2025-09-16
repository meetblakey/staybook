import { addDays, format, isValid, parseISO } from "date-fns";

export const DATE_FORMAT = "MMM d, yyyy";

export function formatDate(value?: string | Date, fallback = "--") {
  if (!value) return fallback;
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return fallback;
  return format(date, DATE_FORMAT);
}

export function formatDateRange(start?: string | Date, end?: string | Date) {
  if (!start || !end) return "Select dates";
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function ensureCheckout(checkIn: Date) {
  return addDays(checkIn, 1);
}
