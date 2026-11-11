'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { LENS_FACETS, facetHref, facetValueHref, type LensFacet } from '@/lib/products/lens-facets';
import { Swatches, valueLabel } from './facet-value';
import { cn } from '@/lib/utils/cn';

/**
 * Sản Phẩm, as the design draws it: four Lens Facets down the left, the active facet's
 * values down the right (#87).
 *
 * The old menu listed five collection names — how Vivimoon groups its stock, not what a
 * shopper came to decide. This answers the questions they actually arrive with.
 *
 * One DOM serves pointer and keyboard. A separate flattened structure for keyboard users
 * was rejected as two things that can drift, so hovering and arrowing do the same thing:
 * make a facet active and swap the column beside it. Màu sắc is active on open — a panel
 * that waits to be aimed at is useless before you aim.
 *
 * The facets are links as well as a switcher, which is why this is not a `tablist`:
 * `role="tab"` would override the link semantics and stop announcing that they navigate.
 * `aria-current="true"` says which one is showing — "current within a set" is exactly
 * what it means — and the values list is named by the facet it belongs to, so moving into
 * it says whose values these are rather than leaving colour to carry that alone.
 */
export function FacetBrowser({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [active, setActive] = useState(0);
  const facetRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const activeFacet: LensFacet = LENS_FACETS[active];
  const facetDomId = (facet: LensFacet) => `facet-${facet.id}`;

  /** Arrowing moves focus and the panel together, so both input modes see one thing. */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: LENS_FACETS.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;

    event.preventDefault();
    const index = Math.max(0, Math.min(LENS_FACETS.length - 1, next));
    setActive(index);
    facetRefs.current[index]?.focus();
  };

  return (
    <div className="flex gap-6 p-4">
      <ul className="flex w-[200px] shrink-0 flex-col gap-6" onKeyDown={onKeyDown}>
        {LENS_FACETS.map((facet, index) => {
          const isActive = index === active;
          return (
            <li key={facet.id}>
              <Link
                id={facetDomId(facet)}
                ref={(node) => { facetRefs.current[index] = node; }}
                href={facetHref(facet, locale)}
                aria-current={isActive ? 'true' : undefined}
                // Roving tabindex: one stop for the whole column, then Tab moves on into
                // the values of whichever facet that stop left showing.
                tabIndex={isActive ? 0 : -1}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={cn(
                  'flex items-center justify-between gap-2 text-base',
                  isActive ? 'text-[#997e4f]' : 'text-foreground',
                )}
              >
                {dict.nav.facets[facet.id]}
                {isActive ? <ChevronRight className="size-6" aria-hidden="true" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="w-px self-stretch bg-border" aria-hidden="true" />

      <ul aria-labelledby={facetDomId(activeFacet)} className="flex flex-col gap-6">
        {activeFacet.values.map((value) => (
          <li key={value.id}>
            <Link
              href={facetValueHref(value, locale)}
              className="flex items-center gap-2 text-base text-foreground"
            >
              {valueLabel(value, dict)}
              {value.kind === 'colour' ? <Swatches value={value} /> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
