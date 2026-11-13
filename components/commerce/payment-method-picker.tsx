'use client';
import { Banknote, CreditCard, History, QrCode, type LucideIcon } from 'lucide-react';
import { paymentMethods, type PaymentMethodOption } from '@/lib/payments/methods';
import type { PaymentMethodType } from '@/lib/api/schemas/payments';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { RadioCard } from './radio-card';

const ICONS: Partial<Record<PaymentMethodType, LucideIcon>> = { qr: QrCode, cod: Banknote, ewallet: CreditCard };

/**
 * Checkout's "Thanh toán" radio cards (Figma 58:126, ADR-0025). Renders whatever
 * `methods` holds — never a hardcoded list; `methods` exists so tests can inject a
 * stub without touching this component (spec §11). `remembered` adds the member's
 * "Đã chọn sẵn theo lần mua trước" tag.
 */
export function PaymentMethodPicker({
  value, onChange, dict, remembered = false, methods = paymentMethods,
}: {
  value: string;
  onChange: (type: PaymentMethodType) => void;
  dict: Dictionary;
  remembered?: boolean;
  methods?: PaymentMethodOption[];
}) {
  const t = dict.checkout.payment;
  return (
    <div className="flex flex-col gap-3">
      {remembered ? (
        <p className="flex w-fit items-center gap-2 bg-muted px-3 py-2 text-xs text-muted-foreground">
          <History aria-hidden className="size-4" />
          {t.remembered}
        </p>
      ) : null}
      <div role="radiogroup" aria-label={t.title} className="flex flex-col gap-3">
        {methods.map((m) => {
          const copy = t.methods[m.type as keyof typeof t.methods] ?? { name: m.type, hint: '' };
          return (
            <RadioCard
              key={m.type}
              name="payment-method"
              value={m.type}
              checked={value === m.type}
              onChange={() => onChange(m.type)}
              icon={ICONS[m.type] ?? CreditCard}
              title={copy.name}
              hint={copy.hint || undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
