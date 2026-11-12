import { parseRxPair, type LensGalleryContexts, type Product } from '@/lib/api/schemas/catalog';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { MATERIAL_VALUES } from './lens-facets';

/** "Xem ảnh" on the PLP (#195). `face` (Người mẫu) is the default and never written to the URL. */
export const CARD_VIEWS = ['eye', 'face', 'closeUp'] as const;
export type CardView = (typeof CARD_VIEWS)[number];
export const parseCardView = (value: string | undefined): CardView =>
  CARD_VIEWS.find((v) => v === value) ?? 'face';

/** A card's photo for a view. Without a gallery entry the product's own images stand in. */
export function cardImage(product: Product, gallery: LensGalleryContexts | undefined, view: CardView): string {
  const [first, second] = product.images;
  if (view === 'eye') return gallery?.eye[0] ?? first;
  if (view === 'face') return gallery?.face[0] ?? second ?? first;
  return gallery?.closeUp?.[0] ?? first;
}

const mm = (spec: string) => spec.replace(/\s*mm$/i, '');

/** The Dòng lens the sidebar filters on ("Khoá ẩm"), if the material maps to one. */
export function lineLabel(product: Product, dict: Dictionary): string | undefined {
  const line = MATERIAL_VALUES.find((m) => m.material === product.specs.material);
  return line ? dict.collection.card.lines[line.id] : undefined;
}

/** "Khoá ẩm · 1 tháng · DIA 14.2 · GDIA 13.3" — the Dòng lens the sidebar filters on, then replacement, DIA, GDIA. */
export function specLine(product: Product, dict: Dictionary): string {
  return [
    lineLabel(product, dict),
    dict.filters.replacements[product.replacement],
    product.specs.diameter ? `DIA ${mm(product.specs.diameter)}` : undefined,
    product.specs.graphicDiameter ? `GDIA ${mm(product.specs.graphicDiameter)}` : undefined,
  ].filter(Boolean).join(' · ');
}

/**
 * Filter groups as the shopper sees them in the sidebar: Màu sắc covers colour and the
 * clear line, Khoảng giá covers min and max, and Độ của bạn (`rx=L,R`, #196) is one.
 */
const FILTER_GROUPS: string[][] = [
  ['material'], ['color', 'productLine'], ['replacement'], ['diameter'], ['makeupStyle'],
  ['series'], ['occasion'], ['minPrice', 'maxPrice'], ['brandId'],
];

/** A malformed `rx` filters nothing (#196), so it isn't a group either. */
export const activeFilterGroups = (params: Record<string, string | undefined>) =>
  FILTER_GROUPS.filter((keys) => keys.some((key) => params[key])).length
  + (params.rx && parseRxPair(params.rx) ? 1 : 0);

/** The designer's "Rule hiện / ẩn card Quiz" (Figma PLP 55:2). */
export const showQuizCard = (params: Record<string, string | undefined>, total: number) =>
  params.from !== 'quiz' && activeFilterGroups(params) < 2 && total >= 6;
