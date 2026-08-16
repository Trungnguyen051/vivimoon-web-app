'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const TYPES = ['clear', 'colored', 'toric', 'multifocal'];
const REPLACEMENTS = ['daily', 'biweekly', 'monthly'];
const SORTS = ['newest', 'price-asc', 'price-desc', 'bestselling'];

export function CollectionFilters({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <select aria-label={dict.filters.type} value={params.get('type') ?? ''} onChange={(e) => setParam('type', e.target.value)} className="rounded border px-2 py-1 text-sm">
        <option value="">{dict.filters.type}</option>
        {TYPES.map((t) => <option key={t} value={t}>{dict.filters.types[t as keyof typeof dict.filters.types]}</option>)}
      </select>
      <select aria-label={dict.filters.replacement} value={params.get('replacement') ?? ''} onChange={(e) => setParam('replacement', e.target.value)} className="rounded border px-2 py-1 text-sm">
        <option value="">{dict.filters.replacement}</option>
        {REPLACEMENTS.map((r) => <option key={r} value={r}>{dict.filters.replacements[r as keyof typeof dict.filters.replacements]}</option>)}
      </select>
      <select aria-label={dict.filters.sort} value={params.get('sort') ?? ''} onChange={(e) => setParam('sort', e.target.value)} className="rounded border px-2 py-1 text-sm">
        <option value="">{dict.filters.sort}</option>
        {SORTS.map((s) => <option key={s} value={s}>{dict.filters.sorts[s as keyof typeof dict.filters.sorts]}</option>)}
      </select>
      <button onClick={() => router.push(pathname)} className="text-sm underline">{dict.filters.clear}</button>
    </div>
  );
}
