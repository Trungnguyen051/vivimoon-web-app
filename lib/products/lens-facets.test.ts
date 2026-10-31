import { describe, it, expect } from 'vitest';
import {
  LENS_FACETS, DIAMETER_BUCKETS, MATERIAL_VALUES, facetHref, facetValueHref, type FacetValue,
} from './lens-facets';
import { locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { LENS_ENTRIES } from './lens-entries';
import { replacementScheduleSchema, parseProductQueryLoose } from '@/lib/api/schemas/catalog';
import { mockCatalog } from '@/lib/api/resources/catalog/mock';
import { diameterMm } from '@/lib/api/schemas/catalog';

/**
 * This is where the design's content is pinned. The panel that renders these is tested
 * on interaction; what a shopper is actually offered — four axes, in one order, each
 * value opening one page — lives here, so the two cannot drift (#87).
 *
 * Read from the frames at `9bTKBHv3tf3aJy1EhnJc4i`: Màu sắc `38:2019`, Đường kính
 * `38:2374`, Hạn sử dụng `38:2684`, Chất liệu `38:2961`.
 */
/** What a shopper gets after following a facet value, by the collection page's own path. */
async function follow(href: string) {
  const url = new URL(href, 'https://vivimoon.test');
  const collection = await mockCatalog.getCollection(url.pathname.split('/collection/')[1]);
  if (!collection) return null;

  const base = await mockCatalog.getProductsByIds(collection.productIds);
  const ids = new Set(base.map((p) => p.id));
  const filtered = await mockCatalog.listProducts(parseProductQueryLoose(Object.fromEntries(url.searchParams)));
  return filtered.filter((p) => ids.has(p.id));
}

describe('the Lens Facets', () => {
  it('offers four axes in the order the design fixes', () => {
    expect(LENS_FACETS.map((facet) => facet.id)).toEqual(['color', 'diameter', 'expiry', 'material']);
  });

  /**
   * Three of the four frames show `Đường kính` in the first slot, above `Đường kính
   * (DIA)`. That is a copy-paste error — only the Màu sắc frame draws the left column
   * correctly — and Màu sắc leads in all four states.
   */
  it('leads with Màu sắc, not a second diameter', () => {
    expect(LENS_FACETS[0].id).toBe('color');
  });

  it('builds Màu sắc from the same entries as the homepage colour row', () => {
    const colour = LENS_FACETS.find((facet) => facet.id === 'color')!;

    expect(colour.values.map((value) => value.id)).toEqual(LENS_ENTRIES.map((entry) => entry.id));
  });

  // The homepage's duration tiles leave monthly out by design. The menu must not
  // reuse that list — a shopper browsing by expiry is offered every schedule.
  it('offers every expiry schedule, monthly included', () => {
    const expiry = LENS_FACETS.find((facet) => facet.id === 'expiry')!;

    expect(expiry.values.map((value) => value.id)).toEqual(replacementScheduleSchema.options);
  });

  it('maps each material value onto a material the catalog carries', () => {
    const material = LENS_FACETS.find((facet) => facet.id === 'material')!;

    expect(material.values.map((v) => (v as Extract<FacetValue, { kind: 'material' }>).material))
      .toEqual(['Hydrogel', 'Silicone Hydrogel']);
  });

  it('ships the five diameter buckets the design draws', () => {
    expect(DIAMETER_BUCKETS.map((b) => `${b.min}-${b.max}`)).toEqual([
      '11.9-12.8', '12.9-13.4', '13.5-13.9', '14-14', '14.3-14.5',
    ]);
  });

  /**
   * The design's third and fourth buckets read `13.5 - 14.0mm` and `14.0mm`, so a
   * 14.0mm lens would match two buckets of the same axis and the facet would stop
   * being a partition. The first ends at 13.9 instead.
   */
  it('never lets one lens fall into two buckets', () => {
    const overlapping = DIAMETER_BUCKETS.flatMap((a, i) =>
      DIAMETER_BUCKETS.slice(i + 1)
        .filter((b) => a.min <= b.max && b.min <= a.max)
        .map((b) => `${a.id} overlaps ${b.id}`)
    );

    expect(overlapping, overlapping.join('\n')).toEqual([]);
  });

  it('gives every value a destination the catalog can actually apply', () => {
    for (const facet of LENS_FACETS) {
      for (const value of facet.values) {
        const href = facetValueHref(value, 'vi');
        const [, search] = href.split('?');

        expect(search, `${facet.id}/${value.id} carries no filter`).toBeTruthy();
        // A filter the schema drops is a link that opens the unfiltered catalog
        // while claiming to narrow it.
        const parsed = parseProductQueryLoose(Object.fromEntries(new URLSearchParams(search)));
        expect(Object.keys(parsed), `${facet.id}/${value.id}: ${search}`).not.toEqual([]);
      }
    }
  });

  /**
   * Every label a shopper reads comes from the dictionary. `a11y-labels.test.ts` holds
   * the same rule for icon-only controls; this holds it for the facet names and the
   * material values, which are the two sets this module introduces. Colours and expiry
   * schedules already had labels, and a diameter is a number rather than copy.
   */
  it('names every facet and material in both languages', () => {
    for (const locale of locales) {
      const { facets } = getDictionary(locale).nav;

      for (const facet of LENS_FACETS) {
        expect(facets[facet.id], `${locale}: ${facet.id}`).toBeTruthy();
      }
      for (const { id } of MATERIAL_VALUES) {
        expect(facets.materials[id], `${locale}: material ${id}`).toBeTruthy();
      }
    }
  });

  // One axis, one name: the facet and the collection filter must not offer a shopper
  // two words for the same question in one session (ADR-0017).
  it('calls expiry what the collection filter calls it', () => {
    for (const locale of locales) {
      const dict = getDictionary(locale);
      expect(dict.nav.facets.expiry, locale).toBe(dict.filters.replacement);
    }
  });

  /**
   * #49's bug in this menu's shape: a link pointed somewhere that held nothing of what
   * it named, so it opened an empty page while the catalog had the lenses all along.
   * Asserting the data alone cannot catch that — the destination was what was wrong —
   * so each value is followed where it actually goes.
   *
   * Emptiness is not the failure here. Three diameter buckets match no stock by design,
   * and that is Vivimoon's catalog being thin rather than the link being wrong. What is
   * pinned is that whatever comes back is what the value described.
   */
  it('returns only what the value names, wherever it leads', async () => {
    for (const facet of LENS_FACETS) {
      for (const value of facet.values) {
        const listed = await follow(facetValueHref(value, 'vi'));
        expect(listed, `${facet.id}/${value.id} points at a collection that does not exist`).not.toBeNull();

        for (const product of listed!) {
          const where = `${facet.id}/${value.id} returned ${product.slug}`;

          if (value.kind === 'expiry') expect(product.replacement, where).toBe(value.id);
          if (value.kind === 'material') expect(product.specs.material, where).toBe(value.material);
          if (value.kind === 'diameter') {
            const mm = diameterMm(product.specs.diameter)!;
            expect(mm >= value.bucket.min && mm <= value.bucket.max, `${where} at ${mm}mm`).toBe(true);
          }
        }
      }
    }
  });

  /**
   * An empty material facet is always a bug, unlike an empty diameter bucket.
   * `MATERIAL_VALUES` repeats the catalog's own wording and the catalog matches it with
   * `===`, so rewording a fixture to `Hydrogel (HEMA)` would leave both values returning
   * nothing — and every other test here would stay green, because the follow-the-link
   * test tolerates emptiness on purpose for the buckets.
   */
  it('keeps every material value matched to stock that exists', async () => {
    const material = LENS_FACETS.find((facet) => facet.id === 'material')!;

    for (const value of material.values) {
      const listed = await follow(facetValueHref(value, 'vi'));
      expect(listed, `material ${value.id} matches nothing in the catalog`).not.toHaveLength(0);
    }
  });

  /**
   * A facet is an axis, not a selection, so it has no filtered collection of its own. It
   * opens the whole catalog with its own filter control focused.
   *
   * This pins the shape of that destination and nothing more. It cannot tell whether the
   * fragment resolves, and today none of them does: the collection filter row renders no
   * `id` at all, and has no control for diameter or material to carry one. Building those
   * is its own ticket, and #112 is blocked on it — until then the arrow beside a facet is
   * the decoration this href exists not to be.
   */
  it('points each facet name at the catalog with that control focused', () => {
    for (const facet of LENS_FACETS) {
      expect(facetHref(facet, 'vi')).toBe(`/vi/collection/all-lenses#filter-${facet.id}`);
    }
  });
});
