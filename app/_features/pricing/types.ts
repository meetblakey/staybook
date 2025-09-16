import type { Database } from "@/types/database";

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type PriceRuleRow = Database["public"]["Tables"]["listing_price_rules"]["Row"];
export type CalendarOverrideRow = Database["public"]["Tables"]["calendar_overrides"]["Row"];
export type FeeRuleRow = Database["public"]["Tables"]["fee_rules"]["Row"];
export type TaxRuleRow = Database["public"]["Tables"]["tax_rules"]["Row"];
export type ExchangeRateRow = Database["public"]["Tables"]["exchange_rates"]["Row"];
export type CancellationPolicyRow = Database["public"]["Tables"]["cancellation_policies"]["Row"];

export type PriceRuleKind = Database["public"]["Enums"]["price_rule_kind"];

export type QuoteSource = "base" | "override" | "rule";

export type NightlyRateDetail = {
  date: string; // yyyy-mm-dd
  baseRate: number;
  adjustments: {
    source: QuoteSource;
    reason: string;
    amount: number;
  }[];
  totalRate: number;
};

export type PriceLineItem = {
  code: string;
  label: string;
  amount: number;
  description?: string;
};

export type PriceQuoteBreakdown = {
  currency: string;
  nights: number;
  nightlyDetails: NightlyRateDetail[];
  nightlySubtotal: number;
  extraGuestFees: PriceLineItem[];
  stayFees: PriceLineItem[];
  adjustments: PriceLineItem[];
  taxes: PriceLineItem[];
  totalBeforeTaxes: number;
  totalTaxes: number;
  grandTotal: number;
  conversions?: Array<{
    currency: string;
    rate: number;
    grandTotal: number;
  }>;
};

export type PricingQuoteInput = {
  listing: Pick<
    ListingRow,
    | "price_nightly"
    | "currency"
    | "cleaning_fee"
    | "service_fee"
    | "city"
    | "state"
    | "country"
    | "max_guests"
  >;
  feeRule?: FeeRuleRow | null;
  priceRules?: PriceRuleRow[];
  calendarOverrides?: CalendarOverrideRow[];
  taxRules?: TaxRuleRow[];
  exchangeRates?: ExchangeRateRow[];
  baseCurrency?: string;
  targetCurrency?: string;
  checkIn: Date;
  checkOut: Date;
  quoteCreatedAt?: Date;
  guests?: number;
  pets?: number;
  includePetFee?: boolean;
};

export type TaxMatch = {
  rule: TaxRuleRow;
  matchScore: number;
};
