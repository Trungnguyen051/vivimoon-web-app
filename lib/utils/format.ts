export function toIntlLocale(locale: 'en' | 'vi'): string {
  return locale === 'vi' ? 'vi-VN' : 'en-US';
}

export function formatPrice(
  amount: number,
  currency: 'VND' | 'USD',
  locale: 'en' | 'vi',
): string {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount);
}

/**
 * A count as the storefront writes it — "Đã bán 3,2k", "128k lượt xem". Not
 * `Intl`'s compact notation, which spells Vietnamese thousands "3,2 N".
 */
export function formatCount(n: number, locale: 'en' | 'vi'): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toLocaleString(toIntlLocale(locale), { maximumFractionDigits: 1, useGrouping: false })}k`;
}

/*
 * One formatter per locale, built on first use.
 *
 * Three surfaces date authored content — the Knowledge index, an article and a Guide —
 * and a full index datelines up to thirteen articles in one render, where an `Intl`
 * constructor is among the more expensive calls available. Cached rather than rebuilt,
 * and shared rather than copied: three `Intl.DateTimeFormat` literals that drift would
 * date the same article two ways on two pages, with nothing failing to say so.
 */
const publishedDateFormats = new Map<string, Intl.DateTimeFormat>();

/**
 * An authored date, as a reader sees it.
 *
 * Formatted in UTC because a `publishedAt` is a plain date, which parses as UTC
 * midnight: formatted in the server's own zone it would show the previous day
 * anywhere west of UTC, so an article could appear to predate itself.
 */
export function formatPublishedDate(date: string, locale: 'en' | 'vi'): string {
  let format = publishedDateFormats.get(locale);
  if (!format) {
    format = new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'long', timeZone: 'UTC' });
    publishedDateFormats.set(locale, format);
  }
  return format.format(new Date(date));
}
