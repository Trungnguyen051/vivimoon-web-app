'use client';
import Link from 'next/link';
import { Menu, Search } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { getNavItems } from './nav-items';
import { LocaleSwitcher } from './locale-switcher';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function MobileNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = getNavItems(dict);
  return (
    <Sheet>
      <SheetTrigger
        aria-label={dict.common.menu}
        className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-muted md:hidden"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 max-w-[85vw]">
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

        <nav className="flex flex-col px-2">
          {items.map((it) => (
            <SheetClose asChild key={it.slug}>
              <Link
                href={`/${locale}/collection/${it.slug}`}
                className="flex min-h-11 items-center rounded-md px-2 text-base font-medium hover:bg-muted"
              >
                {it.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-auto border-t p-4">
          <LocaleSwitcher currentLocale={locale} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
