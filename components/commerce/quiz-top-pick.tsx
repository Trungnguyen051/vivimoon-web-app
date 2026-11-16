import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cheapestVariant } from '@/lib/products/cheapest-variant';
import { specLine } from '@/lib/products/plp-card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { PriceTag } from './price-tag';
import { QuickAdd } from './quick-add';

/**
 * The Quiz's best match, featured above the results grid (Figma 71:220): its match
 * percentage, why it suits the answers, and the two ways on — Quick add or the product.
 */
export function QuizTopPick({
  product, percent, reasons, locale, dict,
}: {
  product: Product; percent: number; reasons: string[]; locale: Locale; dict: Dictionary;
}) {
  const t = dict.quiz.topPick;
  const v = cheapestVariant(product);
  const href = `/${locale}/product/${product.slug}`;

  return (
    <section aria-label={t.eyebrow} className="grid gap-5 border border-primary bg-primary/5 p-4 sm:grid-cols-[minmax(0,14rem)_1fr] md:gap-8 md:p-6">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-muted" aria-hidden="true" tabIndex={-1}>
        {product.images[0] ? (
          <Image src={product.images[0]} alt="" fill className="object-cover" sizes="(max-width:640px) 100vw, 14rem" />
        ) : null}
        <span className="absolute left-2 top-2 bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          {t.badge.replace('{percent}', String(percent))}
        </span>
      </Link>
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">{t.eyebrow}</p>
        <div>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            <Link href={href} className="hover:text-primary">{product.name}</Link>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{specLine(product, dict)}</p>
        </div>
        {reasons.length > 0 ? (
          <ul className="space-y-1.5 text-sm">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {reason}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex items-baseline gap-1.5">
          <PriceTag price={v.price} currency={v.currency} locale={locale} className="text-lg md:text-xl" />
          <span className="text-xs text-muted-foreground">{dict.pdp.perUnit.single}</span>
        </div>
        <div className="mt-auto flex flex-wrap gap-3">
          <QuickAdd
            product={product}
            locale={locale}
            dict={dict}
            label={t.quickAdd}
            className="h-11 gap-2 rounded-none border-foreground bg-foreground px-6 text-sm text-background hover:bg-foreground/85 hover:text-background"
          />
          <Link href={href} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 rounded-none border-foreground px-6 text-sm')}>
            {t.details}
          </Link>
        </div>
      </div>
    </section>
  );
}
