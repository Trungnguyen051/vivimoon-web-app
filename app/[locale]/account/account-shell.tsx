'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight, CircleUser, Heart, MapPin, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type AccountShellDict = {
  accountInfo: string;
  orders: string;
  favorites: string;
  addresses: string;
  backToAccount: string;
};

/**
 * Shared frame for every /account page: a sidebar from md up, and on mobile
 * /account itself is the menu while sub-pages show a back link instead.
 * Which one is on screen is decided by CSS from the pathname, so there is no
 * viewport check in JS. A sub-page plugs in by simply living under /account:
 * the layout wraps it, and the row whose path prefix matches is highlighted.
 */
export function AccountShell({
  locale, name, memberSince, orderCount, dict, children,
}: {
  locale: string;
  name: string;
  memberSince: string;
  orderCount: number;
  dict: AccountShellDict;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/${locale}/account`;
  const isHub = pathname === base;
  const rows = [
    { href: `${base}/profile`, label: dict.accountInfo, icon: CircleUser, active: isHub || pathname.startsWith(`${base}/profile`) },
    { href: `${base}/orders`, label: dict.orders, icon: ShoppingBag, active: pathname.startsWith(`${base}/orders`), badge: orderCount },
    { href: `${base}/favorites`, label: dict.favorites, icon: Heart, active: pathname.startsWith(`${base}/favorites`) },
    { href: `${base}/addresses`, label: dict.addresses, icon: MapPin, active: pathname.startsWith(`${base}/addresses`) },
  ];

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 md:flex-row md:items-start md:gap-9 md:px-10 md:py-10">
      {!isHub && (
        <Link href={base} className="flex items-center gap-2 text-sm text-muted-foreground md:hidden">
          <ArrowLeft className="size-4" />
          {dict.backToAccount}
        </Link>
      )}
      <aside className={cn('w-full md:block md:w-64 md:shrink-0', !isHub && 'hidden')}>
        <h2 className="text-2xl font-semibold uppercase tracking-tight">{name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{memberSince}</p>
        <hr className="my-6 border-border" />
        <nav aria-label={dict.backToAccount}>
          <ul className="flex flex-col">
            {rows.map(({ href, label, icon: Icon, active, badge }) => (
              <li key={href} className="border-b border-border last:border-b-0 md:border-b-0">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 border-l-2 border-transparent px-3 py-4 text-sm md:py-3',
                    active && 'md:border-primary md:bg-primary/10 md:text-primary',
                  )}
                >
                  <Icon className="size-5" />
                  <span className="flex-1">{label}</span>
                  {badge !== undefined && (
                    <span className="rounded-full bg-foreground px-2 py-0.5 text-xs text-background">{badge}</span>
                  )}
                  <ArrowRight className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className={cn('min-w-0 flex-1 border border-border', isHub && 'hidden md:block')}>{children}</div>
    </div>
  );
}
