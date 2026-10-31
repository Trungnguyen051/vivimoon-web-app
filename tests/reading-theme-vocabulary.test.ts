import { describe, it, expect } from 'vitest';
import { locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readingThemeSchema } from '@/lib/api/schemas/editorial';
import { READING_THEME_ENTRIES } from '@/lib/editorial/reading-themes';
import { catalog } from '@/lib/api/resources/catalog';

/**
 * A Reading Theme is a value in a schema; the words a shopper reads for it live in the
 * dictionary. That makes the label map a parallel list, and the same thing that keeps
 * `filters-colors` honest keeps this one: a theme nobody labelled renders a blank chip
 * in a row of six, with the typecheck and every other test green.
 *
 * It is also the taxonomy that collided with the Support section's Topic, which is why
 * the labels are held here rather than left to the component that happens to show them.
 */
describe('the Reading Theme vocabulary', () => {
  it.each(locales.map((locale) => [locale]))('%s names every Reading Theme', (locale) => {
    const labels = getDictionary(locale).articles.readingThemes;

    for (const theme of readingThemeSchema.options) {
      expect(Object.keys(labels), `no ${locale} label for "${theme}"`).toContain(theme);
      expect(labels[theme].trim(), `${locale} label for "${theme}" is blank`).not.toBe('');
    }
  });

  /**
   * Two chips reading the same thing is a row a shopper cannot use: picking either one
   * narrows to a different set of articles with no way to tell which they got.
   */
  it.each(locales.map((locale) => [locale]))('%s gives each Reading Theme a label of its own', (locale) => {
    const dict = getDictionary(locale);
    const labels = readingThemeSchema.options.map((theme) => dict.articles.readingThemes[theme]);

    expect(new Set(labels).size, `duplicate Reading Theme labels in ${locale}`).toBe(labels.length);
  });

  /** "Tất cả" sits in the same row and must not collide with a real theme's label either. */
  it.each(locales.map((locale) => [locale]))('%s keeps the all-themes chip distinct', (locale) => {
    const dict = getDictionary(locale);
    const labels = readingThemeSchema.options.map((theme) => dict.articles.readingThemes[theme]);

    expect(dict.articles.allThemes.trim()).not.toBe('');
    expect(labels).not.toContain(dict.articles.allThemes);
  });

  /**
   * A destination is a collection slug written as a string, so renaming a collection in
   * the fixtures leaves this table pointing at nothing and ships a call-to-action into a
   * `notFound()`. Same failure the nav destination guard exists to catch, one table over.
   */
  it('points every Reading Theme destination at a collection that exists', async () => {
    const slugs = new Set((await catalog.listCollections()).map((collection) => collection.slug));

    for (const entry of READING_THEME_ENTRIES) {
      if (entry.kind !== 'collection') continue;
      expect(slugs, `${entry.readingTheme} → no such collection: ${entry.collection}`).toContain(entry.collection);
    }
  });
});
