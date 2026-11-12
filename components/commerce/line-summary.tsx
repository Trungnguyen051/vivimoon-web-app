import { isSingleRx, purchaseUnitOf, type LineRx, type PurchaseUnit } from '@/lib/api/schemas/rx';
import { formatSph } from '@/lib/products/rx-ranges';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const power = (sph: number) => formatSph(sph).replace('-', '−');

/**
 * The one line-summary format shared by the cart, checkout and order views
 * (ADR-0023): "1 chiếc · −2.50", "1 đôi · L −2.50 · R −3.00",
 * "1 đôi · Không độ". Null for a line with no Rx. A unit-less line is a pair.
 */
export function formatLineSummary(line: { purchaseUnit?: PurchaseUnit; rx?: LineRx }, dict: Dictionary): string | null {
  const { rx } = line;
  if (!rx) return null;
  const unit = dict.rx.units[purchaseUnitOf(line) ?? 'pair'];
  if (isSingleRx(rx)) return `${unit} · ${rx.sph === 0 ? dict.rx.noPower : power(rx.sph)}`;
  if (rx.left.sph === 0 && rx.right.sph === 0) return `${unit} · ${dict.rx.noPower}`;
  return `${unit} · ${dict.rx.left} ${power(rx.left.sph)} · ${dict.rx.right} ${power(rx.right.sph)}`;
}

/** Tells two lines of one variant apart by unit and power (spec §7). */
export function LineSummary({ line, dict }: { line: { purchaseUnit?: PurchaseUnit; rx?: LineRx }; dict: Dictionary }) {
  const text = formatLineSummary(line, dict);
  return text ? <p className="text-sm text-muted-foreground">{text}</p> : null;
}
