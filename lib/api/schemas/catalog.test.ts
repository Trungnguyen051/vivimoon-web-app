import { describe, it, expect } from 'vitest';
import { productSchema, variantSchema, reviewSchema, productQuerySchema, parseProductQueryLoose, lensGallerySchema } from './catalog';

// type: 'clear' as the baseline so most tests don't have to think about the
// colored-requires-graphicDiameter invariant; tests that care set type explicitly.
const validProduct = {
  id: 'p1', slug: 'aqua', name: 'Aqua', brandId: 'b1', brandName: 'Brand',
  type: 'clear', replacement: 'daily', description: 'd', images: ['/a.jpg'],
  badges: ['new'],
  specs: {
    material: 'Hydrogel', waterContent: '38%', baseCurve: '8.6mm',
    diameter: '14.2mm', origin: 'M',
  },
  variants: [{
    id: 'v1', sku: 'S1', price: 250000,
    currency: 'VND', stock: 5,
  }],
  rating: 4.5, reviewCount: 10,
};

describe('productSchema', () => {
  it('accepts a valid product', () => {
    expect(productSchema.parse(validProduct).slug).toBe('aqua');
  });

  it('rejects an unknown lens type', () => {
    const bad = { ...validProduct, type: 'banana' };
    expect(() => productSchema.parse(bad)).toThrow();
  });

  it('rejects a rating outside 0-5', () => {
    expect(() => productSchema.parse({ ...validProduct, rating: 9 })).toThrow();
  });

  it('rejects a product with no variants', () => {
    expect(() => productSchema.parse({ ...validProduct, variants: [] })).toThrow();
  });

  it('rejects a non-integer price, since VND has no minor unit', () => {
    const bad = { ...validProduct, variants: [{ ...validProduct.variants[0], price: 1.5 }] };
    expect(() => productSchema.parse(bad)).toThrow();
  });

  it('accepts the real duration tiers and rejects the retired biweekly tier', () => {
    for (const replacement of ['daily', 'monthly', 'threeMonth', 'sixMonth'] as const) {
      expect(productSchema.parse({ ...validProduct, replacement }).replacement).toBe(replacement);
    }
    expect(() => productSchema.parse({ ...validProduct, replacement: 'biweekly' })).toThrow();
  });

  it('specs no longer carry a uvProtection field, even if one is passed in', () => {
    const withStaleField = { ...validProduct, specs: { ...validProduct.specs, uvProtection: true } };
    const parsed = productSchema.parse(withStaleField);
    expect(parsed.specs).not.toHaveProperty('uvProtection');
  });

  it('accepts specs with or without a graphicDiameter for a colorless type', () => {
    const withGraphicDiameter = { ...validProduct, specs: { ...validProduct.specs, graphicDiameter: '13.3mm' } };
    expect(productSchema.parse(withGraphicDiameter).specs.graphicDiameter).toBe('13.3mm');
    expect(productSchema.parse(validProduct).specs.graphicDiameter).toBeUndefined();
  });

  it('rejects a colored product with no graphicDiameter', () => {
    const bad = { ...validProduct, type: 'colored' };
    expect(() => productSchema.parse(bad)).toThrow();
  });

  it('accepts a colored product that has a graphicDiameter', () => {
    const good = {
      ...validProduct, type: 'colored',
      specs: { ...validProduct.specs, graphicDiameter: '13.3mm' },
    };
    expect(productSchema.parse(good).type).toBe('colored');
  });

  it('variants no longer carry a packSize field, even if one is passed in', () => {
    const withStaleField = {
      ...validProduct,
      variants: [{ ...validProduct.variants[0], packSize: '30 lenses' }],
    };
    const parsed = productSchema.parse(withStaleField);
    expect(parsed.variants[0]).not.toHaveProperty('packSize');
  });

  it('rejects two variants that repeat the same color, since color is now the only selector', () => {
    const bad = {
      ...validProduct,
      variants: [
        { ...validProduct.variants[0], id: 'v1', color: 'brown' },
        { ...validProduct.variants[0], id: 'v2', color: 'brown' },
      ],
    };
    expect(() => productSchema.parse(bad)).toThrow();
  });

  it('accepts multiple variants with distinct colors', () => {
    const good = {
      ...validProduct,
      variants: [
        { ...validProduct.variants[0], id: 'v1', color: 'brown', colorLabel: 'Brown' },
        { ...validProduct.variants[0], id: 'v2', color: 'gray', colorLabel: 'Gray' },
      ],
    };
    expect(productSchema.parse(good).variants).toHaveLength(2);
  });

  it('rejects a colorless variant sharing a product with any other variant, since nothing can select between them', () => {
    const bad = {
      ...validProduct,
      variants: [
        { ...validProduct.variants[0], id: 'v1' },
        { ...validProduct.variants[0], id: 'v2' },
      ],
    };
    expect(() => productSchema.parse(bad)).toThrow();
  });

  it('accepts a single colorless variant', () => {
    expect(productSchema.parse(validProduct).variants).toHaveLength(1);
  });
});

describe('variantSchema', () => {
  it('rejects a variant with color but no colorLabel', () => {
    const bad = { id: 'v1', sku: 'S1', color: 'brown', price: 10, currency: 'USD', stock: 1 };
    expect(() => variantSchema.parse(bad)).toThrow();
  });

  it('rejects a variant with colorLabel but no color', () => {
    const bad = { id: 'v1', sku: 'S1', colorLabel: 'Hazel Brown', price: 10, currency: 'USD', stock: 1 };
    expect(() => variantSchema.parse(bad)).toThrow();
  });

  it('accepts a variant with both color and colorLabel, or neither', () => {
    const withColor = { id: 'v1', sku: 'S1', color: 'brown', colorLabel: 'Hazel Brown', price: 10, currency: 'USD', stock: 1 };
    const withoutColor = { id: 'v2', sku: 'S2', price: 10, currency: 'USD', stock: 1 };
    expect(variantSchema.parse(withColor).color).toBe('brown');
    expect(variantSchema.parse(withoutColor).color).toBeUndefined();
  });
});

describe('reviewSchema', () => {
  it('defaults source to vivimoon when absent', () => {
    const r = reviewSchema.parse({
      id: 'r1', productId: 'p1', author: 'A', rating: 5,
      title: 't', body: 'b', createdAt: '2026-01-01', hasImages: false,
    });
    expect(r.source).toBe('vivimoon');
  });

  it('accepts a mirrored marketplace review', () => {
    const r = reviewSchema.parse({
      id: 'r2', productId: 'p1', author: 'B', rating: 4,
      title: 't', body: 'b', createdAt: '2026-01-01', hasImages: true,
      source: 'shopee', sourceUrl: 'https://shopee.vn/x',
    });
    expect(r.source).toBe('shopee');
  });
});

describe('productQuerySchema', () => {
  it('parses URL search params, ignoring blanks', () => {
    const q = productQuerySchema.parse({ type: 'colored', color: '', sort: 'price-asc' });
    expect(q).toEqual({ type: 'colored', sort: 'price-asc' });
  });

  it('rejects an unknown sort', () => {
    expect(() => productQuerySchema.parse({ sort: 'cheapest' })).toThrow();
  });
});

describe('lensGallerySchema', () => {
  const validGallery = {
    productId: 'p1',
    contexts: {
      eye: ['/a.jpg', '/b.jpg'],
      face: ['/a.jpg'],
      withMakeup: ['/b.jpg'],
      withoutMakeup: ['/a.jpg'],
      byEyeColor: { brown: ['/a.jpg'], blue: ['/b.jpg'] },
    },
  };

  it('accepts a gallery with all five context keys populated', () => {
    expect(lensGallerySchema.parse(validGallery).contexts.eye).toEqual(['/a.jpg', '/b.jpg']);
  });

  it('accepts an arbitrary string-keyed byEyeColor record', () => {
    const g = lensGallerySchema.parse({
      ...validGallery,
      contexts: { ...validGallery.contexts, byEyeColor: { hazel: ['/a.jpg'], green: ['/b.jpg'] } },
    });
    expect(Object.keys(g.contexts.byEyeColor)).toEqual(['hazel', 'green']);
  });

  it('rejects a gallery missing a context key', () => {
    const { face: _face, ...rest } = validGallery.contexts;
    expect(() => lensGallerySchema.parse({ ...validGallery, contexts: rest })).toThrow();
  });
});

describe('parseProductQueryLoose', () => {
  it('keeps a valid field and drops an invalid one from a mixed query', () => {
    const q = parseProductQueryLoose({ type: 'colored', sort: 'banana' });
    expect(q).toEqual({ type: 'colored' });
  });

  it('behaves the same as productQuerySchema.parse for an all-valid query', () => {
    const input = { type: 'colored', sort: 'price-asc' };
    expect(parseProductQueryLoose(input)).toEqual(productQuerySchema.parse(input));
  });

  it('still drops blank-string params', () => {
    const q = parseProductQueryLoose({ type: 'colored', color: '' });
    expect(q).toEqual({ type: 'colored' });
  });
});
