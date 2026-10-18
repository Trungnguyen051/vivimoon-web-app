import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentCarousel } from './content-carousel';
import { en } from '@/lib/i18n/dictionaries/en';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

const items = viDict.home.tv.items.map((it, i) => ({ ...it, image: `/images/tv-thumb-${i + 1}.png`, href: `/vi${it.href}` }));

describe('ContentCarousel', () => {
  it('gives every card its own destination', () => {
    render(
      <ContentCarousel
        title={viDict.home.tv.title}
        avatar="/images/tv-avatar.png"
        items={items}
        moreLabel={viDict.home.tv.more}
        moreHref="/vi/collection/colored-lenses"
        slideLabel={viDict.common.goToSlide}
      />,
    );

    for (const item of items) {
      expect(screen.getByRole('link', { name: new RegExp(item.title) })).toHaveAttribute('href', item.href);
    }
    expect(screen.getByRole('link', { name: viDict.home.tv.more })).toHaveAttribute('href', '/vi/collection/colored-lenses');
  });

  /**
   * All four cards share one title in the wireframe — placeholder content, not copy,
   * and the vi dictionary had already absorbed it as a duplicated pair (#37). Four
   * cards that say the same thing look like a rendering bug to a shopper.
   */
  it.each([['en', en], ['vi', viDict]])('%s keeps four distinct card titles', (_locale, dict) => {
    const titles = dict.home.tv.items.map((it) => it.title);

    expect(titles).toHaveLength(4);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(dict.home.tv.items.map((it) => it.id)).size).toBe(titles.length);
  });

  it('describes the same four items in both locales', () => {
    expect(en.home.tv.items.map((it) => it.id)).toEqual(viDict.home.tv.items.map((it) => it.id));
    expect(en.home.tv.items.map((it) => it.href)).toEqual(viDict.home.tv.items.map((it) => it.href));
  });

  /** The design pairs duration with lens type, where ours paired duration with colour. */
  it.each([['en', en], ['vi', viDict]])('%s tags each card with two facets', (_locale, dict) => {
    for (const item of dict.home.tv.items) expect(item.tags).toHaveLength(2);
  });
});
