'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Droplet, ListFilter, Wind } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { FacetCounts } from '@/lib/api/resources/catalog';
import {
  COLLECTION_PAGE_SIZE as PAGE_SIZE, DEFAULT_SORT, PRICE_PRESETS, lensSeriesSchema, makeupStyleSchema,
  occasionSchema, parseDiameterRange, productQuerySchema, replacementScheduleSchema,
} from '@/lib/api/schemas/catalog';
import { MATERIAL_VALUES, diameterBucketLabel, facetAnchorId } from '@/lib/products/lens-facets';
import { LENS_ENTRIES } from '@/lib/products/lens-entries';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils/cn';
import { CARD_VIEWS, parseCardView } from '@/lib/products/plp-card';

/** Every field a collection URL can carry, so "Xoá tất cả" cannot fall behind one. `sort` survives it. */
const FILTER_KEYS = Object.keys(productQuerySchema.shape).filter((key) => key !== 'sort');
const SORTS = ['bestselling', 'newest', 'price-asc', 'price-desc'] as const;
const COMPARE_ARTICLE = 'silicone-hydrogel-vs-lens-thuong';

/** Navigates to the collection with new params, keeping the scroll and restarting the paging. */
function useSetParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return {
    params,
    pathname,
    navigate(edit: (next: URLSearchParams) => void, { keepPaging = false } = {}) {
      const next = new URLSearchParams(params.toString());
      if (!keepPaging) next.delete('show');
      edit(next);
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
  };
}

/** The Color Family's own swatch where the colour is a family (Nâu, Đen, Xám); else the CSS colour name. */
const swatchOf = (color: string) => LENS_ENTRIES.find((entry) => entry.id === color)?.swatches[0] ?? color;

function Count({ n }: { n: number }) {
  return <span className="text-muted-foreground">({n})</span>;
}

/** A pickable chip. A zero-count option stays visible, but can't be picked into a dead end. */
function Chip({ pressed, count, onClick, children }: {
  pressed: boolean; count: number; onClick: () => void; children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={!pressed && count === 0}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        pressed ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-foreground/40',
      )}
    >
      {children}
      {' '}<Count n={count} />
    </button>
  );
}

function CheckRow({ checked, count, onChange, children }: {
  checked: boolean; count: number; onChange: () => void; children: ReactNode;
}) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2.5 text-sm', !checked && count === 0 && 'cursor-not-allowed opacity-40')}>
      <input
        type="checkbox"
        checked={checked}
        disabled={!checked && count === 0}
        onChange={onChange}
        className="size-5 shrink-0 accent-primary"
      />
      <span>
        {children}
        {' '}<Count n={count} />
      </span>
    </label>
  );
}

function Group({ value, title, anchor, children }: { value: string; title: string; anchor?: string; children: ReactNode }) {
  return (
    <AccordionItem value={value} className="border-t border-border py-2 not-last:border-b-0">
      {/* The id is what a Lens Facet in the Sản Phẩm menu aims its fragment at. */}
      <AccordionTrigger id={anchor} className="py-2 text-base font-medium hover:no-underline">{title}</AccordionTrigger>
      <AccordionContent className="pb-4 pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

const GROUPS = ['lensLine', 'color', 'expiry', 'diameter', 'makeupStyle', 'series', 'occasion', 'price'];

/**
 * The collection's filter sidebar (Figma PLP 55:2): one collapsible group per facet, each
 * option with the count the catalog gives it, all state in the URL so a filtered page is
 * shareable. Within a group, picks add to a set; across groups they narrow.
 */
export function CollectionFilters({ dict, counts }: { dict: Dictionary; counts: FacetCounts }) {
  const t = dict.filters.sidebar;
  const facets = dict.nav.facets;
  const { params, pathname, navigate } = useSetParams();

  const picked = (key: string) => params.get(key)?.split(',').filter(Boolean) ?? [];
  const toggle = (key: string, value: string) =>
    navigate((next) => {
      const current = picked(key);
      const set = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (set.length > 0) next.set(key, set.join(','));
      else next.delete(key);
    });
  const count = (key: keyof FacetCounts, value: string) => counts[key][value] ?? 0;
  const hasFilters = FILTER_KEYS.some((key) => params.get(key));

  const setPrice = (min: string | undefined, max: string | undefined) =>
    navigate((next) => {
      for (const [key, value] of [['minPrice', min], ['maxPrice', max]] as const) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
    });
  const minPrice = params.get('minPrice') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';
  const applyTypedPrice = (form: HTMLElement) => {
    const read = (name: string) => (form.querySelector(`[name=${name}]`) as HTMLInputElement).value.replace(/\D/g, '');
    const [min, max] = [read('minPrice'), read('maxPrice')];
    if (min === minPrice && max === maxPrice) return;
    setPrice(min || undefined, max || undefined);
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ListFilter className="size-5" aria-hidden />
          {t.title}
        </h2>
        {hasFilters ? (
          <button
            type="button"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            onClick={() => navigate((next) => FILTER_KEYS.forEach((key) => next.delete(key)))}
          >
            {t.clearAll}
          </button>
        ) : null}
      </div>

      {/* The pinned "Độ của bạn" block (#196) goes here, above the groups. */}

      <Accordion multiple defaultValue={GROUPS}>
        <Group value="lensLine" title={t.lensLine} anchor={facetAnchorId('material')}>
          <div className="space-y-3">
            {MATERIAL_VALUES.map(({ id, material }) => {
              const checked = picked('material').includes(material);
              const n = count('material', material);
              const Icon = id === 'moisture' ? Droplet : Wind;
              return (
                <label
                  key={id}
                  className={cn(
                    'flex cursor-pointer items-start gap-2.5 border p-3 transition-colors',
                    checked ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/40',
                    !checked && n === 0 && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && n === 0}
                    onChange={() => toggle('material', material)}
                    className="mt-0.5 size-5 shrink-0 accent-primary"
                  />
                  <span className="space-y-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon className="size-4 text-primary" aria-hidden />
                      {facets.materials[id]}
                      {' '}<Count n={n} />
                    </span>
                    <span className="block text-xs text-muted-foreground">{t.materialNotes[id]}</span>
                  </span>
                </label>
              );
            })}
            <Link
              href={`/${pathname.split('/')[1]}/articles/${COMPARE_ARTICLE}`}
              className="inline-block text-xs underline underline-offset-4"
            >
              {t.compareLines}
            </Link>
          </div>
        </Group>

        <Group value="color" title={facets.color} anchor={facetAnchorId('color')}>
          <div className="flex flex-wrap gap-2">
            {Object.keys(counts.color).map((color) => (
              <Chip key={color} pressed={picked('color').includes(color)} count={count('color', color)} onClick={() => toggle('color', color)}>
                <span className="size-3.5 rounded-full ring-1 ring-border" style={{ backgroundColor: swatchOf(color) }} aria-hidden />
                {dict.filters.colors[color as keyof typeof dict.filters.colors] ?? color}
              </Chip>
            ))}
            {/* Trong suốt is the clear Product Line, chosen by the absence of a colour (CONTEXT.md: Không màu). */}
            {counts.productLine.trongSuot !== undefined ? (
              <Chip
                pressed={picked('productLine').includes('trongSuot')}
                count={count('productLine', 'trongSuot')}
                onClick={() => toggle('productLine', 'trongSuot')}
              >
                <span className="size-3.5 rounded-full bg-background ring-1 ring-border" aria-hidden />
                {dict.filters.productLines.trongSuot}
              </Chip>
            ) : null}
          </div>
        </Group>

        <Group value="expiry" title={facets.expiry} anchor={facetAnchorId('expiry')}>
          <div className="space-y-2.5">
            {replacementScheduleSchema.options.map((r) => (
              <CheckRow key={r} checked={picked('replacement').includes(r)} count={count('replacement', r)} onChange={() => toggle('replacement', r)}>
                {dict.filters.replacements[r]}
              </CheckRow>
            ))}
          </div>
        </Group>

        <Group value="diameter" title={facets.diameter} anchor={facetAnchorId('diameter')}>
          <div className="flex flex-wrap gap-2">
            {Object.keys(counts.diameter)
              .flatMap((id) => {
                const range = parseDiameterRange(id);
                return range ? [{ id, ...range }] : [];
              })
              .sort((a, b) => a.min - b.min || a.max - b.max)
              .map((range) => (
                <Chip key={range.id} pressed={picked('diameter').includes(range.id)} count={count('diameter', range.id)} onClick={() => toggle('diameter', range.id)}>
                  {diameterBucketLabel(range)}
                </Chip>
              ))}
          </div>
        </Group>

        <Group value="makeupStyle" title={t.makeupStyle}>
          <div className="flex flex-wrap gap-2">
            {makeupStyleSchema.options.map((s) => (
              <Chip key={s} pressed={picked('makeupStyle').includes(s)} count={count('makeupStyle', s)} onClick={() => toggle('makeupStyle', s)}>
                {t.makeupStyles[s]}
              </Chip>
            ))}
          </div>
        </Group>

        <Group value="series" title={t.series}>
          <div className="space-y-2.5">
            {lensSeriesSchema.options.map((s) => (
              <CheckRow key={s} checked={picked('series').includes(s)} count={count('series', s)} onChange={() => toggle('series', s)}>
                {t.seriesNames[s]}
              </CheckRow>
            ))}
          </div>
        </Group>

        <Group value="occasion" title={t.occasion}>
          <div className="flex flex-wrap gap-2">
            {occasionSchema.options.map((o) => (
              <Chip key={o} pressed={picked('occasion').includes(o)} count={count('occasion', o)} onClick={() => toggle('occasion', o)}>
                {t.occasions[o]}
              </Chip>
            ))}
          </div>
        </Group>

        <Group value="price" title={t.price}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PRICE_PRESETS.map((preset) => {
                const min = preset.min?.toString() ?? '';
                const max = preset.max?.toString() ?? '';
                const pressed = minPrice === min && maxPrice === max;
                return (
                  <Chip
                    key={preset.id}
                    pressed={pressed}
                    count={count('price', preset.id)}
                    onClick={() => (pressed ? setPrice(undefined, undefined) : setPrice(min || undefined, max || undefined))}
                  >
                    {t.pricePresets[preset.id]}
                  </Chip>
                );
              })}
            </div>
            {/* Keyed on the URL so the fields follow a preset or a clear rather than keeping stale input. */}
            {/* Applies on Enter or when focus leaves the pair — phone number pads have no return key. */}
            <div
              key={`${minPrice}-${maxPrice}`}
              className="flex items-center gap-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyTypedPrice(e.currentTarget);
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) applyTypedPrice(e.currentTarget);
              }}
            >
              <Input name="minPrice" inputMode="numeric" aria-label={t.priceFrom} placeholder={t.priceFrom} defaultValue={minPrice} className="h-10 rounded-none" />
              <span className="text-muted-foreground" aria-hidden>–</span>
              <Input name="maxPrice" inputMode="numeric" aria-label={t.priceTo} placeholder={t.priceTo} defaultValue={maxPrice} className="h-10 rounded-none" />
            </div>
          </div>
        </Group>
      </Accordion>
    </div>
  );
}

/** "Sắp xếp: …" above the grid. Best-selling is the default and never written to the URL. */
export function CollectionSort({ dict }: { dict: Dictionary }) {
  const { params, navigate } = useSetParams();
  const label = (sort: (typeof SORTS)[number]) => dict.filters.sidebar.sortBy.replace('{sort}', dict.filters.sorts[sort]);

  return (
    <Select
      value={params.get('sort') ?? DEFAULT_SORT}
      onValueChange={(value) =>
        navigate((next) => {
          if (value && value !== DEFAULT_SORT) next.set('sort', value);
          else next.delete('sort');
        })
      }
      // Base UI reads the trigger's text from `items`, so the chosen sort reads "Sắp xếp: …".
      items={Object.fromEntries(SORTS.map((s) => [s, label(s)]))}
    >
      <SelectTrigger aria-label={dict.filters.sort} className="h-10 min-w-44 rounded-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {SORTS.map((s) => (
            <SelectItem key={s} value={s}>{dict.filters.sorts[s]}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

/**
 * "Đang xem 8 / N sản phẩm" and "Xem thêm sản phẩm". More is asked for through `?show=`,
 * so the server renders the longer list, the cards already on screen stay put, and the
 * page doesn't scroll.
 */
export function CollectionLoadMore({ dict, shown, total }: { dict: Dictionary; shown: number; total: number }) {
  const t = dict.filters.sidebar;
  const { navigate } = useSetParams();
  return (
    <div className="flex flex-col items-center gap-3 pt-6">
      <p className="text-sm text-muted-foreground">
        {t.showing.replace('{shown}', String(shown)).replace('{total}', String(total))}
      </p>
      {shown < total ? (
        <Button
          variant="outline"
          className="h-12 w-full rounded-none px-6 md:w-auto"
          onClick={() => navigate((next) => next.set('show', String(shown + PAGE_SIZE)), { keepPaging: true })}
        >
          {t.loadMore}
        </Button>
      ) : null}
    </div>
  );
}

/** Mobile: "Bộ lọc" opens the same groups in a sheet (Figma PLP 194:431). */
export function CollectionFiltersSheet({ dict, counts }: { dict: Dictionary; counts: FacetCounts }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" className="h-11 w-full rounded-none" />}>
        <ListFilter className="size-4" aria-hidden />
        {dict.filters.sidebar.title}
      </SheetTrigger>
      <SheetContent side="left" closeLabel={dict.common.close} className="w-full max-w-sm overflow-y-auto p-4 pt-12">
        <SheetTitle className="sr-only">{dict.filters.sidebar.title}</SheetTitle>
        <CollectionFilters dict={dict} counts={counts} />
      </SheetContent>
    </Sheet>
  );
}

/**
 * "Xem ảnh: Vân lens / Người mẫu / Cận mắt" switches every card's photo (Figma 55:231, 194:471).
 * Kept in `?view=` so a shared link shows the same photos; the paging stays. Người mẫu is the default.
 */
export function CollectionImageView({ dict, className }: { dict: Dictionary; className?: string }) {
  const { params, navigate } = useSetParams();
  const current = parseCardView(params.get('view') ?? undefined);
  return (
    <div role="group" aria-label={dict.collection.imageView} className={cn('flex items-center gap-2 lg:gap-3', className)}>
      <span className="text-[11px] text-muted-foreground lg:text-sm" aria-hidden>{dict.collection.imageView}</span>
      <div className="flex gap-1.5 lg:gap-0 lg:border lg:border-border">
        {CARD_VIEWS.map((view) => (
          <button
            key={view}
            type="button"
            aria-pressed={current === view}
            onClick={() =>
              navigate((next) => {
                if (view === 'face') next.delete('view');
                else next.set('view', view);
              }, { keepPaging: true })
            }
            className={cn(
              'border px-2.5 py-1 text-[11px] whitespace-nowrap transition-colors lg:border-0 lg:px-3.5 lg:py-2 lg:text-sm',
              current === view ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted',
            )}
          >
            {dict.viewer.tabs[view]}
          </button>
        ))}
      </div>
    </div>
  );
}
