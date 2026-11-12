import { products, accessories, collections, reviews, galleries } from '@/content/mock';
import { diameterMm, parseDiameterRange, PRICE_PRESETS } from '@/lib/api/schemas/catalog';
import type { Accessory, CatalogItem, Collection, LensGallery, Product, ProductQuery, Review, ReviewFilter, Variant } from '@/lib/api/schemas/catalog';
import { cheapestVariant } from '@/lib/products/cheapest-variant';
import { filterReviews } from '@/lib/products/reviews';

/** Lowest variant price, used for sorting. */
export function minPrice(product: Product): number {
  return cheapestVariant(product).price;
}

type FacetDef = { stated: (p: Product) => string[]; matches?: (p: Product, value: string) => boolean };

/**
 * Every facet a query carries as a value set, with the values a lens states for it. A lens
 * passes a facet when it matches any value in the set: a Color Family sends a set
 * (CONTEXT.md), and the sidebar's checkboxes and chips do the same for every other facet.
 */
const SET_FACETS = {
  productLine: { stated: (p) => [p.productLine] },
  replacement: { stated: (p) => [p.replacement] },
  brandId: { stated: (p) => [p.brandId] },
  color: { stated: (p) => p.variants.flatMap((v) => (v.color ? [v.color] : [])) },
  diameter: {
    // A lens states its one width as a one-value range, which is what the sidebar's chips send.
    stated: (p) => {
      const mm = diameterMm(p.specs.diameter);
      return mm === null ? [] : [`${mm}-${mm}`];
    },
    // Both ends inclusive, which is what makes `14.0-14.0` select exactly the lenses of that
    // width. A range the schema would have rejected can only arrive from a caller that
    // bypassed it; matching nothing is the same answer an unknown color already gets.
    matches: (p, value) => {
      const range = parseDiameterRange(value);
      const mm = diameterMm(p.specs.diameter);
      return range !== null && mm !== null && mm >= range.min && mm <= range.max;
    },
  },
  material: { stated: (p) => [p.specs.material] },
  makeupStyle: { stated: (p) => p.makeupStyles ?? [] },
  series: { stated: (p) => p.series ?? [] },
  occasion: { stated: (p) => p.occasions ?? [] },
} satisfies Record<string, FacetDef>;

type SetFacet = keyof typeof SET_FACETS;
export type FacetKey = SetFacet | 'price';
/** Per facet, per option value: how many lenses picking that option would show. */
export type FacetCounts = Record<FacetKey, Record<string, number>>;

const SET_FACET_KEYS = Object.keys(SET_FACETS) as SetFacet[];

function matchesValue(facet: SetFacet, p: Product, value: string): boolean {
  const def: FacetDef = SET_FACETS[facet];
  return def.matches ? def.matches(p, value) : def.stated(p).includes(value);
}

function inPriceRange(p: Product, min: number | undefined, max: number | undefined): boolean {
  const price = minPrice(p);
  return (min === undefined || price >= min) && (max === undefined || price <= max);
}

/** Whether a lens passes every active facet of the query, except `skip`. */
function applies(p: Product, query: ProductQuery, skip?: FacetKey): boolean {
  for (const facet of SET_FACET_KEYS) {
    const value = query[facet];
    if (facet === skip || value === undefined) continue;
    if (!value.split(',').some((v) => matchesValue(facet, p, v))) return false;
  }
  return skip === 'price' || inPriceRange(p, query.minPrice, query.maxPrice);
}

function sortProducts(list: Product[], sort: ProductQuery['sort']): Product[] {
  switch (sort) {
    case 'price-asc': return list.sort((a, b) => minPrice(a) - minPrice(b));
    case 'price-desc': return list.sort((a, b) => minPrice(b) - minPrice(a));
    case 'bestselling': return list.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    case 'newest':
      return list.sort((a, b) => Number(b.badges.includes('new')) - Number(a.badges.includes('new')));
    default: return list;
  }
}

/**
 * Each option counted against every *other* active facet, so within a facet an option says
 * how many lenses picking it would show, rather than dropping to zero once a sibling is
 * picked. An active value no lens states (a menu's diameter bucket) is counted too.
 */
function facetCounts(scope: Product[], query: ProductQuery): FacetCounts {
  const counts = {} as FacetCounts;
  for (const facet of SET_FACET_KEYS) {
    const base = scope.filter((p) => applies(p, query, facet));
    const options = new Set([...scope.flatMap(SET_FACETS[facet].stated), ...(query[facet]?.split(',') ?? [])]);
    counts[facet] = Object.fromEntries(
      [...options].map((value) => [value, base.filter((p) => matchesValue(facet, p, value)).length]),
    );
  }
  const base = scope.filter((p) => applies(p, query, 'price'));
  counts.price = Object.fromEntries(
    PRICE_PRESETS.map(({ id, min, max }) => [id, base.filter((p) => inPriceRange(p, min, max)).length]),
  );
  return counts;
}

export const mockCatalog = {
  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) ?? null;
  },

  /** Lenses only: accessories are never listed (Product Kind). */
  async listProducts(query: ProductQuery = {}): Promise<Product[]> {
    return sortProducts(products.filter((p) => applies(p, query)), query.sort);
  },

  /**
   * The collection page's query: the filtered, sorted result paged by offset and limit,
   * its total, and the per-option counts the sidebar shows. `ids` scopes it to a Collection.
   */
  async searchProducts(
    query: ProductQuery,
    { ids, offset = 0, limit = Infinity }: { ids?: string[]; offset?: number; limit?: number } = {},
  ): Promise<{ products: Product[]; total: number; counts: FacetCounts }> {
    const scope = ids ? products.filter((p) => ids.includes(p.id)) : products;
    const result = sortProducts(scope.filter((p) => applies(p, query)), query.sort);
    return { products: result.slice(offset, offset + limit), total: result.length, counts: facetCounts(scope, query) };
  },

  /** The cart's accessory variant picker reads this. */
  async listAccessories(): Promise<Accessory[]> {
    return [...accessories];
  },

  async getCollection(slug: string): Promise<Collection | null> {
    return collections.find((c) => c.slug === slug) ?? null;
  },

  async listCollections(): Promise<Collection[]> {
    return [...collections];
  },

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  },

  async getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.productLine === product.productLine || p.replacement === product.replacement),
      )
      .slice(0, limit);
  },

  async getReviews(productId: string, filter: ReviewFilter = {}): Promise<Review[]> {
    return filterReviews(reviews.filter((r) => r.productId === productId), filter);
  },

  /** `null` when the product has no gallery entry — the fallback signal the PDP branches on to render the plain `ProductGallery` instead. */
  async getGallery(productId: string): Promise<LensGallery | null> {
    return galleries.find((g) => g.productId === productId) ?? null;
  },

  /**
   * Finds a variant by id across the whole catalogue, and the product it
   * belongs to. This is the server-side price lookup pricing/mock.ts uses —
   * variant ids are asserted globally unique in tests/contract/fixtures.test.ts.
   */
  async getVariantById(id: string): Promise<{ product: CatalogItem; variant: Variant } | null> {
    for (const product of [...products, ...accessories]) {
      const variant = product.variants.find((v) => v.id === id);
      if (variant) return { product, variant };
    }
    return null;
  },
};

export type Catalog = typeof mockCatalog;
