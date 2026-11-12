import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './footer';
import { locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { topicSchema } from '@/lib/api/schemas/support';
import { SEGMENT_ROOT, pathSegments, resolveRoute } from '../../tests/route-tree';

/**
 * Every footer link used to point at the homepage, which reads as a working link and
 * goes nowhere useful. Each one now has to resolve to a real route, and a FAQ link's
 * `?category=` has to be a Topic the FAQ page recognises — an unknown one silently
 * falls back to every entry rather than 404ing, so a typo would never show.
 */
describe('Footer', () => {
  it.each(locales)('links only to real routes and real FAQ Topics (%s)', (locale) => {
    render(<Footer locale={locale} dict={getDictionary(locale)} />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href')!);

    for (const href of hrefs) {
      expect(href, 'a footer link back to the homepage').not.toBe(`/${locale}`);
      expect(resolveRoute(SEGMENT_ROOT, pathSegments(href, { stripLocale: true })), href).not.toBeNull();

      const category = new URL(href, 'http://x').searchParams.get('category');
      if (category !== null) expect(topicSchema.options, href).toContain(category);
    }
  });

  it('sends Shipping and Returns to their FAQ Topics', () => {
    const dict = getDictionary('vi');
    render(<Footer locale="vi" dict={dict} />);

    expect(screen.getByRole('link', { name: dict.footer.shipping }))
      .toHaveAttribute('href', '/vi/support/faq?category=giao-hang');
    expect(screen.getByRole('link', { name: dict.footer.returns }))
      .toHaveAttribute('href', '/vi/support/faq?category=doi-tra-va-bao-hanh');
  });
});
