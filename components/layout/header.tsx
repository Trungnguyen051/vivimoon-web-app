'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Logo } from './logo';
import { MegaNav } from './mega-nav';
import { MobileNav } from './mobile-nav';
import { LocaleSwitcher } from './locale-switcher';
import { useCart } from '@/features/cart/use-cart';
import { cn } from '@/lib/utils/cn';

/** A 24px glyph as the design draws it, in a 44px target the design does not. */
const ACTION_CLASS =
  'flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { count } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 py-3.5 md:gap-8 md:px-10">
        <MobileNav locale={locale} dict={dict} />
        {/* The design draws the wordmark at 48px tall; it steps down on narrow
            screens so it does not crowd the drawer trigger (no mobile frame yet). */}
        <Link href={`/${locale}`} className="shrink-0">
          <Logo className="h-8 md:h-12" priority />
        </Link>

        {/* The design's nav is exactly five items, centred between the logo and the
            actions; the Quiz is reached from the homepage teaser rather than a sixth
            link in this row (#40). This is also where search opens — over the nav,
            never shoving it sideways, so one click on the magnifier doesn't slide
            the whole row (#74). */}
        <div className="relative hidden flex-1 items-center justify-center lg:flex">
          <div
            className={cn('transition-opacity duration-150', searchOpen && 'opacity-0')}
            aria-hidden={searchOpen || undefined}
            inert={searchOpen}
          >
            <MegaNav locale={locale} dict={dict} />
          </div>

          {searchOpen ? (
            <div className="absolute inset-x-0 flex items-center gap-2 rounded-full border bg-background px-4 focus-within:border-ring">
              <Search aria-hidden className="size-5 shrink-0 text-muted-foreground" />
              {/* No form and no submit handler, deliberately: there is no search
                  route yet, and a field that accepts a query and swallows it is
                  worse than one that is plainly a placeholder. Enter does nothing
                  because nothing is listening (#74). */}
              <input
                ref={inputRef}
                aria-label={dict.common.search}
                placeholder={dict.common.search}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
                onBlur={() => setSearchOpen(false)}
                className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          ) : null}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0 lg:gap-2">
          {/* Leftmost, so the design's three shopping glyphs stay contiguous and in
              its order — language is a site setting, not a shopping action. */}
          <div className="hidden md:block">
            <LocaleSwitcher currentLocale={locale} label={dict.common.language} />
          </div>
          <button
            type="button"
            aria-label={dict.common.search}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
            className={cn(ACTION_CLASS, 'hidden lg:flex')}
          >
            <Search className="size-6" />
          </button>
          <Link
            href={`/${locale}/account`}
            aria-label={dict.account.title}
            className={cn(ACTION_CLASS, 'hidden md:flex')}
          >
            <User className="size-6" />
          </Link>
          <Link
            href={`/${locale}/cart`}
            aria-label={dict.cart.title}
            className={cn(ACTION_CLASS, 'relative')}
          >
            <ShoppingCart className="size-6" />
            {count > 0 ? (
              <span className="absolute top-1 right-0 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-medium text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
