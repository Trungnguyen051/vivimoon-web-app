import { describe, it, expect } from 'vitest';
import { collectionListId } from './list-id';
import { parseProductQueryLoose } from '@/lib/api/schemas/catalog';

const COLLECTION_COLORS = ['brown', 'black', 'gray', 'violet'];

const idFor = (slug: string, search: string) =>
  collectionListId(slug, parseProductQueryLoose(Object.fromEntries(new URLSearchParams(search))), COLLECTION_COLORS);

/**
 * `view_item_list` identified a list by its collection alone, so every Color Family
 * tile reported `colored-lenses` and every duration tile `all-lenses` — the questions
 * those tiles exist to answer could not be answered from the data (#57).
 */
describe('collectionListId', () => {
  it('leaves an unfiltered view on the bare slug', () => {
    expect(idFor('colored-lenses', '')).toBe('colored-lenses');
    expect(idFor('colored-lenses', 'sort=newest')).toBe('colored-lenses');
  });

  it('tells two Color Family tiles apart', () => {
    expect(idFor('colored-lenses', 'color=brown')).not.toBe(idFor('colored-lenses', 'color=black'));
  });

  // A Lens Facet narrows by diameter and material (#109), which changes which
  // products the list holds just as surely as a colour does. Left out of the id,
  // every facet-filtered view would report the bare slug — the exact misreport
  // this function exists to prevent.
  it('tells two diameter buckets apart, and from the whole catalog', () => {
    const narrow = idFor('all-lenses', 'diameter=13.5-13.9');

    expect(narrow).not.toBe(idFor('all-lenses', 'diameter=14.0-14.0'));
    expect(narrow).not.toBe(idFor('all-lenses', ''));
  });

  it('tells two materials apart, and from the whole catalog', () => {
    const hydrogel = idFor('all-lenses', 'material=Hydrogel');

    expect(hydrogel).not.toBe(idFor('all-lenses', 'material=Silicone Hydrogel'));
    expect(hydrogel).not.toBe(idFor('all-lenses', ''));
  });

  it('tells two duration tiles apart, and from the whole catalog', () => {
    const daily = idFor('all-lenses', 'replacement=daily');

    expect(daily).not.toBe(idFor('all-lenses', 'replacement=sixMonth'));
    expect(daily).not.toBe(idFor('all-lenses', ''));
  });

  /** Sort changes the order of a list, not which products are in it. */
  it('ignores sort, which does not change what the list contains', () => {
    expect(idFor('all-lenses', 'replacement=daily&sort=price-asc')).toBe(idFor('all-lenses', 'replacement=daily'));
  });

  /** Otherwise one list reports under several ids depending on how the URL was built. */
  it('does not depend on the order the params arrived in', () => {
    expect(idFor('colored-lenses', 'color=brown&productLine=coMau'))
      .toBe(idFor('colored-lenses', 'productLine=coMau&color=brown'));
  });

  /**
   * `color` is a free-form string the catalog matches as a set, so a URL can carry junk
   * beside a real colour and still render products. Unbounded ids for one list is the
   * cardinality problem this id exists to avoid.
   */
  it('keeps only colours the collection has', () => {
    expect(idFor('colored-lenses', `color=brown,${'x'.repeat(200)}`)).toBe('colored-lenses:color=brown');
  });

  /** Nothing known left means no colour claim; the grid is empty, so no event fires anyway. */
  it('drops a colour filter it cannot recognise at all', () => {
    expect(idFor('colored-lenses', 'color=chartreuse')).toBe('colored-lenses');
  });

  /** Same membership, same list — however the set was ordered or repeated. */
  it('does not depend on the order or repetition within a colour set', () => {
    const id = idFor('colored-lenses', 'color=brown,gray');

    expect(idFor('colored-lenses', 'color=gray,brown')).toBe(id);
    expect(idFor('colored-lenses', 'color=brown,gray,brown')).toBe(id);
  });

  it('reads as the filter it describes', () => {
    expect(idFor('colored-lenses', 'color=brown,gray')).toBe('colored-lenses:color=brown,gray');
  });
});
