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
 *
 * Every item reserves the underline's 2px whether or not it is current, so the
 * row does not shift by two pixels as you navigate.
 */
const ITEM_CLASS = cn(
  navigationMenuTriggerStyle(),
  'rounded-none border-b-2 border-transparent p-0 px-2.5 py-1.5 font-normal text-muted-foreground',
);

/** Where you are. Route-driven, so it moves when you navigate rather than on click. */
const CURRENT_CLASS = 'border-foreground text-foreground';

export function MegaNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = getNavItems(dict, locale);
  const pathname = usePathname();

  // Radix labels this landmark "Main" by default, which would announce in English.
  return (
    /* `viewport={false}` drops the shared centred viewport, so the dropdown renders
       against its own item and opens flush with the left edge of Sản Phẩm rather
       than floating to its right (#74). */
    <NavigationMenu viewport={false} aria-label={dict.common.mainNav} className="hidden md:flex">
      <NavigationMenuList className="gap-4">
        {items.map((item) => (
          <NavigationMenuItem key={item.id}>
            {item.kind === 'group' ? (
              <>
                {/* The collections live inside the dropdown, so the trigger carries the
                    current one's mark — otherwise nothing in the row says where you are
                    while you browse a collection.

                    `aria-current="true"`, not `"page"`: the trigger is not itself the
                    page, it is the section containing it. That also means the state is
                    announced rather than only drawn, which an underline alone would not
                    do for anyone not looking at it.

                    The chevron is hidden here rather than removed from the vendored
                    primitive, which stays close to upstream so it can be regenerated.
                    It is decorative (`aria-hidden`), so hiding it costs nothing. */}
                <NavigationMenuTrigger
                  aria-current={item.items.some((child) => child.href === pathname) ? 'true' : undefined}
                  className={cn(
                    ITEM_CLASS,
                    '[&>svg]:hidden',
                    item.items.some((child) => child.href === pathname) && CURRENT_CLASS,
                  )}
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
              <NavigationMenuLink asChild className={cn(ITEM_CLASS, pathname === item.href && CURRENT_CLASS)}>
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
