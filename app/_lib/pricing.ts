import type {
  CalendarOverrideRow,
  ExchangeRateRow,
  FeeRuleRow,
  PriceQuoteBreakdown,
  PriceRuleRow,
  TaxRuleRow,
} from "@/app/_features/pricing/types";
import { calculateDetailedPrice } from "@/app/_features/pricing/engine";

export type PriceBreakdown = {
  nights: number;
  nightlyRate: number;
  baseTotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
};

type LegacyPricingInput = {
  checkIn: Date;
  checkOut: Date;
  nightlyRate: number;
  cleaningFee?: number;
  serviceFee?: number;
  guests?: number;
  pets?: number;
  includePetFee?: boolean;
  listingCurrency?: string;
  priceRules?: PriceRuleRow[];
  calendarOverrides?: CalendarOverrideRow[];
  feeRule?: FeeRuleRow | null;
  taxRules?: TaxRuleRow[];
  exchangeRates?: ExchangeRateRow[];
  targetCurrency?: string;
};

export function calculateStayPrice(params: LegacyPricingInput): PriceBreakdown {
  const detailed: PriceQuoteBreakdown = calculateDetailedPrice({
    listing: {
      price_nightly: params.nightlyRate,
      cleaning_fee: params.cleaningFee ?? 0,
      service_fee: params.serviceFee ?? 0,
      currency: params.listingCurrency ?? null,
      city: null,
      state: null,
      country: null,
      max_guests: params.guests ?? 1,
    },
    feeRule: params.feeRule,
    priceRules: params.priceRules,
    calendarOverrides: params.calendarOverrides,
    taxRules: params.taxRules,
    exchangeRates: params.exchangeRates,
    targetCurrency: params.targetCurrency,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: params.guests,
    pets: params.pets,
    includePetFee: params.includePetFee,
  });

  return {
    nights: detailed.nights,
    nightlyRate: detailed.nightlySubtotal / detailed.nights,
    baseTotal: detailed.nightlySubtotal,
    cleaningFee:
      detailed.stayFees.find((fee) => fee.code === "cleaning_fee")?.amount ?? (params.cleaningFee ?? 0),
    serviceFee:
      detailed.stayFees.find((fee) => fee.code === "service_fee")?.amount ?? (params.serviceFee ?? 0),
    total: detailed.totalBeforeTaxes,
  };
}

export { calculateDetailedPrice } from "@/app/_features/pricing/engine";
