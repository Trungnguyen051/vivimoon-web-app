'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { getNavItems } from './nav-items';
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils/cn';

/**
 * Both kinds of entry render on the trigger's box — the Sản Phẩm group and the
 * four plain links alike — so the five items sit flush instead of alternating
 * padding, and all five read muted until one is current.
 */
const ITEM_CLASS = cn(navigationMenuTriggerStyle(), 'p-0 px-2.5 py-1.5 font-normal text-muted-foreground');

export function MegaNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = getNavItems(dict, locale);
  const pathname = usePathname();

  // Radix labels this landmark "Main" by default, which would announce in English.
  return (
    <NavigationMenu aria-label={dict.common.mainNav} className="hidden md:flex">
      <NavigationMenuList className="gap-4">
        {items.map((item) => (
          <NavigationMenuItem key={item.id}>
            {item.kind === 'group' ? (
              <>
                {/* The collections moved inside the dropdown, so the trigger carries the
                    current one's highlight — otherwise nothing in the row marks where you are. */}
                <NavigationMenuTrigger
                  className={cn(ITEM_CLASS, item.items.some((child) => child.href === pathname) && 'text-foreground')}
                >
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-56 gap-1 p-2">
                    {item.items.map((child) => (
                      <li key={child.id}>
                        <NavigationMenuLink asChild className={cn(pathname === child.href && 'text-foreground')}>
                          <Link href={child.href} aria-current={pathname === child.href ? 'page' : undefined}>
                            {child.label}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild className={cn(ITEM_CLASS, pathname === item.href && 'text-foreground')}>
                <Link href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>
                  {item.label}
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
