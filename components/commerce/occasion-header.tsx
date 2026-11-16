import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { occasionSchema, type Occasion } from '@/lib/api/schemas/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { occasionContent } from '@/content/occasions';
import { cn } from '@/lib/utils/cn';

/**
 * What an Occasion's page opens with (Figma 72:3): its headline, a tab per Occasion, the
 * advice for choosing a lens, and the look video — a still with no play affordance while
 * no footage exists (CONTEXT.md "Makeup Look"). `poster` is a lens from the page.
 */
export function OccasionHeader({
  occasion, count, poster, locale, dict,
}: {
  occasion: Occasion; count: number; poster?: string; locale: Locale; dict: Dictionary;
}) {
  const c = occasionContent[occasion];
  const labels = dict.filters.sidebar.occasions;

  return (
    <header className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{c.headline[locale]}</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">{c.subline[locale].replace('{n}', String(count))}</p>
      </div>

      <nav aria-label={dict.filters.sidebar.occasion} className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex gap-2">
          {occasionSchema.options.map((o) => (
            <li key={o}>
              <Link
                href={`/${locale}/collection/${o}`}
                aria-current={o === occasion ? 'page' : undefined}
                className={cn(
                  'block whitespace-nowrap border px-4 py-2 text-sm transition-colors',
                  o === occasion ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground/40',
                )}
              >
                {labels[o]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid gap-4 md:grid-cols-[1fr_minmax(0,20rem)] md:gap-6">
        <section className="bg-muted p-4 md:p-6">
          <h2 className="text-base font-semibold md:text-lg">{c.tipsTitle[locale]}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {c.tips.map((tip) => (
              <li key={tip.vi} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {tip[locale]}
              </li>
            ))}
          </ul>
          {c.promo ? <p className="mt-4 border-t pt-4 text-sm font-medium">{c.promo[locale]}</p> : null}
        </section>

        <figure className="relative aspect-video overflow-hidden bg-muted md:aspect-auto md:min-h-44">
          {poster ? <Image src={poster} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 20rem" /> : null}
          <figcaption className="absolute inset-x-0 bottom-0 bg-foreground/70 px-4 py-3 text-sm font-medium text-background">
            {c.videoTitle[locale]}
          </figcaption>
        </figure>
      </div>
    </header>
  );
}
