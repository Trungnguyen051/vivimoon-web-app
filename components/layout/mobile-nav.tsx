'use client';
import Link from 'next/link';
import { Menu, Search } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { getNavItems } from './nav-items';
import { LENS_FACETS, facetValueHref } from '@/lib/products/lens-facets';
import { Swatches, valueLabel } from './facet-value';
import { LocaleSwitcher } from './locale-switcher';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ROW_CLASS = 'flex min-h-11 items-center rounded-md px-2 text-base font-medium';

export function MobileNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = getNavItems(dict, locale);

  return (
    <Sheet>
      <SheetTrigger
        aria-label={dict.common.menu}
        className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" closeLabel={dict.common.close} className="w-80 max-w-[85vw]">
        <SheetHeader className="border-b">
          <SheetTitle>Vivimoon</SheetTitle>
        </SheetHeader>

        <div className="px-4">
          {/* Search shares the storefront's search field; submission wiring is a follow-up. */}
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 rounded-md border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              aria-label={dict.common.search}
              placeholder={dict.common.search}
              className="h-11 flex-1 bg-transparent text-sm outline-none"
            />
          </form>
        </div>

        {/* The same five items as the desktop nav, from the same source — only the
            disclosure differs: an accordion here, a dropdown there.

            This scrolls because a facet section can make the drawer taller than the
            screen: Màu sắc and Đường kính carry five values each, which is ~220px on
            top of a drawer that already fills most of a small phone. The popup is
            `h-full` and the dialog locks body scroll, so without a scroll region here
            the rows below Sản Phẩm — and the locale switcher — simply cannot be
            reached. `min-h-0` is the half that is easy to miss: a flex child will not
            shrink below its content without it, so `overflow-y-auto` alone does
            nothing. Four fixed rows never had this problem. */}
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2">
          {items.map((item) =>
            /* Sản Phẩm's four Lens Facets, each an expandable section carrying its own
               values — the same four the desktop panel shows, from the same data. There
               is no hover on touch, so there is no active facet to mirror: expanding is
               the whole interaction. One open at a time, which is what the group
               accordion below already does — the drawer's own idiom (#113). */
            item.kind === 'facets' ? (
              <Accordion key={item.id}>
                {LENS_FACETS.map((facet) => (
                  <AccordionItem key={facet.id} value={facet.id} className="border-b-0">
                    <AccordionTrigger className={`${ROW_CLASS} hover:bg-muted hover:no-underline`}>
                      {dict.nav.facets[facet.id]}
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      {facet.values.map((value) => (
                        <SheetClose
                          key={value.id}
                          render={
                            <Link
                              href={facetValueHref(value, locale)}
                              className={`${ROW_CLASS} gap-2 pl-6 font-normal hover:bg-muted`}
                            />
                          }
                        >
                          {valueLabel(value, dict)}
                          {/* Smaller than the desktop panel's: a drawer row is tighter
                              and indented, so the label keeps the width it needs. A
                              family carries three shades, Không màu one. */}
                          {value.kind === 'colour' ? <Swatches value={value} className="size-4" /> : null}
                        </SheetClose>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : item.kind === 'group' ? (
              <Accordion key={item.id}>
                <AccordionItem value={item.id} className="border-b-0">
                  <AccordionTrigger className={`${ROW_CLASS} hover:bg-muted hover:no-underline`}>
                    {item.label}
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    {item.items.map((child) => (
                      <SheetClose
                        key={child.id}
                        render={
                          <Link href={child.href} className={`${ROW_CLASS} pl-6 font-normal hover:bg-muted`} />
                        }
                      >
                        {child.label}
                      </SheetClose>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <SheetClose
                key={item.id}
                render={<Link href={item.href} className={`${ROW_CLASS} hover:bg-muted`} />}
              >
                {item.label}
              </SheetClose>
            ),
          )}
        </nav>

        <div className="mt-auto border-t p-4">
          <LocaleSwitcher currentLocale={locale} label={dict.common.language} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
