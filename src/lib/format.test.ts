import { formatCalendarDate, formatINR } from '@/lib/format';

describe('formatINR', () => {
  it('uses Indian digit grouping and the rupee sign', () => {
    expect(formatINR(150000)).toBe('₹1,50,000.00');
  });
});

describe('formatCalendarDate', () => {
  it('formats the given calendar day without shifting it', () => {
    expect(formatCalendarDate('2026-11-17')).toBe('17 Nov 2026');
  });

  it('rejects anything that is not YYYY-MM-DD', () => {
    expect(() => formatCalendarDate('17/11/2026')).toThrow(/YYYY-MM-DD/);
  });
});
