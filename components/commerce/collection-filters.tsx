'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { productLineSchema, replacementScheduleSchema } from '@/lib/api/schemas/catalog';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// From the schema, not a parallel list: a new line can't be added to the
// taxonomy and silently stay unselectable here.
const PRODUCT_LINES = productLineSchema.options;
const REPLACEMENTS = replacementScheduleSchema.options;
const SORTS = ['newest', 'price-asc', 'price-desc', 'bestselling'] as const;
const ALL = 'all';

export function CollectionFilters({ dict, colors }: { dict: Dictionary; colors: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const hasFilters = ['productLine', 'replacement', 'sort', 'color'].some((k) => params.get(k));

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

  /**
   * Base UI's select reads the trigger's text from `items`, where Radix rendered the
   * chosen `SelectItem`'s children. Each map is built from the same source as the
   * options below it, so a label cannot drift from the option it names.
   */
  const optionLabels = <T extends string>(
    allLabel: string,
    values: readonly T[],
    labelOf: (value: T) => string,
  ): Record<string, string> => ({
    [ALL]: allLabel,
    ...Object.fromEntries(values.map((value) => [value, labelOf(value)])),
  });

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
      <Select
        value={params.get('productLine') ?? ALL}
        onValueChange={(v) => setParam('productLine', v)}
        items={optionLabels(dict.filters.productLine, PRODUCT_LINES, (t) => dict.filters.productLines[t])}
      >
        <SelectTrigger className="w-40" aria-label={dict.filters.productLine}>
          <SelectValue placeholder={dict.filters.productLine} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ALL}>{dict.filters.productLine}</SelectItem>
            {PRODUCT_LINES.map((t) => (
              <SelectItem key={t} value={t}>{dict.filters.productLines[t]}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={params.get('replacement') ?? ALL}
        onValueChange={(v) => setParam('replacement', v)}
        items={optionLabels(dict.filters.replacement, REPLACEMENTS, (r) => dict.filters.replacements[r])}
      >
        <SelectTrigger className="w-40" aria-label={dict.filters.replacement}>
          <SelectValue placeholder={dict.filters.replacement} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ALL}>{dict.filters.replacement}</SelectItem>
            {REPLACEMENTS.map((r) => (
              <SelectItem key={r} value={r}>{dict.filters.replacements[r]}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {colors.length > 0 ? (
        <Select
          value={activeColor}
          onValueChange={(v) => setParam('color', v)}
          items={optionLabels(dict.filters.color, colorOptions, labelFor)}
        >
          <SelectTrigger className="w-40" aria-label={dict.filters.color}>
            <SelectValue placeholder={dict.filters.color} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>{dict.filters.color}</SelectItem>
              {colorOptions.map((value) => (
                <SelectItem key={value} value={value}>{labelFor(value)}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : null}

      <Select
        value={params.get('sort') ?? ALL}
        onValueChange={(v) => setParam('sort', v)}
        items={optionLabels(dict.filters.sort, SORTS, (s) => dict.filters.sorts[s])}
      >
        <SelectTrigger className="w-40" aria-label={dict.filters.sort}>
          <SelectValue placeholder={dict.filters.sort} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ALL}>{dict.filters.sort}</SelectItem>
            {SORTS.map((s) => (
              <SelectItem key={s} value={s}>{dict.filters.sorts[s]}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          {dict.filters.clear}
        </Button>
      ) : null}
    </div>
  );
}
