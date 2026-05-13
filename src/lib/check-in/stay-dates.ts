function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

export function getStayNights(checkInDate: string, checkOutDate: string | null | undefined) {
  if (!checkOutDate) {
    return null;
  }

  const checkIn = parseIsoDate(checkInDate);
  const checkOut = parseIsoDate(checkOutDate);

  if (!checkIn || !checkOut) {
    return null;
  }

  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  return nights > 0 ? nights : null;
}

export function formatDisplayDate(value: string) {
  const date = parseIsoDate(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function formatStayRangeWithNights(checkInDate: string, checkOutDate: string | null | undefined) {
  const checkoutLabel = checkOutDate ? formatDisplayDate(checkOutDate) : "No checkout date";
  const nights = getStayNights(checkInDate, checkOutDate);
  const nightsLabel = nights === null ? "nights not set" : `${nights} ${nights === 1 ? "night" : "nights"}`;

  return `${formatDisplayDate(checkInDate)} - ${checkoutLabel} · ${nightsLabel}`;
}
