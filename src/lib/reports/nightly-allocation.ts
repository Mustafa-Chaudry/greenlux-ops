const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const dayMs = 86_400_000;

export type NightlyAllocation = {
  totalBookedNights: number;
  overlappingNights: number;
  clippedStartDate: string | null;
  clippedEndDate: string | null;
  crossesReportRange: boolean;
};

export function parseReportDate(value: string | null | undefined) {
  if (!value || !isoDatePattern.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatReportDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addReportDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function diffNights(start: Date, end: Date) {
  return Math.max(Math.round((end.getTime() - start.getTime()) / dayMs), 0);
}

export function getReportRangeNights(startDate: string, endDate: string) {
  const start = parseReportDate(startDate);
  const end = parseReportDate(endDate);

  if (!start || !end || start > end) {
    return 0;
  }

  return diffNights(start, addReportDays(end, 1));
}

export function getStayOverlapAllocation({
  checkInDate,
  checkOutDate,
  rangeStartDate,
  rangeEndDate,
}: {
  checkInDate: string | null | undefined;
  checkOutDate: string | null | undefined;
  rangeStartDate: string;
  rangeEndDate: string;
}): NightlyAllocation {
  const checkIn = parseReportDate(checkInDate);
  const checkOut = parseReportDate(checkOutDate);
  const rangeStart = parseReportDate(rangeStartDate);
  const rangeEnd = parseReportDate(rangeEndDate);

  if (!checkIn || !rangeStart || !rangeEnd || rangeStart > rangeEnd) {
    return {
      totalBookedNights: 0,
      overlappingNights: 0,
      clippedStartDate: null,
      clippedEndDate: null,
      crossesReportRange: false,
    };
  }

  const rangeEndExclusive = addReportDays(rangeEnd, 1);
  const effectiveCheckOut = checkOut && checkOut > checkIn ? checkOut : rangeEndExclusive;
  const totalBookedNights = diffNights(checkIn, effectiveCheckOut);
  const clippedStart = checkIn > rangeStart ? checkIn : rangeStart;
  const clippedEnd = effectiveCheckOut < rangeEndExclusive ? effectiveCheckOut : rangeEndExclusive;
  const overlappingNights = clippedEnd > clippedStart ? diffNights(clippedStart, clippedEnd) : 0;

  return {
    totalBookedNights,
    overlappingNights,
    clippedStartDate: overlappingNights > 0 ? formatReportDate(clippedStart) : null,
    clippedEndDate: overlappingNights > 0 ? formatReportDate(clippedEnd) : null,
    crossesReportRange: checkIn < rangeStart || effectiveCheckOut > rangeEndExclusive,
  };
}

export function allocateAmountByNights(amount: number, allocation: NightlyAllocation) {
  if (amount <= 0 || allocation.totalBookedNights <= 0 || allocation.overlappingNights <= 0) {
    return 0;
  }

  return Math.round((amount * allocation.overlappingNights) / allocation.totalBookedNights);
}
