'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const TYPES = ['clear', 'colored', 'toric', 'multifocal'];
const REPLACEMENTS = ['daily', 'biweekly', 'monthly'];
const SORTS = ['newest', 'price-asc', 'price-desc', 'bestselling'];
const ALL = 'all';

export function CollectionFilters({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const hasFilters = ['type', 'replacement', 'sort'].some((k) => params.get(k));

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== ALL) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select value={params.get('type') ?? ALL} onValueChange={(v) => setParam('type', v)}>
        <SelectTrigger className="w-40" aria-label={dict.filters.type}>
          <SelectValue placeholder={dict.filters.type} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ALL}>{dict.filters.type}</SelectItem>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>{dict.filters.types[t as keyof typeof dict.filters.types]}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={params.get('replacement') ?? ALL} onValueChange={(v) => setParam('replacement', v)}>
        <SelectTrigger className="w-40" aria-label={dict.filters.replacement}>
          <SelectValue placeholder={dict.filters.replacement} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ALL}>{dict.filters.replacement}</SelectItem>
            {REPLACEMENTS.map((r) => (
              <SelectItem key={r} value={r}>{dict.filters.replacements[r as keyof typeof dict.filters.replacements]}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={params.get('sort') ?? ALL} onValueChange={(v) => setParam('sort', v)}>
        <SelectTrigger className="w-40" aria-label={dict.filters.sort}>
          <SelectValue placeholder={dict.filters.sort} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ALL}>{dict.filters.sort}</SelectItem>
            {SORTS.map((s) => (
              <SelectItem key={s} value={s}>{dict.filters.sorts[s as keyof typeof dict.filters.sorts]}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          {dict.filters.clear}
        </Button>
      ) : null}
    </div>
  );
}
