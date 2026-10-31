'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { productLineSchema, productQuerySchema, replacementScheduleSchema } from '@/lib/api/schemas/catalog';
import {
  DIAMETER_BUCKETS, MATERIAL_VALUES, diameterBucketLabel, facetAnchorId,
} from '@/lib/products/lens-facets';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// From the schema, not a parallel list: a new line can't be added to the
// taxonomy and silently stay unselectable here.
const PRODUCT_LINES = productLineSchema.options;
const REPLACEMENTS = replacementScheduleSchema.options;
const SORTS = ['newest', 'price-asc', 'price-desc', 'bestselling'] as const;
/** Every field a collection URL can carry, so the Clear control cannot fall behind one. */
const QUERY_KEYS = Object.keys(productQuerySchema.shape);
// Both from the Lens Facet model rather than restated here, so the row cannot offer a
// bucket the menu does not, or a material the catalog has never heard of.
const DIAMETERS = DIAMETER_BUCKETS.map((bucket) => bucket.id);
const MATERIALS = MATERIAL_VALUES.map((value) => value.material);

/**
 * One control in the row. Six of them differ only in what they list, and the two the
 * Lens Facet menu needed made that worth collapsing — a seventh should be a line rather
 * than another twenty-line block, and every control should carry its anchor the same way.
 *
 * `id` is what a facet name in the menu aims at. Only the four axes the menu offers carry
 * one; Loại lens and Sắp xếp are not facets and have nothing pointing at them.
 */
function FilterSelect({ id, label, value, options, labelOf, onChange }: {
  id?: string;
  label: string;
  value: string;
  options: readonly string[];
  labelOf: (value: string) => string;
  onChange: (value: string | null) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      // Base UI reads the trigger's text from `items`, where Radix rendered the chosen
      // item's children. Built from the same list as the options, so a label cannot
      // drift from the option it names.
      items={{ [ALL]: label, ...Object.fromEntries(options.map((v) => [v, labelOf(v)])) }}
    >
      <SelectTrigger id={id} className="w-40" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ALL}>{label}</SelectItem>
          {options.map((v) => (
            <SelectItem key={v} value={v}>{labelOf(v)}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
const ALL = 'all';

export function CollectionFilters({ dict, colors }: { dict: Dictionary; colors: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // From the schema too, for the same reason the options above are: this was a
  // parallel list, and a filter the schema gained but this line did not would
  // leave a shopper narrowed with no control anywhere on the page to widen again.
  const hasFilters = QUERY_KEYS.some((key) => params.get(key));

  /**
   * A colour is named by the dictionary, not by a variant's `colorLabel`: that label
   * is one shade's marketing name in one language ("Hazel Brown"), while this filters
   * every variant of the colour. `filters-colors.test.ts` fails if a catalog colour
   * has no label, so the map cannot quietly fall behind the fixtures.
   */
  const labelFor = (value: string) =>
    value
      .split(',')
      .map((part) => dict.filters.colors[part as keyof typeof dict.filters.colors] ?? part)
      .join(' + ');

  // `?color=` (blank) is no filter server-side, so it must not become a blank option here.
  const activeColor = params.get('color') || ALL;
  // A Color Family tile can send a set — `?color=brown,gray` — matching no single option.
  // The set becomes an option of its own rather than leaving the control blank about a
  // filter that is plainly applied.
  const colorOptions = activeColor === ALL || colors.includes(activeColor) ? colors : [...colors, activeColor];

  // Base UI's select types its value as nullable, so `null` reaches here as well as
  // the sentinel — both mean the same thing, which is that the filter comes off.
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== ALL) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <FilterSelect
        label={dict.filters.productLine}
        value={params.get('productLine') ?? ALL}
        options={PRODUCT_LINES}
        labelOf={(v) => dict.filters.productLines[v as (typeof PRODUCT_LINES)[number]]}
        onChange={(v) => setParam('productLine', v)}
      />

      {/* Expiry's control carries `?replacement=` — the wire name — while the axis a
          shopper reads is Expiry, so its anchor comes from the facet, not the key. */}
      <FilterSelect
        id={facetAnchorId('expiry')}
        label={dict.filters.replacement}
        value={params.get('replacement') ?? ALL}
        options={REPLACEMENTS}
        labelOf={(v) => dict.filters.replacements[v as (typeof REPLACEMENTS)[number]]}
        onChange={(v) => setParam('replacement', v)}
      />

      {colors.length > 0 ? (
        <FilterSelect
          id={facetAnchorId('color')}
          label={dict.filters.color}
          value={activeColor}
          options={colorOptions}
          labelOf={labelFor}
          onChange={(v) => setParam('color', v)}
        />
      ) : null}

      <FilterSelect
        id={facetAnchorId('diameter')}
        label={dict.nav.facets.diameter}
        value={params.get('diameter') ?? ALL}
        options={DIAMETERS}
        labelOf={(v) => {
          const bucket = DIAMETER_BUCKETS.find((b) => b.id === v);
          return bucket ? diameterBucketLabel(bucket) : v;
        }}
        onChange={(v) => setParam('diameter', v)}
      />

      <FilterSelect
        id={facetAnchorId('material')}
        label={dict.nav.facets.material}
        value={params.get('material') ?? ALL}
        options={MATERIALS}
        labelOf={(v) => {
          const value = MATERIAL_VALUES.find((m) => m.material === v);
          return value ? dict.nav.facets.materials[value.id] : v;
        }}
        onChange={(v) => setParam('material', v)}
      />

      <FilterSelect
        label={dict.filters.sort}
        value={params.get('sort') ?? ALL}
        options={SORTS}
        labelOf={(v) => dict.filters.sorts[v as (typeof SORTS)[number]]}
        onChange={(v) => setParam('sort', v)}
      />

      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          {dict.filters.clear}
        </Button>
      ) : null}
    </div>
  );
}
