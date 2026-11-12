'use client';
import { useState } from 'react';
import { Tag } from 'lucide-react';
import type { Voucher, VoucherError } from '@/lib/api/schemas/cart';
import type { Currency } from '@/lib/api/schemas/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * "Mã ưu đãi" (Figma 57:807): a code field and the currently valid Vouchers as radios,
 * the applied one checked (CONTEXT.md "Voucher"). Choosing either re-prices the cart;
 * the server decides what applies and reports a refused code as `error`.
 */
export function VoucherPicker({
  vouchers, applied, error, onChoose, currency, locale, dict,
}: {
  vouchers: Voucher[];
  /** The code the server applied. */
  applied: string | undefined;
  error: VoucherError | undefined;
  onChoose: (code: string) => void;
  currency: Currency; locale: Locale; dict: Dictionary;
}) {
  const t = dict.cart.voucher;
  const [code, setCode] = useState('');
  const condition = (v: Voucher) =>
    v.minSpend
      ? t.minSpend.replace('{amount}', formatPrice(v.minSpend, currency, locale))
      : t.expires.replace('{date}', // "30/10" in both locales, on the shop's calendar.
        new Date(v.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }));

  return (
    <div className="flex flex-col gap-2.5">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) onChoose(code.trim());
        }}
      >
        <label htmlFor="voucher-code" className="sr-only">{t.label}</label>
        <Input
          id="voucher-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t.placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'voucher-error' : undefined}
          className="h-12 flex-1 bg-background px-4"
        />
        <Button type="submit" variant="outline" size="xl" className="border-foreground px-5">{t.apply}</Button>
      </form>
      {error ? (
        <p id="voucher-error" role="alert" className="text-sm text-destructive">
          {t.errors[error.reason].replace('{code}', error.code)}
        </p>
      ) : null}
      {vouchers.length > 0 ? (
        <div role="radiogroup" aria-label={t.list} className="flex flex-col gap-2.5">
          {vouchers.map((v) => {
            const checked = v.code === applied;
            return (
              <label
                key={v.code}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border bg-background p-3 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                  checked ? 'border-foreground' : 'hover:border-foreground/40',
                )}
              >
                <Tag aria-hidden className="size-5 shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{v.code} · {v.title}</span>
                  <span className="text-xs text-muted-foreground">{condition(v)}</span>
                </span>
                <input
                  type="radio"
                  name="voucher"
                  value={v.code}
                  checked={checked}
                  onChange={() => onChoose(v.code)}
                  className="size-5 shrink-0 cursor-pointer accent-foreground"
                />
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
