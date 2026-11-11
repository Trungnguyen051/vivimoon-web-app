import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MakeupLooks } from './makeup-looks';
import { makeupLooks } from '@/content/mock';
import { makeupLookSchema } from '@/lib/api/schemas/editorial';
import { products } from '@/content/mock';
import { locales } from '@/lib/i18n/config';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

const cards = makeupLooks.map((look) => ({
  id: look.id,
  title: look.title.vi,
  image: look.image,
  lensName: look.lensName,
  href: `/vi/product/${look.productSlug}`,
}));

describe('MakeupLooks', () => {
  it('shows every look, captioned with the lens worn in it, opening that lens', () => {
    render(<MakeupLooks title={viDict.articles.makeupLooksTitle} looks={cards} />);
    const band = screen.getByRole('heading', { name: viDict.articles.makeupLooksTitle }).closest('section')!;

    expect(within(band).getAllByRole('link')).toHaveLength(makeupLooks.length);
    for (const look of makeupLooks) {
      const card = within(band).getByRole('link', { name: new RegExp(look.lensName) });
      expect(card).toHaveAttribute('href', `/vi/product/${look.productSlug}`);
      expect(within(card).getByText(look.title.vi)).toBeInTheDocument();
    }
  });

  /**
   * The concept is a short clip and no footage exists, so these are stills. A play
   * control that plays nothing misrepresents the content more than a still does — and
   * it is exactly the thing someone adds back while wiring the band up.
   */
  it('offers no play control', () => {
    render(<MakeupLooks title={viDict.articles.makeupLooksTitle} looks={cards} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(document.querySelector('video')).toBeNull();
  });

  /**
   * The band is the complete set, so a view-all would have to invent somewhere to send
   * a shopper — the homepage carries that stopgap for its own reason (#42) and owns it.
   */
  it('offers no view-all', () => {
    render(<MakeupLooks title={viDict.articles.makeupLooksTitle} looks={cards} />);
    const band = screen.getByRole('heading', { name: viDict.articles.makeupLooksTitle }).closest('section')!;

    for (const link of within(band).getAllByRole('link')) {
      expect(link).toHaveAttribute('href', expect.stringContaining('/product/'));
    }
  });
});

describe('the Makeup Look fixtures', () => {
  it('every look parses, in every locale', () => {
    for (const look of makeupLooks) {
      expect(makeupLookSchema.safeParse(look).success, look.id).toBe(true);
      for (const locale of locales) expect(look.title[locale].trim(), `${look.id} ${locale}`).not.toBe('');
    }
  });

  /**
   * A caption naming a lens nobody sells, or a card opening a `notFound()`, is the kind
   * of thing that ships green — nothing type-checks a slug. Same guard the nav
   * destinations and the Reading Theme table carry, one fixture over.
   */
  it('wears a lens the catalog actually sells, under the name the catalog gives it', () => {
    for (const look of makeupLooks) {
      const product = products.find((p) => p.slug === look.productSlug);

      expect(product, `${look.id} points at a product that does not exist`).toBeDefined();
      expect(look.lensName, `${look.id} names its lens differently from the catalog`).toBe(product!.name);
    }
  });

  it('gives each look its own poster frame', () => {
    const images = makeupLooks.map((look) => look.image);

    expect(new Set(images).size).toBe(images.length);
  });
});
