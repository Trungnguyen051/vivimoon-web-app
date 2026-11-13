'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Droplet, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { buttonVariants } from '@/components/ui/button';
import { AddToCart } from './add-to-cart';
import { useDesktop } from './use-desktop';
import { RatingStars } from './rating-stars';
import { RETURNS_FAQ } from './product-reassurance';
import { cn } from '@/lib/utils/cn';
import { formatCount } from '@/lib/utils/format';
import { lineLabel } from '@/lib/products/plp-card';

const THUMBS = 5;

/**
 * "Thêm vào giỏ" on a product card: Quick add, a dialog from md up (Figma 61:2) and a
 * bottom sheet below (196:431). Its body is the PDP's own buy box (`AddToCart`), so a
 * saved Default Rx pre-fills it and adding opens the mini cart, as on the PDP.
 */
export function QuickAdd({
  product, locale, dict, onSelect, className,
}: {
  product: Product; locale: Locale; dict: Dictionary;
  /** The list's `select_item` report, sent as Quick add opens. */
  onSelect?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // The server can't know the width; it renders the closed Dialog trigger, which is the same
  // button either way, so a phone only swaps the (still closed) root after hydration.
  const desktop = useDesktop();
  const trigger = (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${dict.common.addToCart} ${product.name}`}
      className={cn(buttonVariants({ variant: 'outline' }), className)}
    />
  );
  const label = (
    <>
      <ShoppingBag className="size-4 md:size-5" aria-hidden />
      {dict.common.addToCart}
    </>
  );
  const body = <QuickAddBody product={product} locale={locale} dict={dict} onClose={() => setOpen(false)} />;

  // Dialog and Sheet are the same Base UI dialog, so the body's DialogTitle and DialogClose serve both.
  return desktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger}>{label}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-4rem)] gap-0 overflow-y-auto rounded-none bg-background p-0 sm:max-w-[960px]"
      >
        {body}
      </DialogContent>
    </Dialog>
  ) : (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger}>{label}</SheetTrigger>
      <SheetContent side="bottom" showCloseButton={false} className="max-h-[92dvh] gap-0 overflow-y-auto rounded-t-2xl bg-background">
        <span aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" />
        {body}
      </SheetContent>
    </Sheet>
  );
}

function QuickAddBody({
  product, locale, dict, onClose,
}: {
  product: Product; locale: Locale; dict: Dictionary; onClose: () => void;
}) {
  const [active, setActive] = useState(0);
  const images = product.images.slice(0, THUMBS);
  const tag = [
    lineLabel(product, dict),
    product.comfort ? dict.quickAdd.wearUpTo.replace('{n}', String(product.comfort.wearHours)) : undefined,
    product.comfort?.sensitiveEyes ? dict.quickAdd.sensitiveOk : undefined,
  ].filter(Boolean).join(' · ');

  return (
    // Any link (the PDP, the power guide, the policy) closes it, so the card's next page never opens on it.
    <div
      onClick={(e) => { if ((e.target as Element).closest('a')) onClose(); }}
      className="flex flex-col gap-5 p-4 pt-3 md:grid md:grid-cols-[400px_minmax(0,1fr)] md:gap-8 md:p-8"
    >
      <div className="hidden flex-col gap-3 md:flex">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {images[active] ? <Image src={images[active]} alt={product.name} fill sizes="400px" className="object-cover" /> : null}
        </div>
        {images.length > 1 ? (
          <div className="flex gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`${dict.common.image} ${i + 1}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  'relative size-[72px] overflow-hidden bg-muted transition-shadow',
                  i === active ? 'ring-1 ring-foreground' : 'hover:ring-1 hover:ring-border',
                )}
              >
                <Image src={src} alt="" fill sizes="72px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex items-start gap-3">
          {images[0] ? (
            <div className="relative size-[92px] shrink-0 overflow-hidden bg-muted md:hidden">
              <Image src={images[0]} alt="" fill sizes="92px" className="object-cover" />
            </div>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <DialogTitle className="text-2xl font-semibold tracking-tight md:text-[32px] md:leading-10">{product.name}</DialogTitle>
            {product.reviewCount > 0 || product.soldCount ? (
              <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground md:text-sm">
                {product.reviewCount > 0 ? (
                  <>
                    <RatingStars rating={product.rating} label={dict.common.rating} outOfLabel={dict.common.outOf} />
                    <span>{product.rating.toFixed(1)}</span>
                  </>
                ) : null}
                {product.reviewCount > 0 && product.soldCount ? <span aria-hidden>·</span> : null}
                {product.soldCount ? <span>{dict.pdp.sold.replace('{n}', formatCount(product.soldCount, locale))}</span> : null}
              </div>
            ) : null}
          </div>
          <DialogClose className="-mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-muted">
            <X className="size-6" aria-hidden />
            <span className="sr-only">{dict.common.close}</span>
          </DialogClose>
        </div>

        <AddToCart product={product} locale={locale} dict={dict} quick onAdded={onClose}>
          {tag ? (
            <p className="flex items-center gap-2 self-start rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Droplet className="size-4 shrink-0" aria-hidden />
              {tag}
            </p>
          ) : null}
        </AddToCart>

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          <span>
            {dict.returnPolicy.terms} ·{' '}
            <Link href={`/${locale}/support/${RETURNS_FAQ}#faq-dieu-kien-doi-tra`} className="text-foreground underline underline-offset-2">
              {dict.returnPolicy.link}
            </Link>
          </span>
        </p>
        <Link
          href={`/${locale}/product/${product.slug}`}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium underline underline-offset-4 hover:text-primary"
        >
          {dict.quickAdd.details}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
