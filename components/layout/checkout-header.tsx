import { Fragment } from 'react';
import Link from 'next/link';
import { Check, Lock, Phone } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { contactHotline } from '@/lib/support/contact-channels';
import { cn } from '@/lib/utils/cn';
import { Logo } from './logo';

/**
 * The slim checkout header (Figma 58:4): logo, the 3-step indicator, "Thanh toán bảo
 * mật" and the hotline. It replaces the site header and footer on checkout routes.
 * `step` is the current one, 1-based; earlier steps show a tick.
 */
export function CheckoutHeader({ locale, dict, step }: { locale: Locale; dict: Dictionary; step: 1 | 2 | 3 }) {
  const t = dict.checkout;
  const steps = [t.steps.cart, t.steps.info, t.steps.done];
  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-10 md:py-5">
        <Link href={`/${locale}`} className="shrink-0">
          <Logo priority className="h-8 md:h-12" />
        </Link>
        <ol aria-label={t.steps.label} className="flex items-center gap-2 md:gap-3">
          {steps.map((label, i) => {
            const n = i + 1;
            return (
              <Fragment key={label}>
                {i > 0 ? <li aria-hidden className="h-px w-4 bg-border md:w-12" /> : null}
                <li aria-current={n === step ? 'step' : undefined} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full text-xs font-medium',
                      n <= step ? 'bg-foreground text-background' : 'border text-muted-foreground',
                    )}
                  >
                    {n < step ? <Check aria-hidden className="size-3.5" strokeWidth={2.5} /> : n}
                  </span>
                  <span
                    className={cn(
                      'text-sm max-md:sr-only',
                      n === step ? 'font-semibold' : n > step && 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </span>
                </li>
              </Fragment>
            );
          })}
        </ol>
        <div className="hidden items-center gap-4 text-sm text-muted-foreground lg:flex">
          <span className="flex items-center gap-1.5"><Lock aria-hidden className="size-4" />{t.secure}</span>
          <span className="flex items-center gap-1.5">
            <Phone aria-hidden className="size-4" />{t.support.replace('{phone}', contactHotline().value)}
          </span>
        </div>
      </div>
    </header>
  );
}
