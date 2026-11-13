'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Loader2, PenLine } from 'lucide-react';
import type { EligibleLine } from '@/lib/api/schemas/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toIntlLocale } from '@/lib/utils/format';
import { useDesktop } from './use-desktop';

/**
 * "Viết đánh giá" on the product page, branching on the member's Review eligibility for the lens:
 * a guest signs in, one reviewable line opens its form, several open a picker, none says why.
 */
export function WriteReviewButton({ productSlug, locale, dict }: { productSlug: string; locale: Locale; dict: Dictionary }) {
  const t = dict.reviewPicker;
  const router = useRouter();
  const pathname = usePathname();
  const status = useSessionStore((s) => s.status);
  // Dialog from md up, bottom sheet below: the same split as Quick add.
  const desktop = useDesktop();
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<EligibleLine[]>([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<'notYet' | 'failed' | null>(null);
  const formHref = (l: EligibleLine) =>
    `/${locale}/account/orders/${encodeURIComponent(l.orderId)}/review/${encodeURIComponent(l.lineKey)}`;

  async function start() {
    const signIn = () => router.push(`/${locale}/sign-in?next=${encodeURIComponent(pathname)}`);
    // A still-loading session asks anyway; the server's 401 sends a guest to sign-in all the same.
    if (status === 'anonymous') return signIn();
    setBusy(true);
    setMessage(null);
    const result = await apiRequest<EligibleLine[]>(`/api/products/${encodeURIComponent(productSlug)}/reviews/eligibility`);
    setBusy(false);
    if (!result.ok) return result.error.code === 'unauthorized' ? signIn() : setMessage('failed');
    if (result.data.length === 0) return setMessage('notYet');
    if (result.data.length === 1) return router.push(formHref(result.data[0]));
    setLines(result.data);
    setOpen(true);
  }

  const date = (iso: string) =>
    new Intl.DateTimeFormat(toIntlLocale(locale), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));

  const body = (
    <div className="flex flex-col gap-5 p-4 pt-3 md:p-8">
      <div className="flex flex-col gap-1.5 pr-8">
        <DialogTitle className="text-xl font-semibold tracking-tight md:text-2xl">{t.title}</DialogTitle>
        <DialogDescription>{t.subtitle}</DialogDescription>
      </div>
      <ul className="flex flex-col gap-3">
        {lines.map((l) => (
          <li key={`${l.orderId}/${l.lineKey}`}>
            <Link
              href={formHref(l)}
              onClick={() => setOpen(false)}
              className="group flex items-center gap-4 border px-4 py-4 transition-colors hover:border-foreground focus-visible:border-foreground focus-visible:outline-none md:px-5"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-medium">{t.order.replace('{code}', l.orderCode)}</span>
                {l.variantLabel ? <span className="text-sm text-muted-foreground">{l.variantLabel}</span> : null}
                <span className="text-xs text-muted-foreground">{dict.orderDetail.placedOn}: {date(l.placedAt)}</span>
              </span>
              <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="xl" className="w-full" disabled={busy} aria-busy={busy} onClick={start}>
        {busy ? <Loader2 aria-hidden className="animate-spin" /> : <PenLine aria-hidden />}
        {dict.reviews.write}
      </Button>
      <p role="status" className="text-sm text-muted-foreground empty:hidden">
        {message === 'notYet' ? (
          <>
            {t.notYet}{' '}
            <Link href={`/${locale}/account/orders`} className="font-medium text-foreground underline underline-offset-4">
              {t.myOrders}
            </Link>
          </>
        ) : message === 'failed' ? <span className="text-destructive">{t.failed}</span> : null}
      </p>

      {/* Dialog and Sheet are the same Base UI dialog, so the body's DialogTitle serves both. */}
      {desktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent closeLabel={dict.common.close} className="gap-0 rounded-none bg-background p-0 sm:max-w-[520px]">
            {body}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" closeLabel={dict.common.close} className="max-h-[85dvh] gap-0 overflow-y-auto rounded-t-2xl bg-background">
            <span aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" />
            {body}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
