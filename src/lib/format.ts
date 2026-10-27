const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

/** Formats a rupee amount for display, e.g. `formatINR(1500)` -> `₹1,500.00`. */
export function formatINR(rupees: number): string {
  return inr.format(rupees);
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Formats a calendar day kept as `YYYY-MM-DD` (e.g. a birth date) without going through a
 * timezone-shifted `Date` parse, which can move the day for users west/east of UTC.
 */
export function formatCalendarDate(isoDate: string): string {
  const match = ISO_DATE.exec(isoDate);
  if (!match) throw new Error(`Expected YYYY-MM-DD, got "${isoDate}"`);
  const [, y, m, d] = match.map(Number);
  // Noon UTC keeps the same calendar day in every timezone.
  const date = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1, 12));
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
