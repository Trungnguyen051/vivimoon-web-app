import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { formatCount, formatPrice, formatPublishedDate } from './format';

describe('formatCount', () => {
  it('shortens thousands the way the storefront writes them', () => {
    expect(formatCount(3200, 'vi')).toBe('3,2k');
    expect(formatCount(128000, 'en')).toBe('128k');
    expect(formatCount(2000, 'en')).toBe('2k');
  });

  it('leaves small counts whole', () => {
    expect(formatCount(940, 'vi')).toBe('940');
  });
});

describe('formatPrice', () => {
  it('writes VND the way the storefront does, in both locales', () => {
    expect(formatPrice(95000, 'VND', 'vi')).toBe('95.000₫');
    expect(formatPrice(95000, 'VND', 'en')).toBe('95.000₫');
    expect(formatPrice(1250000, 'VND', 'en')).toBe('1.250.000₫');
  });
  it('formats USD with dollar sign for en', () => {
    expect(formatPrice(25, 'USD', 'en')).toBe('$25.00');
  });
});

describe('formatPublishedDate', () => {
  /* Stubbed for the whole file, not inside the one test that needs it.
     `formatPublishedDate` caches a formatter per locale on first use, so a zone set
     after some other test had already formatted an `en` date would arrive too late and
     this guard would pass without checking anything. Set here, it holds whatever the
     call order turns out to be. */
  const original = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = 'America/Los_Angeles';
  });
  afterAll(() => {
    process.env.TZ = original;
  });

  it('dates a plain date in UTC, so it never slips to the day before', () => {
    /* A `publishedAt` is a plain date, which parses as UTC midnight. Formatted in a
       zone west of UTC it would read as the previous day, and an article would appear
       to predate itself — which is what this zone reproduces. */
    expect(formatPublishedDate('2026-03-01', 'en')).toContain('March 1');
  });

  it("formats in the reader's own locale", () => {
    expect(formatPublishedDate('2026-03-01', 'vi')).toContain('2026');
    expect(formatPublishedDate('2026-03-01', 'en')).toContain('2026');
    expect(formatPublishedDate('2026-03-01', 'vi')).not.toBe(formatPublishedDate('2026-03-01', 'en'));
  });
});
