'use client';
import Link from 'next/link';
import { ShoppingBag, User, Search } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { MegaNav } from './mega-nav';
import { MobileNav } from './mobile-nav';
import { LocaleSwitcher } from './locale-switcher';
import { useCart } from '@/features/cart/use-cart';

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5 md:gap-8">
        <MobileNav locale={locale} dict={dict} />
        <Link
          href={`/${locale}`}
          className="text-lg font-semibold tracking-[0.2em] uppercase"
        >
          Vivimoon
        </Link>
        <MegaNav locale={locale} dict={dict} />
        <Link
          href={`/${locale}/quiz`}
          className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
        >
          {dict.nav.quiz}
        </Link>
        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <div className="hidden items-center gap-2 rounded-full border px-3.5 py-2 text-muted-foreground transition-colors focus-within:border-ring md:flex">
            <Search className="size-4" />
            <input
              aria-label={dict.common.search}
              placeholder={dict.common.search}
              className="w-28 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Link
            href={`/${locale}/account`}
            aria-label={dict.account.title}
            className="hidden size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
          >
            <User className="size-5" />
          </Link>
          <Link
            href={`/${locale}/cart`}
            aria-label={dict.cart.title}
            className="relative flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Link>
          <div className="ml-1 hidden md:block">
            <LocaleSwitcher currentLocale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
}
