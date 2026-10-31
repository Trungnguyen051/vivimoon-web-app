import { describe, it, expect } from 'vitest';
import { locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

/**
 * How long a lens lasts had collected five names: `replacement` on the catalog,
 * `lifespan` on the Comparison Matrix, "duration" on the homepage tiles, `Thời gian
 * dùng` in the collection filter and `Hạn sử dụng` in the design. A shopper could meet
 * three of them in one session and have no way to know they were one axis.
 *
 * ADR-0017 settles it: Expiry — `Hạn sử dụng` — is the shopper-facing name everywhere,
 * and `replacement` survives only as the wire name, never as copy.
 *
 * The values move with the label. An expiry is how long a lens lasts, not how often you
 * replace it, so `Hằng ngày` and `Hằng tháng` are a different claim from `1 ngày` and
 * `1 tháng`, and both phrasings were previously visible to the same shopper.
 */
const RETIRED = [
  'Thời gian dùng',
  'Thời hạn sử dụng',
  'Hằng ngày',
  'Hằng tháng',
  // The English side had its own two names for the axis. Neither survives as copy
  // anywhere, so banning the words outright is safe — unlike `Daily` or `Monthly`,
  // which a collection ("Daily Lenses") and a product title still use for their own
  // honest reasons. Those are pinned by value below instead of banned by word.
  'Lifespan',
  'Replacement',
];

/** Every string a dictionary holds, however deeply nested. */
function copyOf(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(copyOf);
  if (value && typeof value === 'object') return Object.values(value).flatMap(copyOf);
  return [];
}

describe('the Expiry vocabulary', () => {
  it('has retired every earlier name for the axis', () => {
    const survivors = locales.flatMap((locale) =>
      copyOf(getDictionary(locale))
        .filter((copy) => RETIRED.some((retired) => copy.includes(retired)))
        .map((copy) => `${locale}: ${JSON.stringify(copy)}`)
    );

    expect(survivors, `retired Expiry wording still shipping:\n${survivors.join('\n')}`).toEqual([]);
  });

  it('names the axis the same way in the filter and the Comparison Matrix', () => {
    for (const locale of locales) {
      const dict = getDictionary(locale);
      expect(dict.compare.expiry, locale).toBe(dict.filters.replacement);
    }
  });

  it('states every value as a span a lens lasts, in both languages', () => {
    expect(getDictionary('vi').filters.replacements).toEqual({
      daily: '1 ngày', monthly: '1 tháng', threeMonth: '3 tháng', sixMonth: '6 tháng',
    });
    expect(getDictionary('en').filters.replacements).toEqual({
      daily: '1 day', monthly: '1 month', threeMonth: '3 months', sixMonth: '6 months',
    });
  });
});
