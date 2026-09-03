'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Product } from '@/lib/api/schemas/catalog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export function FavoriteButton({
  productId, locale, dict,
}: {
  productId: string; locale: Locale; dict: Dictionary['favorites'];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useSessionStore((s) => s.status);
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    apiRequest<Product[]>('/api/account/favorites').then((result) => {
      if (!cancelled && result.ok) setFavorited(result.data.some((p) => p.id === productId));
    });
    return () => { cancelled = true; };
  }, [status, productId]);

  async function toggle() {
    if (status !== 'authenticated') {
      router.push(`/${locale}/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setBusy(true);
    const result = favorited
      ? await apiRequest(`/api/account/favorites/${productId}`, { method: 'DELETE' })
      : await apiRequest('/api/account/favorites', { method: 'POST', body: { productId } });
    setBusy(false);
    if (result.ok) setFavorited(!favorited);
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={busy}
      onClick={toggle}
      aria-pressed={favorited}
      className="gap-2"
    >
      <Heart className={cn('size-4', favorited && 'fill-current text-destructive')} />
      {favorited ? dict.remove : dict.add}
    </Button>
  );
}
