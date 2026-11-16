'use client';
import { useEffect, useState, type ReactNode, type Ref } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { SearchSuggestions } from '@/lib/api/resources/catalog';
import { apiRequest } from '@/lib/api/client';
import { popularSearches } from '@/content/search';
import { cheapestVariant } from '@/lib/products/cheapest-variant';
import { FACET_COLLECTION } from '@/lib/products/lens-facets';
import { categoryLabel } from '@/lib/products/search';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

/** This device's last Searches, newest first (CONTEXT.md "Search"). Never sent anywhere. */
const RECENT_KEY = 'vivimoon:recent-searches';
const RECENT_MAX = 5;
/** How long typing has to pause before suggestions are asked for. */
const SUGGEST_DELAY_MS = 250;

function readRecent(): string[] {
  try {
    // Device storage is untrusted: anything but a list of strings reads as none.
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function writeRecent(recent: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    // Storage blocked: the search still works, it just isn't remembered.
  }
}

function Group({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * The Search field and its panel (Figma 64:615). Before typing: popular keywords and this
 * device's recent Searches. While typing: Suggested Categories, the first matching lenses
 * and a way to all results. The field is a plain GET form, so Enter opens the results
 * listing with or without JavaScript.
 *
 * `floating` hangs the panel under the field (the header); otherwise it sits in the flow
 * and shows once the field is used (the mobile menu). `onNavigate` runs when a link in the
 * panel is followed; `onDismiss` when focus leaves the box or Escape is pressed.
 */
export function SearchBox({
  locale, dict, floating = false, inputRef, onNavigate, onDismiss, className,
}: {
  locale: Locale; dict: Dictionary; floating?: boolean; inputRef?: Ref<HTMLInputElement>;
  onNavigate?: () => void; onDismiss?: () => void; className?: string;
}) {
  const t = dict.search;
  const [text, setText] = useState('');
  const [used, setUsed] = useState(floating);
  const [recent, setRecent] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<({ q: string } & SearchSuggestions) | null>(null);
  const q = text.trim();

  useEffect(() => {
    if (!q) return;
    let stale = false;
    const timer = setTimeout(async () => {
      const res = await apiRequest<SearchSuggestions>(`/api/search/suggest?q=${encodeURIComponent(q)}`);
      // A slower, older answer must not replace what the shopper has typed since.
      if (!stale && res.ok) setSuggestions({ q, ...res.data });
    }, SUGGEST_DELAY_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [q]);

  const resultsHref = (words: string) => `/${locale}/collection/${FACET_COLLECTION}?q=${encodeURIComponent(words)}`;

  /** Opening a Search's results is what makes it a recent one. */
  function remember(words: string) {
    const next = [words, ...readRecent().filter((r) => r.toLowerCase() !== words.toLowerCase())].slice(0, RECENT_MAX);
    writeRecent(next);
    setRecent(next);
  }
  const open = (words: string) => () => {
    remember(words);
    onNavigate?.();
  };

  const current = suggestions?.q === q ? suggestions : null;
  const chip = 'border px-3 py-1.5 text-sm transition-colors hover:border-foreground/40';

  return (
    <div
      className={className}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) onDismiss?.();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onDismiss?.();
      }}
    >
      <form
        action={`/${locale}/collection/${FACET_COLLECTION}`}
        role="search"
        onSubmit={() => remember(q)}
        className={cn(
          'flex items-center gap-2 border bg-background focus-within:border-ring',
          floating ? 'rounded-full px-4' : 'rounded-md px-3',
        )}
      >
        <Search aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          name="q"
          type="search"
          required
          maxLength={80}
          autoComplete="off"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setUsed(true);
          }}
          // A click or typing, not focus alone: the mobile menu focuses this field just by opening.
          onClick={() => setUsed(true)}
          // The device's storage is read when the field is reached, not during render: the server has none.
          onFocus={() => setRecent(readRecent())}
          aria-label={dict.common.search}
          placeholder={dict.common.search}
          className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </form>

      {used ? (
        <div
          // Keeps the field focused while a link is pressed, so the box isn't dismissed before the click lands.
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'space-y-5 bg-background text-left',
            floating ? 'absolute inset-x-0 top-full mt-2 max-h-[70vh] overflow-y-auto border p-5 shadow-lg' : 'pt-4',
          )}
        >
          {!q ? (
            <>
              <Group title={t.popular}>
                <ul className="flex flex-wrap gap-2">
                  {popularSearches[locale].map((keyword) => (
                    <li key={keyword}>
                      <Link href={resultsHref(keyword)} onClick={open(keyword)} className={chip}>{keyword}</Link>
                    </li>
                  ))}
                </ul>
              </Group>
              {recent.length > 0 ? (
                <Group
                  title={t.recent}
                  action={
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      onClick={() => {
                        writeRecent([]);
                        setRecent([]);
                      }}
                    >
                      {t.clearRecent}
                    </button>
                  }
                >
                  <ul className="flex flex-wrap gap-2">
                    {recent.map((words) => (
                      <li key={words}>
                        <Link href={resultsHref(words)} onClick={open(words)} className={chip}>{words}</Link>
                      </li>
                    ))}
                  </ul>
                </Group>
              ) : null}
            </>
          ) : !current ? null : current.total === 0 ? (
            <p className="text-sm text-muted-foreground">{t.none.replace('{q}', q)}</p>
          ) : (
            <>
              {current.categories.length > 0 ? (
                <Group title={t.categories}>
                  <ul className="flex flex-wrap gap-2">
                    {current.categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/${locale}/collection/${FACET_COLLECTION}?${category.query}`}
                          onClick={onNavigate}
                          className={chip}
                        >
                          {categoryLabel(category.id, dict)} ({category.count})
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Group>
              ) : null}
              <Group title={t.products}>
                <ul className="divide-y">
                  {current.products.map((product) => {
                    const v = cheapestVariant(product);
                    return (
                      <li key={product.id}>
                        <Link
                          href={`/${locale}/product/${product.slug}`}
                          onClick={onNavigate}
                          className="flex items-center justify-between gap-4 py-2 text-sm hover:text-primary"
                        >
                          <span>{product.name}</span>
                          <span className="shrink-0 text-muted-foreground">{formatPrice(v.price, v.currency, locale)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Group>
              <Link href={resultsHref(q)} onClick={open(q)} className="block text-sm font-medium underline underline-offset-4">
                {t.seeAll.replace('{n}', String(current.total)).replace('{q}', q)}
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
