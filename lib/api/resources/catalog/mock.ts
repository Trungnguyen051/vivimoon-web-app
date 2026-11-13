import { randomUUID } from 'node:crypto';
import { products, accessories, collections, reviews, galleries } from '@/content/mock';
import { diameterMm, parseDiameterRange, parseRxPair, PRICE_PRESETS } from '@/lib/api/schemas/catalog';
import type { Accessory, CatalogItem, Collection, LensGallery, Product, ProductQuery, Review, ReviewFilter, ReviewMediaRef, Variant } from '@/lib/api/schemas/catalog';
import { cheapestVariant } from '@/lib/products/cheapest-variant';
import { filterReviews } from '@/lib/products/reviews';

/** Helpful Votes cast here, per Review id: the voting members. Seeded `helpfulVoteCount` is the base they add to. */
let helpfulVotes = new Map<string, Set<string>>();

export function resetMockHelpfulVotes(): void {
  helpfulVotes = new Map();
}

export type HelpfulVoteResult = 'not_found' | 'own_review' | { hasVoted: boolean; helpfulVoteCount: number };

/**
 * What a shopper may see: never the writer's account or the order line it's about, whatever the store
 * hands back; with a viewer, their per-Review flags.
 */
function toPublicReview({ authorUserId, orderId: _orderId, lineKey: _lineKey, ...review }: Review, viewerId?: string | null): Review {
  const voters = helpfulVotes.get(review.id);
  const counted = { ...review, helpfulVoteCount: review.helpfulVoteCount + (voters?.size ?? 0) };
  return viewerId
    ? { ...counted, isOwn: authorUserId === viewerId, hasVoted: voters?.has(viewerId) ?? false }
    : counted;
}

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

/**
 * Whether a lens is stocked in both eyes' powers (Default Rx, #196). A lens stating no range
 * is matched by nothing, the same answer a lens with no makeup styles gets; an unparseable
 * `rx` can only come from a caller that bypassed the schema.
 */
function coversBothEyes(p: Product, rx: string): boolean {
  const pair = parseRxPair(rx);
  const range = p.sphRange;
  return pair !== null && range !== undefined && [pair.left, pair.right].every((sph) => range.min <= sph && sph <= range.max);
}

/** Whether a lens passes every active facet of the query, except `skip`. */
function applies(p: Product, query: ProductQuery, skip?: FacetKey): boolean {
  for (const facet of SET_FACET_KEYS) {
    const value = query[facet];
    if (facet === skip || value === undefined) continue;
    if (!value.split(',').some((v) => matchesValue(facet, p, v))) return false;
  }
  if (query.rx !== undefined && !coversBothEyes(p, query.rx)) return false;
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
    const product = products.find((p) => p.slug === slug);
    return product ? withWrittenReviews(product) : null;
  },

  /** Lenses only: accessories are never listed (Product Kind). */
  async listProducts(query: ProductQuery = {}): Promise<Product[]> {
    return sortProducts(products.filter((p) => applies(p, query)).map(withWrittenReviews), query.sort);
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
    const result = sortProducts(scope.filter((p) => applies(p, query)).map(withWrittenReviews), query.sort);
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
      .filter((p): p is Product => Boolean(p))
      .map(withWrittenReviews);
  },

  async getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.productLine === product.productLine || p.replacement === product.replacement),
      )
      .slice(0, limit)
      .map(withWrittenReviews);
  },

  /** Approved Reviews only. With `viewerId`, each carries whether it's theirs and whether they voted. */
  async getReviews(productId: string, filter: ReviewFilter = {}, viewerId?: string | null): Promise<Review[]> {
    return filterReviews(reviews.filter((r) => r.productId === productId && r.status === 'approved'), filter)
      .map((r) => toPublicReview(r, viewerId));
  },

  /** Casts (`on`) or takes back a Helpful Vote. Idempotent, so a repeat never counts twice. */
  async setHelpfulVote(reviewId: string, userId: string, on: boolean): Promise<HelpfulVoteResult> {
    const review = reviews.find((r) => r.id === reviewId && r.status === 'approved');
    if (!review) return 'not_found';
    if (review.authorUserId === userId) return 'own_review';
    const voters = helpfulVotes.get(reviewId) ?? new Set<string>();
    if (on) voters.add(userId); else voters.delete(userId);
    helpfulVotes.set(reviewId, voters);
    return { hasVoted: on, helpfulVoteCount: review.helpfulVoteCount + voters.size };
  },

  /** `null` when the product has no gallery entry — the fallback signal the PDP branches on to render the plain `ProductGallery` instead. */
  async getGallery(productId: string): Promise<LensGallery | null> {
    return galleries.find((g) => g.productId === productId) ?? null;
  },

  /** The Review written about one order line, as its writer sees it: the latest that wasn't deleted. Server-only: it carries the writer and order line, so pass it through toPublicReview before it reaches anyone else. */
  async getLineReview(orderId: string, lineKey: string): Promise<Review | null> {
    return reviews.findLast((r) => r.orderId === orderId && r.lineKey === lineKey) ?? null;
  },

  /** A member's new Review, pending Review Moderation. The caller has checked the line may be reviewed. */
  async createReview(input: Omit<Review, 'id' | 'createdAt' | 'status' | 'source' | 'marketplaceHelpfulCount' | 'helpfulVoteCount' | 'reason'>): Promise<Review> {
    const review: Review = {
      ...input, id: `r-${randomUUID()}`, createdAt: new Date().toISOString(),
      status: 'pending', source: 'vivimoon', marketplaceHelpfulCount: 0, helpfulVoteCount: 0,
    };
    reviews.push(pendingUntil(review, Date.now() + AUTO_APPROVE_MS));
    return review;
  },

  /** Deletes the member's own Review; false when there is none by that id that they wrote. */
  async deleteReview(id: string, userId: string): Promise<boolean> {
    const index = reviews.findIndex((r) => r.id === id && r.authorUserId === userId);
    if (index === -1) return false;
    reviews.splice(index, 1);
    return true;
  },

  /** Keeps one uploaded photo or video for a Review the member is writing (#228), and says where it's served. */
  async saveReviewMedia(userId: string, type: ReviewMediaRef['type'], contentType: string, bytes: Uint8Array): Promise<ReviewMediaRef | null> {
    // Null once the member holds MEDIA_PER_MEMBER files, so one account can't fill the store.
    if ([...reviewMedia.values()].filter((m) => m.userId === userId).length >= MEDIA_PER_MEMBER) return null;
    const id = `m-${randomUUID()}`;
    reviewMedia.set(id, { userId, type, contentType, bytes });
    return { id, type, url: `/api/reviews/media/${id}` };
  },

  /** An uploaded file by its reference, with who uploaded it; null when there's none. */
  async getReviewMedia(id: string): Promise<StoredMedia | null> {
    return reviewMedia.get(id) ?? null;
  },

  /** Whether an uploaded file belongs to an approved Review, so anyone may see it; until then only its uploader may. */
  async isReviewMediaPublic(id: string): Promise<boolean> {
    const url = `/api/reviews/media/${id}`;
    return reviews.some((r) => r.status === 'approved' && r.media.some((m) => m.url === url));
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

// Review Moderation in the mock: the seed list is the store, mutated in place so every read above sees writes.
const seedReviews = structuredClone(reviews);
const AUTO_APPROVE_MS = 60_000;
// shortcut: uploads live in memory and are never evicted, fine for a mock; real storage is Vivimoon's backend.
type StoredMedia = { userId: string; type: ReviewMediaRef['type']; contentType: string; bytes: Uint8Array };
const reviewMedia = new Map<string, StoredMedia>();
// shortcut: a flat per-member cap and no eviction of files never attached; the real backend should expire unattached uploads.
const MEDIA_PER_MEMBER = 30;

/** Test helper: restores the seeded Reviews. */
export function resetMockReviewsState(): void {
  reviewMedia.clear();
  reviews.splice(0, reviews.length, ...structuredClone(seedReviews));
}

/** Test-only hook standing in for the upstream moderation queue: approves or rejects at once. */
export function moderateReview(id: string, status: 'approved' | 'rejected', reason?: string): void {
  const review = reviews.find((r) => r.id === id);
  if (!review) throw new Error(`No review ${id}`);
  Object.assign(review, { status, reason: status === 'rejected' ? reason : undefined });
}

/**
 * A new Review reads as approved once `at` passes, evaluated on read since the mock has no scheduler.
 * A status set explicitly (the moderation hook) sticks. Seeded pending Reviews have no clock and stay pending.
 */
function pendingUntil(review: Review, at: number): Review {
  let status: Review['status'] = 'pending';
  return Object.defineProperty(review, 'status', {
    get: () => (status === 'pending' && Date.now() >= at ? 'approved' : status),
    set: (next: Review['status']) => { status = next; },
    enumerable: true, configurable: true,
  });
}

/**
 * Cards read a lens's stored rating and count; approved Reviews tied to an order line add to them (#224,
 * story 34). The seeded approved Reviews have none, so they're already in the stored numbers.
 */
function withWrittenReviews(product: Product): Product {
  const written = reviews.filter((r) => r.productId === product.id && r.orderId && r.status === 'approved');
  if (written.length === 0) return product;
  const reviewCount = product.reviewCount + written.length;
  const rating = (product.rating * product.reviewCount + written.reduce((sum, r) => sum + r.rating, 0)) / reviewCount;
  return { ...product, reviewCount, rating };
}
