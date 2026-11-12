import { isSingleRx, purchaseUnitOf, type LineRx, type PurchaseUnit } from '@/lib/api/schemas/rx';
import { formatSph } from '@/lib/products/rx-ranges';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const power = (sph: number) => formatSph(sph).replace('-', '−');

type SummaryLine = { purchaseUnit?: PurchaseUnit; rx?: LineRx; variantLabel?: string; quantity?: number };

/**
 * The one line-summary format shared by the cart, checkout and order views
 * (ADR-0023): "1 chiếc · −2.50", "1 đôi · L −2.50 · R −3.00",
 * "1 đôi · Không độ", and an accessory's "120ml · x1". Null for a line with
 * neither an Rx nor a variant label. A unit-less line with an Rx is a pair.
 */
export function formatLineSummary(line: SummaryLine, dict: Dictionary): string | null {
  const { rx } = line;
  if (!rx) return line.variantLabel ? `${line.variantLabel} · x${line.quantity ?? 1}` : null;
  return `${dict.rx.units[purchaseUnitOf(line) ?? 'pair']} · ${formatPowers(rx, dict)}`;
}

/** Just the power part of the summary: "−2.50", "L −2.50 · R −3.00" or "Không độ". */
export function formatPowers(rx: LineRx, dict: Dictionary): string {
  if (isSingleRx(rx)) return formatPower(rx.sph, dict);
  if (rx.left.sph === 0 && rx.right.sph === 0) return dict.rx.noPower;
  return `${dict.rx.left} ${power(rx.left.sph)} · ${dict.rx.right} ${power(rx.right.sph)}`;
}

/** One power as the summary shows it, "−2.50" or "Không độ". */
export const formatPower = (sph: number, dict: Dictionary): string => (sph === 0 ? dict.rx.noPower : power(sph));

/**
 * A cart line's title, the same on every cart surface: "Sandkiss · Khoá ẩm 1 tháng" — the
 * name, then the Dòng lens the PLP card labels (`collection.card.lines`) and the replacement.
 */
export function lineTitle(
  line: { name: string; lensLine?: 'moisture' | 'breathable'; replacement?: keyof Dictionary['filters']['replacements'] },
  dict: Dictionary,
): string {
  const spec = [
    line.lensLine && dict.collection.card.lines[line.lensLine],
    line.replacement && dict.filters.replacements[line.replacement],
  ].filter(Boolean).join(' ');
  return spec ? `${line.name} · ${spec}` : line.name;
}

/** Tells two lines of one variant apart by unit and power (spec §7). */
export function LineSummary({ line, dict }: { line: SummaryLine; dict: Dictionary }) {
  const text = formatLineSummary(line, dict);
  return text ? <p className="text-sm text-muted-foreground">{text}</p> : null;
}
