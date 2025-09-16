import { differenceInCalendarDays } from "date-fns";

export type PriceBreakdown = {
  nights: number;
  nightlyRate: number;
  baseTotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
};

export function calculateStayPrice(params: {
  checkIn: Date;
  checkOut: Date;
  nightlyRate: number;
  cleaningFee?: number;
  serviceFee?: number;
}) {
  const nights = Math.max(1, differenceInCalendarDays(params.checkOut, params.checkIn));
  const nightlyRate = params.nightlyRate;
  const cleaningFee = params.cleaningFee ?? 0;
  const serviceFee = params.serviceFee ?? 0;

  const baseTotal = nights * nightlyRate;
  const total = baseTotal + cleaningFee + serviceFee;

  const breakdown: PriceBreakdown = {
    nights,
    nightlyRate,
    baseTotal,
    cleaningFee,
    serviceFee,
    total,
  };

  return breakdown;
}
