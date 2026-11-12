import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Order Lookup's one field (ADR-0022). A plain GET form to the Track Order
 * page, so the result lives at `?code=` — refreshable and shareable — and the
 * form works before any JavaScript loads.
 */
export function OrderLookupForm({ locale, dict, defaultCode }: {
  locale: Locale; dict: Dictionary['tracking']; defaultCode?: string;
}) {
  return (
    <form action={`/${locale}/orders/track`} method="get" role="search" className="flex w-full max-w-[500px]">
      <label htmlFor="order-code" className="sr-only">{dict.code}</label>
      <Input
        id="order-code" name="code" type="text" defaultValue={defaultCode} placeholder={dict.placeholder}
        required autoComplete="off" spellCheck={false}
        className="h-11 flex-1 rounded-none border-r-0 bg-background px-4"
      />
      <Button type="submit" className="h-11 rounded-none px-6">{dict.submit}</Button>
    </form>
  );
}
