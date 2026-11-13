'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThumbsUp } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils/cn';
import { toIntlLocale } from '@/lib/utils/format';

type Vote = { hasVoted: boolean; voteCount: number; userId?: string };

/**
 * "Hữu ích" on a Review: a Helpful Vote that shows at once and rolls back if the request fails.
 * The count is the marketplace's plus Vivimoon's votes. Only a count on the member's own Review.
 */
export function HelpfulButton({
  reviewId, marketplaceCount, voteCount, hasVoted, isOwn = false, locale, dict,
}: {
  reviewId: string; marketplaceCount: number; voteCount: number; hasVoted: boolean; isOwn?: boolean;
  locale: Locale; dict: Dictionary['reviews'];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useSessionStore((s) => s.status);
  const userId = useSessionStore((s) => s.user?.id);
  // The member's own vote once they've tapped; until then, what the server said.
  const [mine, setMine] = useState<Vote | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  // A tap belongs to whoever made it: after sign-out or a switch of account, the server's flags apply again.
  const vote = mine && mine.userId === userId ? mine : { hasVoted, voteCount };
  const label = dict.helpful.replace('{n}', (marketplaceCount + vote.voteCount).toLocaleString(toIntlLocale(locale)));

  if (isOwn) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <ThumbsUp className="size-4" />
        {label}
      </p>
    );
  }

  async function toggle() {
    const signIn = () => router.push(`/${locale}/sign-in?next=${encodeURIComponent(pathname)}`);
    // A still-loading session tries the vote; the server's 401 sends a guest to sign-in all the same.
    if (status === 'anonymous') return signIn();
    if (busy) return;
    const on = !vote.hasVoted;
    setMine({ hasVoted: on, voteCount: vote.voteCount + (on ? 1 : -1), userId });
    setFailed(false);
    setBusy(true);
    const result = await apiRequest<{ hasVoted: boolean; helpfulVoteCount: number }>(
      `/api/reviews/${reviewId}/helpful`, { method: on ? 'POST' : 'DELETE' },
    );
    setBusy(false);
    if (result.ok) {
      setMine({ hasVoted: result.data.hasVoted, voteCount: result.data.helpfulVoteCount, userId });
    } else {
      setMine(mine);
      if (result.error.code === 'unauthorized') signIn(); else setFailed(true);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        aria-pressed={vote.hasVoted}
        aria-busy={busy}
        onClick={toggle}
        className={cn(
          '-ml-2 flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition-colors hover:bg-muted',
          vote.hasVoted ? 'font-medium text-foreground' : 'text-muted-foreground',
        )}
      >
        <ThumbsUp className={cn('size-4', vote.hasVoted && 'fill-current')} />
        {label}
      </button>
      <span role="status" className="text-xs text-destructive">
        {failed ? dict.helpfulFailed : null}
      </span>
    </div>
  );
}
