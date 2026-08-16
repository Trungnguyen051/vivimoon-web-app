'use client';
import Link from 'next/link';
import { ShoppingCart, User, Search } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { MegaNav } from './mega-nav';
import { MobileNav } from './mobile-nav';
import { LocaleSwitcher } from './locale-switcher';
import { useCart } from '@/features/cart/use-cart';

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { count } = useCart();
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:gap-6">
        <MobileNav locale={locale} dict={dict} />
        <Link href={`/${locale}`} className="font-heading text-xl font-bold">Vivimoon</Link>
        <MegaNav locale={locale} dict={dict} />
        <div className="ml-auto flex items-center gap-1 md:gap-4">
          <div className="hidden items-center gap-2 rounded border px-2 md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input aria-label={dict.common.search} placeholder={dict.common.search} className="bg-transparent py-1 text-sm outline-none" />
          </div>
          <button aria-label="Account" className="hidden h-11 w-11 items-center justify-center rounded-md hover:bg-muted md:flex">
            <User className="h-5 w-5" />
          </button>
          <Link href={`/${locale}/cart`} aria-label={dict.cart.title} className="relative flex h-11 w-11 items-center justify-center rounded-md hover:bg-muted">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 ? <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-primary px-1 text-center text-xs leading-4 text-primary-foreground">{count}</span> : null}
          </Link>
          <div className="hidden md:block">
            <LocaleSwitcher currentLocale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
}
