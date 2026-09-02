import type { Rx, RxEye } from '@/lib/api/schemas/rx';
import { formatSph } from '@/lib/products/rx-ranges';
import type { Dictionary } from '@/lib/i18n/dictionaries';

function eyeSummary(eye: RxEye, dict: Dictionary): string {
  const parts = [formatSph(eye.sph)];
  if (eye.add) parts.push(dict.rx.addBands[eye.add]);
  return parts.join(' ');
}

/**
 * Compact one-line render of a prescription, for cart/checkout/order lines —
 * so two lines of the same variant at different powers read as distinct
 * lines rather than a duplicate-line bug (spec §7).
 *
 * Pure presentation: no cyl/axis, no fetching, takes an already-parsed `Rx`.
 */
export function RxSummary({ rx, dict }: { rx: Rx; dict: Dictionary }) {
  const text = rx.sameBothEyes
    ? eyeSummary(rx.right, dict)
    : `${dict.rx.rightEye} ${eyeSummary(rx.right, dict)} · ${dict.rx.leftEye} ${eyeSummary(rx.left, dict)}`;

  return (
    <p className="text-sm text-muted-foreground">
      {dict.rx.summaryLabel}: {text}
    </p>
  );
}
