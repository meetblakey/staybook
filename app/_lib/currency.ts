export function formatCurrency(amount: number | string, currency = "USD") {
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;

  if (Number.isNaN(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
