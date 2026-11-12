import type { Article } from '@/lib/api/schemas/editorial';
import type { Locale } from '@/lib/i18n/config';
import { formatPublishedDate } from '@/lib/utils/format';
import { readingMinutes } from './reading-time';

/**
 * Author · reading time · date — the one line that dates an Article.
 *
 * Shared because the Knowledge index and the article itself both show it, and the
 * reading time is *derived* rather than authored: two copies of this arithmetic would
 * be two chances for the index to promise a four-minute read that the article then
 * calls five.
 *
 * Takes the reading-time template rather than the dictionary. A `lib` module that
 * imported the dictionary would make every caller's locale the module's business, and
 * the template is the only copy this line needs.
 */
export function articleDateline(article: Article, locale: Locale, readingTimeTemplate: string): string {
  return [
    article.author,
    readingTimeTemplate.replace('{count}', String(readingMinutes(article.body[locale]))),
    formatPublishedDate(article.publishedAt, locale),
  ].join(' · ');
}
