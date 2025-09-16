import { addDays, differenceInCalendarDays, eachDayOfInterval, formatISO, isFriday, isSaturday } from "date-fns";

import type {
  ExchangeRateRow,
  FeeRuleRow,
  PriceLineItem,
  PriceQuoteBreakdown,
  PriceRuleRow,
  PricingQuoteInput,
  TaxMatch,
  TaxRuleRow,
} from "@/app/_features/pricing/types";

const DEFAULT_BASE_CURRENCY = process.env.BASE_CURRENCY || "USD";
const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE || "en";

const WEEKEND_CHECKERS = [isFriday, isSaturday];

const LOWER_BOUND_INCLUSIVE_REGEX = /^[\[(]/;
const UPPER_BOUND_INCLUSIVE_REGEX = /[\])]$/;

const ONE_HUNDRED = 100;
const BASIS_POINT = 10000;

function parseRangeBoundary(value: string | null | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-") return null;
  return new Date(trimmed);
}

function parsePgDateRange(range: string | null): { lower: Date | null; upper: Date | null; lowerInclusive: boolean; upperInclusive: boolean } {
  if (!range) {
    return { lower: null, upper: null, lowerInclusive: true, upperInclusive: false };
  }

  const lowerInclusive = LOWER_BOUND_INCLUSIVE_REGEX.test(range);
  const upperInclusive = UPPER_BOUND_INCLUSIVE_REGEX.test(range);
  const withoutBrackets = range.slice(1, -1);
  const [rawLower, rawUpper] = withoutBrackets.split(",");

  return {
    lower: parseRangeBoundary(rawLower),
    upper: parseRangeBoundary(rawUpper),
    lowerInclusive,
    upperInclusive,
  };
}

function isDateWithinRange(date: Date, range: string | null): boolean {
  const parsed = parsePgDateRange(range);
  if (!parsed.lower && !parsed.upper) return false;

  if (parsed.lower) {
    if (parsed.lowerInclusive) {
      if (date < parsed.lower) return false;
    } else if (date <= parsed.lower) {
      return false;
    }
  }

  if (parsed.upper) {
    if (parsed.upperInclusive) {
      if (date > parsed.upper) return false;
    } else if (date >= parsed.upper) {
      return false;
    }
  }

  return true;
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function getListingCurrency(listingCurrency?: string | null): string {
  return (listingCurrency || DEFAULT_BASE_CURRENCY || "USD").toUpperCase();
}

function isWeekend(date: Date): boolean {
  return WEEKEND_CHECKERS.some((checker) => checker(date));
}

function resolveTaxRule(listing: PricingQuoteInput["listing"], rules: TaxRuleRow[] | undefined): TaxRuleRow | null {
  if (!rules || rules.length === 0) return null;
  const normalizedCity = (listing.city ?? "").toLowerCase();
  const normalizedState = (listing.state ?? "").toLowerCase();
  const normalizedCountry = (listing.country ?? "").toLowerCase();

  const matches: TaxMatch[] = [];

  for (const rule of rules) {
    let score = 0;
    if (rule.country) {
      if (rule.country.toLowerCase() !== normalizedCountry) continue;
      score += 4;
    }
    if (rule.state) {
      if (rule.state.toLowerCase() !== normalizedState) continue;
      score += 2;
    }
    if (rule.city) {
      if (rule.city.toLowerCase() !== normalizedCity) continue;
      score += 1;
    }
    matches.push({ rule, matchScore: score });
  }

  if (matches.length === 0) return null;
  matches.sort((a, b) => b.matchScore - a.matchScore);
  return matches[0].rule;
}

function computeCurrencyConversions({
  baseCurrency,
  targetCurrency,
  grandTotal,
  exchangeRates,
}: {
  baseCurrency: string;
  targetCurrency?: string;
  grandTotal: number;
  exchangeRates?: ExchangeRateRow[];
}): PriceQuoteBreakdown["conversions"] {
  if (!targetCurrency || targetCurrency.toUpperCase() === baseCurrency.toUpperCase()) {
    return undefined;
  }

  if (!exchangeRates || exchangeRates.length === 0) {
    return undefined;
  }

  const match = exchangeRates.find(
    (rate) =>
      rate.base.toUpperCase() === baseCurrency.toUpperCase() && rate.quote.toUpperCase() === targetCurrency.toUpperCase(),
  );

  if (!match) return undefined;

  const convertedTotal = roundToCents(Number(match.rate) * grandTotal);

  return [
    {
      currency: targetCurrency.toUpperCase(),
      rate: Number(match.rate),
      grandTotal: convertedTotal,
    },
  ];
}

function computeNightlyRates(
  input: PricingQuoteInput,
): {
  nightlyDetails: PriceQuoteBreakdown["nightlyDetails"];
  nightlySubtotal: number;
} {
  const baseNightlyRate = Number(input.listing.price_nightly ?? 0);
  const calendarMap = new Map(
    (input.calendarOverrides ?? []).map((override) => [override.date, Number(override.price)]),
  );

  const rules = input.priceRules ?? [];

  const nightlyDetails = eachDayOfInterval({ start: input.checkIn, end: addDays(input.checkOut, -1) }).map((date) => {
    const isoDate = formatISO(date, { representation: "date" });
    const adjustments: PriceQuoteBreakdown["nightlyDetails"][number]["adjustments"] = [];
    let nightlyTotal = baseNightlyRate;

    const overridePrice = calendarMap.get(isoDate);
    if (typeof overridePrice === "number") {
      adjustments.push({ source: "override", reason: "Calendar override", amount: overridePrice - nightlyTotal });
      nightlyTotal = overridePrice;
    }

    for (const rule of rules) {
      switch (rule.kind) {
        case "weekend_markup": {
          if (!isWeekend(date)) break;
          const delta = rule.is_percent
            ? (nightlyTotal * Number(rule.amount)) / ONE_HUNDRED
            : Number(rule.amount);
          if (delta !== 0) {
            nightlyTotal = roundToCents(nightlyTotal + delta);
            adjustments.push({
              source: "rule",
              reason: "Weekend rate",
              amount: delta,
            });
          }
          break;
        }
        case "seasonal": {
          if (!isDateWithinRange(date, rule.date_range)) break;
          const delta = rule.is_percent
            ? (nightlyTotal * Number(rule.amount)) / ONE_HUNDRED
            : Number(rule.amount);
          if (delta !== 0) {
            nightlyTotal = roundToCents(nightlyTotal + delta);
            adjustments.push({
              source: "rule",
              reason: "Seasonal adjustment",
              amount: delta,
            });
          }
          break;
        }
        case "last_minute":
        case "early_bird":
        case "length_of_stay":
        case "extra_guest":
        case "pet_fee":
          // Handled at stay-level
          break;
        default:
          break;
      }
    }

    return {
      date: isoDate,
      baseRate: baseNightlyRate,
      adjustments,
      totalRate: nightlyTotal,
    };
  });

  const nightlySubtotal = roundToCents(
    nightlyDetails.reduce((sum, night) => sum + night.totalRate, 0),
  );

  return { nightlyDetails, nightlySubtotal };
}

function computeStayAdjustments({
  rules,
  nightlySubtotal,
  nights,
  checkIn,
  quoteCreatedAt,
}: {
  rules: PriceRuleRow[];
  nightlySubtotal: number;
  nights: number;
  checkIn: Date;
  quoteCreatedAt: Date;
}): PriceLineItem[] {
  const adjustments: PriceLineItem[] = [];
  for (const rule of rules) {
    switch (rule.kind) {
      case "length_of_stay": {
        if (rule.min_nights && nights < rule.min_nights) break;
        const amount = rule.is_percent
          ? (nightlySubtotal * Number(rule.amount)) / ONE_HUNDRED
          : Number(rule.amount);
        if (amount !== 0) {
          adjustments.push({
            code: "length_of_stay",
            label: `Length of stay adjustment`,
            amount: roundToCents(amount),
          });
        }
        break;
      }
      case "last_minute": {
        if (!rule.threshold_days) break;
        const daysUntil = differenceInCalendarDays(checkIn, quoteCreatedAt);
        if (daysUntil > rule.threshold_days) break;
        const amount = rule.is_percent
          ? (nightlySubtotal * Number(rule.amount)) / ONE_HUNDRED
          : Number(rule.amount);
        if (amount !== 0) {
          adjustments.push({
            code: "last_minute",
            label: `Last minute adjustment`,
            amount: roundToCents(amount),
          });
        }
        break;
      }
      case "early_bird": {
        if (!rule.threshold_days) break;
        const daysUntil = differenceInCalendarDays(checkIn, quoteCreatedAt);
        if (daysUntil < rule.threshold_days) break;
        const amount = rule.is_percent
          ? (nightlySubtotal * Number(rule.amount)) / ONE_HUNDRED
          : Number(rule.amount);
        if (amount !== 0) {
          adjustments.push({
            code: "early_bird",
            label: `Early bird adjustment`,
            amount: roundToCents(amount),
          });
        }
        break;
      }
      default:
        break;
    }
  }
  return adjustments;
}

function computeExtraGuestFees({
  rules,
  feeRule,
  guests,
  listing,
  nights,
  averageNightly,
}: {
  rules: PriceRuleRow[];
  feeRule?: FeeRuleRow | null;
  guests: number;
  listing: PricingQuoteInput["listing"];
  nights: number;
  averageNightly: number;
}): PriceLineItem[] {
  if (!guests || guests <= 0) return [];
  let threshold = listing.max_guests ?? guests;
  let amountPerNight = 0;
  let description = "Extra guest fee";

  const rule = rules.find((r) => r.kind === "extra_guest");
  if (rule) {
    if (rule.extra_guest_threshold) {
      threshold = rule.extra_guest_threshold;
    }
    if (rule.is_percent) {
      amountPerNight = (averageNightly * Number(rule.amount)) / ONE_HUNDRED;
      description = "Extra guest percentage fee";
    } else {
      amountPerNight = Number(rule.amount);
    }
  } else if (feeRule?.extra_guest_fee) {
    amountPerNight = Number(feeRule.extra_guest_fee);
    if (feeRule.service_fee_bps) {
      // no-op, using provided value
    }
  }

  const extraGuests = Math.max(0, guests - threshold);
  if (extraGuests <= 0 || amountPerNight <= 0) return [];

  const total = roundToCents(amountPerNight * nights * extraGuests);
  return [
    {
      code: "extra_guest",
      label: description,
      amount: total,
      description: `${extraGuests} guest(s) over threshold of ${threshold}`,
    },
  ];
}

function computeStayFees({
  feeRule,
  listing,
  nightlySubtotal,
  pets,
  includePetFee,
}: {
  feeRule?: FeeRuleRow | null;
  listing: PricingQuoteInput["listing"];
  nightlySubtotal: number;
  pets?: number;
  includePetFee?: boolean;
}): PriceLineItem[] {
  const fees: PriceLineItem[] = [];
  const cleaning = Number(feeRule?.cleaning_fee ?? listing.cleaning_fee ?? 0);
  if (cleaning > 0) {
    fees.push({ code: "cleaning_fee", label: "Cleaning fee", amount: roundToCents(cleaning) });
  }

  if (feeRule?.service_fee_bps) {
    const service = roundToCents((nightlySubtotal * Number(feeRule.service_fee_bps)) / BASIS_POINT);
    if (service > 0) {
      fees.push({
        code: "service_fee",
        label: "Service fee",
        amount: service,
        description: `${feeRule.service_fee_bps} bps on nightly subtotal`,
      });
    }
  } else {
    const service = Number(listing.service_fee ?? 0);
    if (service > 0) {
      fees.push({ code: "service_fee", label: "Service fee", amount: roundToCents(service) });
    }
  }

  if (feeRule?.security_deposit) {
    const deposit = Number(feeRule.security_deposit);
    if (deposit > 0) {
      fees.push({ code: "security_deposit", label: "Security deposit", amount: roundToCents(deposit) });
    }
  }

  if (includePetFee && pets && pets > 0 && feeRule?.pet_fee) {
    const petFeeTotal = roundToCents(Number(feeRule.pet_fee) * pets);
    if (petFeeTotal > 0) {
      fees.push({ code: "pet_fee", label: "Pet fee", amount: petFeeTotal, description: `${pets} pet(s)` });
    }
  }

  return fees;
}

function computeTaxes({
  listing,
  nightlySubtotal,
  adjustments,
  extraFees,
  stayFees,
  taxRules,
}: {
  listing: PricingQuoteInput["listing"];
  nightlySubtotal: number;
  adjustments: PriceLineItem[];
  extraFees: PriceLineItem[];
  stayFees: PriceLineItem[];
  taxRules?: TaxRuleRow[];
}): PriceLineItem[] {
  const rule = resolveTaxRule(listing, taxRules);
  if (!rule) return [];

  const base = nightlySubtotal + adjustments.reduce((sum, item) => sum + item.amount, 0) + extraFees.reduce((sum, item) => sum + item.amount, 0) + stayFees.reduce((sum, item) => sum + item.amount, 0);

  const pct = Number(rule.occupancy_tax_pct ?? 0);
  if (pct <= 0) return [];

  const amount = roundToCents((base * pct) / ONE_HUNDRED);
  if (amount <= 0) return [];

  return [
    {
      code: "occupancy_tax",
      label: "Occupancy tax",
      amount,
      description: `${pct}% based on location`,
    },
  ];
}

export function calculateDetailedPrice(input: PricingQuoteInput): PriceQuoteBreakdown {
  const nights = Math.max(1, differenceInCalendarDays(input.checkOut, input.checkIn));
  const quoteCreatedAt = input.quoteCreatedAt ?? new Date();
  const { nightlyDetails, nightlySubtotal } = computeNightlyRates(input);

  const averageNightly = nightlySubtotal / nights;

  const adjustments = computeStayAdjustments({
    rules: input.priceRules ?? [],
    nightlySubtotal,
    nights,
    checkIn: input.checkIn,
    quoteCreatedAt,
  });

  const extraGuestFees = computeExtraGuestFees({
    rules: input.priceRules ?? [],
    feeRule: input.feeRule,
    guests: input.guests ?? 0,
    listing: input.listing,
    nights,
    averageNightly,
  });

  const stayFees = computeStayFees({
    feeRule: input.feeRule,
    listing: input.listing,
    nightlySubtotal,
    pets: input.pets,
    includePetFee: input.includePetFee,
  });

  const totalBeforeTaxes = roundToCents(
    nightlySubtotal +
      adjustments.reduce((sum, item) => sum + item.amount, 0) +
      extraGuestFees.reduce((sum, item) => sum + item.amount, 0) +
      stayFees.reduce((sum, item) => sum + item.amount, 0),
  );

  const taxes = computeTaxes({
    listing: input.listing,
    nightlySubtotal,
    adjustments,
    extraFees: extraGuestFees,
    stayFees,
    taxRules: input.taxRules,
  });

  const totalTaxes = roundToCents(taxes.reduce((sum, item) => sum + item.amount, 0));
  const grandTotal = roundToCents(totalBeforeTaxes + totalTaxes);

  const baseCurrency = getListingCurrency(input.listing.currency);
  const conversions = computeCurrencyConversions({
    baseCurrency,
    targetCurrency: input.targetCurrency,
    grandTotal,
    exchangeRates: input.exchangeRates,
  });

  return {
    currency: baseCurrency,
    nights,
    nightlyDetails,
    nightlySubtotal,
    extraGuestFees,
    stayFees,
    adjustments,
    taxes,
    totalBeforeTaxes,
    totalTaxes,
    grandTotal,
    conversions,
  };
}

export function formatQuoteForDisplay(breakdown: PriceQuoteBreakdown, locale: string = DEFAULT_LOCALE) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: breakdown.currency,
  });
  return {
    ...breakdown,
    formattedTotals: {
      subtotal: formatter.format(breakdown.totalBeforeTaxes),
      taxes: formatter.format(breakdown.totalTaxes),
      total: formatter.format(breakdown.grandTotal),
    },
  };
}
