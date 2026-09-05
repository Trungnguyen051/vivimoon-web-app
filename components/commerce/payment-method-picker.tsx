'use client';
import { paymentMethods, type PaymentMethodOption } from '@/lib/payments/methods';
import { cn } from '@/lib/utils/cn';

/**
 * Renders whatever `methods` holds — never a hardcoded list. Defaults to
 * `lib/payments/methods.ts` so a caller needs no wiring change when that
 * config grows; `methods` exists so tests can inject a stub list without
 * touching this component (spec §11). Takes a plain `label` rather than a
 * `Dictionary` slice — checkout and Account Settings each have their own
 * copy for it (M5.3, issue #20), so the picker itself stays agnostic to
 * which dictionary section a caller draws that string from.
 */
export function PaymentMethodPicker({
  value, onChange, label, methods = paymentMethods,
}: {
  value: string | undefined;
  onChange: (type: string) => void;
  label: string;
  methods?: PaymentMethodOption[];
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {methods.map((m) => (
          <button
            key={m.type}
            type="button"
            aria-pressed={value === m.type}
            onClick={() => onChange(m.type)}
            className={cn(
              'min-h-11 rounded-lg border px-4 text-sm font-medium transition-colors',
              value === m.type
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-input text-muted-foreground hover:border-foreground/30 hover:text-foreground',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
